import { Context, Next } from 'hono';
import { createClient } from '@supabase/supabase-js';

export const authMiddleware = async (c: Context, next: Next) => {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ error: 'Unauthorized - Missing or invalid token' }, 401);
    }

    const token = authHeader.substring(7);

    // Get Supabase credentials from environment
    const supabaseUrl = process.env.SUPABASE_URL || c.env?.SUPABASE_URL || process.env.VITE_SUPABASE_URL || c.env?.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || c.env?.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || c.env?.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        console.error('Missing Supabase credentials');
        return c.json({ error: 'Server configuration error' }, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
        console.error('Auth error:', error?.message);
        return c.json({ error: 'Invalid or expired token' }, 401);
    }

    // Add user to context for use in routes
    c.set('user', user);
    c.set('userId', user.id);

    await next();
};
