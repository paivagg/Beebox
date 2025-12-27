import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { playersRoutes } from './routes/players';
import { productsRoutes } from './routes/products';
import { eventsRoutes } from './routes/events';
import { transactionsRoutes } from './routes/transactions';
import { authMiddleware } from './middleware/auth';

const app = new Hono();

// Global middleware
app.use('*', cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
}));
app.use('*', logger());

// Health check (public)
app.get('/api/health', (c) => c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '2.0.0-edge'
}));

// Protected routes
app.use('/api/*', authMiddleware);
app.route('/api/players', playersRoutes);
app.route('/api/products', productsRoutes);
app.route('/api/events', eventsRoutes);
app.route('/api/transactions', transactionsRoutes);

// 404 handler
app.notFound((c) => c.json({ error: 'Not Found' }, 404));

// Error handler
app.onError((err, c) => {
    console.error('API Error:', err);
    return c.json({
        error: err.message || 'Internal Server Error'
    }, 500);
});

export const config = {
    runtime: 'edge'
};

export default app;
