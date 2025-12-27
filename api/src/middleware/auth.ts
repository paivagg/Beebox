import { Context, Next } from 'hono';
import { createClient } from '@supabase/supabase-js';

export const authMiddleware = async (c: Context, next: Next) => {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ error: 'Unauthorized: Missing or invalid token' }, 401);
    }

    const token = authHeader.split(' ')[1];
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('Supabase credentials missing in backend');
        return c.json({ error: 'Internal Server Error: Auth configuration missing' }, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
        return c.json({ error: 'Unauthorized: Invalid token' }, 401);
    }

    // Attach user to context for use in routes if needed
    c.set('user', user);

    await next();
};
