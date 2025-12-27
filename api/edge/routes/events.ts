import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';

const events = new Hono();

const getSupabase = (c: any) => {
    const supabaseUrl = process.env.SUPABASE_URL || c.env?.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || c.env?.SUPABASE_ANON_KEY;
    return createClient(supabaseUrl, supabaseAnonKey);
};

// GET /api/events
events.get('/', async (c) => {
    try {
        const supabase = getSupabase(c);

        const { data, error } = await supabase
            .from('events')
            .select('*')
            .order('date');

        if (error) {
            console.error('Error fetching events:', error);
            return c.json({ error: error.message }, 500);
        }

        return c.json(data || []);
    } catch (err) {
        console.error('Unexpected error:', err);
        return c.json({ error: 'Internal server error' }, 500);
    }
});

// GET /api/events/:id
events.get('/:id', async (c) => {
    try {
        const id = c.req.param('id');
        const supabase = getSupabase(c);

        const { data, error } = await supabase
            .from('events')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return c.json({ error: 'Event not found' }, 404);
            }
            return c.json({ error: error.message }, 500);
        }

        return c.json(data);
    } catch (err) {
        return c.json({ error: 'Internal server error' }, 500);
    }
});

// POST /api/events
events.post('/', async (c) => {
    try {
        const body = await c.req.json();
        const supabase = getSupabase(c);

        const eventData = {
            ...body,
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('events')
            .insert(eventData)
            .select()
            .single();

        if (error) {
            return c.json({ error: error.message }, 500);
        }

        return c.json(data, 201);
    } catch (err) {
        return c.json({ error: 'Internal server error' }, 500);
    }
});

// PUT /api/events/:id
events.put('/:id', async (c) => {
    try {
        const id = c.req.param('id');
        const body = await c.req.json();
        const supabase = getSupabase(c);

        const eventData = {
            ...body,
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('events')
            .update(eventData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return c.json({ error: 'Event not found' }, 404);
            }
            return c.json({ error: error.message }, 500);
        }

        return c.json(data);
    } catch (err) {
        return c.json({ error: 'Internal server error' }, 500);
    }
});

// DELETE /api/events/:id
events.delete('/:id', async (c) => {
    try {
        const id = c.req.param('id');
        const supabase = getSupabase(c);

        const { error } = await supabase
            .from('events')
            .delete()
            .eq('id', id);

        if (error) {
            return c.json({ error: error.message }, 500);
        }

        return c.json({ message: 'Event deleted successfully' });
    } catch (err) {
        return c.json({ error: 'Internal server error' }, 500);
    }
});

// POST /api/events/:id/finalize - Special endpoint for event finalization
events.post('/:id/finalize', async (c) => {
    try {
        const id = c.req.param('id');
        const supabase = getSupabase(c);

        // Get event
        const { data: event, error: eventError } = await supabase
            .from('events')
            .select('*')
            .eq('id', id)
            .single();

        if (eventError || !event) {
            return c.json({ error: 'Event not found' }, 404);
        }

        if (event.status === 'finalized') {
            return c.json({ error: 'Event already finalized' }, 400);
        }

        // Get pending participants
        const pendingParticipants = event.participants?.filter((p: any) => !p.paid) || [];

        if (pendingParticipants.length === 0) {
            // Just update status
            const { error: updateError } = await supabase
                .from('events')
                .update({ status: 'finalized', updated_at: new Date().toISOString() })
                .eq('id', id);

            if (updateError) {
                return c.json({ error: updateError.message }, 500);
            }

            return c.json({
                message: 'Event finalized',
                processed: 0,
                total: 0
            });
        }

        // Create transactions and update player balances
        for (const participant of pendingParticipants) {
            // Create transaction
            await supabase.from('transactions').insert({
                id: crypto.randomUUID(),
                player_id: participant.player_id,
                type: 'debit',
                category: 'event',
                event_id: id,
                title: `Inscrição: ${event.title}`,
                date: new Date().toISOString(),
                amount: event.price,
                icon: 'emoji_events',
                updated_at: new Date().toISOString()
            });

            // Update player balance
            const { data: player } = await supabase
                .from('players')
                .select('balance')
                .eq('id', participant.player_id)
                .single();

            if (player) {
                await supabase
                    .from('players')
                    .update({
                        balance: player.balance - event.price,
                        last_activity: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', participant.player_id);
            }
        }

        // Update event status and mark participants as paid
        const updatedParticipants = event.participants?.map((p: any) => ({
            ...p,
            paid: true
        })) || [];

        const { error: finalizeError } = await supabase
            .from('events')
            .update({
                status: 'finalized',
                participants: updatedParticipants,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (finalizeError) {
            return c.json({ error: finalizeError.message }, 500);
        }

        return c.json({
            message: 'Event finalized successfully',
            processed: pendingParticipants.length,
            total: pendingParticipants.length * event.price
        });
    } catch (err) {
        console.error('Error finalizing event:', err);
        return c.json({ error: 'Internal server error' }, 500);
    }
});

export { events as eventsRoutes };
