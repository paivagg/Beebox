import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';

const transactions = new Hono();

const getSupabase = (c: any) => {
    const supabaseUrl = process.env.SUPABASE_URL || c.env?.SUPABASE_URL || process.env.VITE_SUPABASE_URL || c.env?.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || c.env?.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || c.env?.VITE_SUPABASE_ANON_KEY;
    return createClient(supabaseUrl, supabaseAnonKey);
};

// GET /api/transactions
transactions.get('/', async (c) => {
    try {
        const supabase = getSupabase(c);
        const playerId = c.req.query('player_id');

        let query = supabase
            .from('transactions')
            .select('*')
            .order('date', { ascending: false });

        if (playerId) {
            query = query.eq('player_id', playerId);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching transactions:', error);
            return c.json({ error: error.message }, 500);
        }

        return c.json(data || []);
    } catch (err) {
        console.error('Unexpected error:', err);
        return c.json({ error: 'Internal server error' }, 500);
    }
});

// GET /api/transactions/:id
transactions.get('/:id', async (c) => {
    try {
        const id = c.req.param('id');
        const supabase = getSupabase(c);

        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return c.json({ error: 'Transaction not found' }, 404);
            }
            return c.json({ error: error.message }, 500);
        }

        return c.json(data);
    } catch (err) {
        return c.json({ error: 'Internal server error' }, 500);
    }
});

// POST /api/transactions
transactions.post('/', async (c) => {
    try {
        const body = await c.req.json();
        const supabase = getSupabase(c);

        const transactionData = {
            ...body,
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('transactions')
            .insert(transactionData)
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

export { transactions as transactionsRoutes };
