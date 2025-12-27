import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';

const players = new Hono();

// Helper to get Supabase client
const getSupabase = (c: any) => {
    const supabaseUrl = process.env.SUPABASE_URL || c.env?.SUPABASE_URL || process.env.VITE_SUPABASE_URL || c.env?.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || c.env?.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || c.env?.VITE_SUPABASE_ANON_KEY;
    return createClient(supabaseUrl, supabaseAnonKey);
};

// GET /api/players - List all players
players.get('/', async (c) => {
    try {
        const supabase = getSupabase(c);

        const { data, error } = await supabase
            .from('players')
            .select('*')
            .order('name');

        if (error) {
            console.error('Error fetching players:', error);
            return c.json({ error: error.message }, 500);
        }

        return c.json(data || []);
    } catch (err) {
        console.error('Unexpected error:', err);
        return c.json({ error: 'Internal server error' }, 500);
    }
});

// GET /api/players/:id - Get player by ID
players.get('/:id', async (c) => {
    try {
        const id = c.req.param('id');
        const supabase = getSupabase(c);

        const { data, error } = await supabase
            .from('players')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return c.json({ error: 'Player not found' }, 404);
            }
            console.error('Error fetching player:', error);
            return c.json({ error: error.message }, 500);
        }

        return c.json(data);
    } catch (err) {
        console.error('Unexpected error:', err);
        return c.json({ error: 'Internal server error' }, 500);
    }
});

// POST /api/players - Create new player
players.post('/', async (c) => {
    try {
        const body = await c.req.json();
        const supabase = getSupabase(c);

        // Add updated_at timestamp
        const playerData = {
            ...body,
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('players')
            .insert(playerData)
            .select()
            .single();

        if (error) {
            console.error('Error creating player:', error);
            return c.json({ error: error.message }, 500);
        }

        return c.json(data, 201);
    } catch (err) {
        console.error('Unexpected error:', err);
        return c.json({ error: 'Internal server error' }, 500);
    }
});

// PUT /api/players/:id - Update player
players.put('/:id', async (c) => {
    try {
        const id = c.req.param('id');
        const body = await c.req.json();
        const supabase = getSupabase(c);

        // Add updated_at timestamp
        const playerData = {
            ...body,
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('players')
            .update(playerData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return c.json({ error: 'Player not found' }, 404);
            }
            console.error('Error updating player:', error);
            return c.json({ error: error.message }, 500);
        }

        return c.json(data);
    } catch (err) {
        console.error('Unexpected error:', err);
        return c.json({ error: 'Internal server error' }, 500);
    }
});

// DELETE /api/players/:id - Delete player
players.delete('/:id', async (c) => {
    try {
        const id = c.req.param('id');
        const supabase = getSupabase(c);

        const { error } = await supabase
            .from('players')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting player:', error);
            return c.json({ error: error.message }, 500);
        }

        return c.json({ message: 'Player deleted successfully' });
    } catch (err) {
        console.error('Unexpected error:', err);
        return c.json({ error: 'Internal server error' }, 500);
    }
});

export { players as playersRoutes };
