import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';

const products = new Hono();

const getSupabase = (c: any) => {
    const supabaseUrl = process.env.SUPABASE_URL || c.env?.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || c.env?.SUPABASE_ANON_KEY;
    return createClient(supabaseUrl, supabaseAnonKey);
};

// GET /api/products
products.get('/', async (c) => {
    try {
        const supabase = getSupabase(c);

        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('name');

        if (error) {
            console.error('Error fetching products:', error);
            return c.json({ error: error.message }, 500);
        }

        return c.json(data || []);
    } catch (err) {
        console.error('Unexpected error:', err);
        return c.json({ error: 'Internal server error' }, 500);
    }
});

// GET /api/products/:id
products.get('/:id', async (c) => {
    try {
        const id = c.req.param('id');
        const supabase = getSupabase(c);

        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return c.json({ error: 'Product not found' }, 404);
            }
            return c.json({ error: error.message }, 500);
        }

        return c.json(data);
    } catch (err) {
        return c.json({ error: 'Internal server error' }, 500);
    }
});

// POST /api/products
products.post('/', async (c) => {
    try {
        const body = await c.req.json();
        const supabase = getSupabase(c);

        const productData = {
            ...body,
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('products')
            .insert(productData)
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

// PUT /api/products/:id
products.put('/:id', async (c) => {
    try {
        const id = c.req.param('id');
        const body = await c.req.json();
        const supabase = getSupabase(c);

        const productData = {
            ...body,
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('products')
            .update(productData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return c.json({ error: 'Product not found' }, 404);
            }
            return c.json({ error: error.message }, 500);
        }

        return c.json(data);
    } catch (err) {
        return c.json({ error: 'Internal server error' }, 500);
    }
});

export { products as productsRoutes };
