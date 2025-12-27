import { Hono, Context } from 'hono';
import { cors } from 'hono/cors';
import { handle } from 'hono/vercel';
import { db } from './db';
import { players, products, events, transactions, storeProfile, storeSettings } from './db/schema';
import { eq } from 'drizzle-orm';
import { authMiddleware } from './middleware/auth';

export const config = {
    runtime: 'edge'
};

const app = new Hono().basePath('/api');

app.use('/*', cors());
app.use('/players/*', authMiddleware);
app.use('/products/*', authMiddleware);
app.use('/events/*', authMiddleware);
app.use('/transactions/*', authMiddleware);
app.use('/store/*', authMiddleware);

app.get('/', (c: Context) => {
    return c.text('TCG Store Manager API is running!');
});

app.get('/health', (c: Context) => {
    return c.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// --- Players ---
app.get('/players', async (c: Context) => {
    const allPlayers = await db.select().from(players);
    return c.json(allPlayers);
});

app.post('/players', async (c: Context) => {
    const body = await c.req.json();
    const result = await db.insert(players).values(body).returning();
    return c.json(result[0], 201);
});

app.put('/players/:id', async (c: Context) => {
    const id = c.req.param('id');
    const body = await c.req.json();
    const result = await db.update(players).set(body).where(eq(players.id, id)).returning();
    return c.json(result[0]);
});

// --- Products ---
app.get('/products', async (c: Context) => {
    const allProducts = await db.select().from(products);
    return c.json(allProducts);
});

app.post('/products', async (c: Context) => {
    const body = await c.req.json();
    const result = await db.insert(products).values(body).returning();
    return c.json(result[0], 201);
});

app.put('/products/:id', async (c: Context) => {
    const id = c.req.param('id');
    const body = await c.req.json();
    const result = await db.update(products).set(body).where(eq(products.id, id)).returning();
    return c.json(result[0]);
});

// --- Events ---
app.get('/events', async (c: Context) => {
    const allEvents = await db.select().from(events);
    return c.json(allEvents);
});

app.post('/events', async (c: Context) => {
    const body = await c.req.json();
    const result = await db.insert(events).values(body).returning();
    return c.json(result[0], 201);
});

app.put('/events/:id', async (c: Context) => {
    const id = c.req.param('id');
    const body = await c.req.json();
    const result = await db.update(events).set(body).where(eq(events.id, id)).returning();
    return c.json(result[0]);
});

// --- Transactions ---
app.get('/transactions', async (c: Context) => {
    const allTransactions = await db.select().from(transactions);
    return c.json(allTransactions);
});

app.post('/transactions', async (c: Context) => {
    const body = await c.req.json();
    const result = await db.insert(transactions).values(body).returning();
    return c.json(result[0], 201);
});

// --- Store Profile & Settings ---
app.get('/store/profile', async (c: Context) => {
    const profile = await db.select().from(storeProfile).limit(1);
    return c.json(profile[0] || null);
});

app.post('/store/profile', async (c: Context) => {
    const body = await c.req.json();
    const result = await db.insert(storeProfile).values({ id: 'current', ...body }).onConflictDoUpdate({
        target: storeProfile.id,
        set: body
    }).returning();
    return c.json(result[0]);
});

app.get('/store/settings', async (c: Context) => {
    const settings = await db.select().from(storeSettings).limit(1);
    return c.json(settings[0] || null);
});

app.post('/store/settings', async (c: Context) => {
    const body = await c.req.json();
    const result = await db.insert(storeSettings).values({ id: 'current', ...body }).onConflictDoUpdate({
        target: storeSettings.id,
        set: body
    }).returning();
    return c.json(result[0]);
});

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);

export default app;
