import { pgTable, text, decimal, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const players = pgTable('players', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    nickname: text('nickname'),
    avatarUrl: text('avatar_url'),
    dci: text('dci'),
    balance: decimal('balance', { precision: 10, scale: 2 }).notNull().default('0'),
    lastActivity: timestamp('last_activity').defaultNow()
});

export const products = pgTable('products', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    category: text('category').notNull(),
    stock: integer('stock').notNull().default(0),
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    imageUrl: text('image_url'),
    collection: text('collection'),
    costPrice: decimal('cost_price', { precision: 10, scale: 2 })
});

export const events = pgTable('events', {
    id: text('id').primaryKey(),
    date: timestamp('date').notNull(),
    title: text('title').notNull(),
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    time: text('time').notNull(),
    maxEnrolled: integer('max_enrolled').notNull(),
    participants: jsonb('participants').default([]), // Storing participants as JSONB for now to match NoSQL structure
    status: text('status').default('scheduled') // 'scheduled' | 'finalized'
});

export const transactions = pgTable('transactions', {
    id: text('id').primaryKey(),
    playerId: text('player_id').references(() => players.id),
    type: text('type').notNull(), // 'credit' | 'debit'
    category: text('category'), // 'product' | 'event' | 'deposit' | 'adjustment'
    eventId: text('event_id'),
    title: text('title').notNull(),
    date: timestamp('date').notNull(),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    icon: text('icon')
});

export const storeProfile = pgTable('store_profile', {
    id: text('id').primaryKey(), // Singleton 'current'
    name: text('name').notNull(),
    avatarUrl: text('avatar_url'),
    role: text('role')
});

export const storeSettings = pgTable('store_settings', {
    id: text('id').primaryKey(), // Singleton 'current'
    notifications: boolean('notifications').default(true),
    darkMode: boolean('notifications').default(true),
    soundEffects: boolean('sound_effects').default(true)
});
