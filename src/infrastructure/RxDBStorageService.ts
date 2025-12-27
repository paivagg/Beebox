import { createRxDatabase, RxDatabase, RxCollection, addRxPlugin } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { replicateRxCollection } from 'rxdb/plugins/replication';
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv';
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update';
import { RxDBMigrationSchemaPlugin } from 'rxdb/plugins/migration-schema';
import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';
import { IStorageService } from '../core/interfaces/IStorageService';
import { Player, Product, Event, Transaction } from '../../types';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SyncQueue } from './SyncQueue';
import { setSyncStatusObservable } from '../../hooks/useSyncStatus';
import {
    playerSchema,
    productSchema,
    eventSchema,
    transactionSchema,
    PlayerDocType,
    ProductDocType,
    EventDocType,
    TransactionDocType,
    StoreProfileDocType,
    StoreSettingsDocType,
    SyncQueueDocType,
    storeProfileSchema,
    storeSettingsSchema,
    syncQueueSchema
} from '../db/schema';

addRxPlugin(RxDBDevModePlugin);
addRxPlugin(RxDBQueryBuilderPlugin);
addRxPlugin(RxDBUpdatePlugin);
addRxPlugin(RxDBMigrationSchemaPlugin);

type MyDatabaseCollections = {
    players: RxCollection<PlayerDocType>;
    products: RxCollection<ProductDocType>;
    events: RxCollection<EventDocType>;
    transactions: RxCollection<TransactionDocType>;
    store_profile: RxCollection<StoreProfileDocType>;
    store_settings: RxCollection<StoreSettingsDocType>;
    sync_queue: RxCollection<SyncQueueDocType>;
};

type MyDatabase = RxDatabase<MyDatabaseCollections>;
export class RxDBStorageService implements IStorageService {
    private dbPromise: Promise<MyDatabase>;
    private supabase: SupabaseClient;
    private syncQueue: SyncQueue | null = null;

    constructor() {
        this.supabase = supabase;
        this.dbPromise = this.initDB();
    }

    private async initDB(): Promise<MyDatabase> {
        const db = await createRxDatabase<MyDatabaseCollections>({
            name: 'tcg_store_db_v9',
            storage: wrappedValidateAjvStorage({
                storage: getRxStorageDexie()
            }),
            ignoreDuplicate: true
        });

        await db.addCollections({
            players: {
                schema: playerSchema,
                migrationStrategies: {
                    1: (oldDoc) => oldDoc
                }
            },
            products: {
                schema: productSchema,
                migrationStrategies: {
                    1: (oldDoc) => oldDoc
                }
            },
            events: {
                schema: eventSchema,
                migrationStrategies: {
                    1: (oldDoc) => oldDoc
                }
            },
            transactions: {
                schema: transactionSchema,
                migrationStrategies: {
                    1: (oldDoc) => oldDoc
                }
            },
            store_profile: {
                schema: storeProfileSchema,
                migrationStrategies: {
                    1: (oldDoc) => oldDoc
                }
            },
            store_settings: {
                schema: storeSettingsSchema,
                migrationStrategies: {
                    1: (oldDoc) => oldDoc
                }
            },
            sync_queue: {
                schema: syncQueueSchema,
                migrationStrategies: {
                    1: (oldDoc) => oldDoc
                }
            }
        });

        // Initialize SyncQueue
        this.syncQueue = new SyncQueue(db);
        setSyncStatusObservable(this.syncQueue.getStatus());

        // Setup replication for each collection
        this.setupReplication(db.players, 'players');
        this.setupReplication(db.products, 'products');
        this.setupReplication(db.events, 'events');
        this.setupReplication(db.transactions, 'transactions');
        this.setupReplication(db.store_profile, 'store_profile');
        this.setupReplication(db.store_settings, 'store_settings');

        return db;
    }

    private setupReplication(collection: RxCollection<any>, tableName: string) {
        replicateRxCollection({
            collection,
            replicationIdentifier: `supabase-${tableName}`,
            pull: {
                handler: async (lastCheckpoint: any) => {
                    let query = this.supabase
                        .from(tableName)
                        .select('*')
                        .order('updated_at', { ascending: true });

                    if (lastCheckpoint) {
                        query = query.gt('updated_at', lastCheckpoint.updated_at);
                    }

                    const { data, error } = await query.limit(100);
                    if (error) {
                        console.error(`Pull error for ${tableName}:`, error);
                        throw error;
                    }

                    // Conflict resolution: Last-Write-Wins (LWW)
                    const resolvedDocs = [];
                    for (const remoteDoc of data || []) {
                        const localDoc = await collection.findOne(remoteDoc.id).exec();
                        if (localDoc) {
                            const localData = localDoc.toJSON();
                            const localTime = new Date(localData.updated_at || 0).getTime();
                            const remoteTime = new Date(remoteDoc.updated_at || 0).getTime();

                            if (localTime > remoteTime) {
                                // Local wins - add to sync queue
                                console.log(`[Conflict] Local wins for ${tableName}/${remoteDoc.id}`);
                                if (this.syncQueue) {
                                    await this.syncQueue.add('update', tableName as any, localData);
                                }
                                continue; // Skip remote doc
                            }
                        }
                        resolvedDocs.push(remoteDoc);
                    }

                    return {
                        documents: resolvedDocs,
                        checkpoint: data && data.length > 0 ? { updated_at: data[data.length - 1].updated_at } : lastCheckpoint
                    };
                }
            },
            push: {
                handler: async (docs: any[]) => {
                    try {
                        const { error } = await this.supabase
                            .from(tableName)
                            .upsert(docs.map(doc => {
                                const { _rev, _attachments, _deleted, ...cleanDoc } = doc.newDocumentState;
                                return { ...cleanDoc, updated_at: new Date().toISOString() };
                            }));
                        if (error) {
                            console.error(`Push error for ${tableName}:`, error);
                            // Add to sync queue for retry
                            if (this.syncQueue) {
                                for (const doc of docs) {
                                    const { _rev, _attachments, _deleted, ...cleanDoc } = doc.newDocumentState;
                                    await this.syncQueue.add('update', tableName as any, cleanDoc);
                                }
                            }
                            throw error;
                        }
                        return [];
                    } catch (error) {
                        console.error(`Push handler error for ${tableName}:`, error);
                        throw error;
                    }
                },
                batchSize: 5
            },
            live: true,
            retryTime: 5000
        });
    }

    // Players
    async getPlayers(): Promise<Player[]> {
        const db = await this.dbPromise;
        const docs = await db.players.find().exec();
        return docs.map(doc => doc.toJSON() as Player);
    }

    async savePlayer(player: Player): Promise<void> {
        const db = await this.dbPromise;
        await db.players.upsert(player);
    }

    async updatePlayer(player: Player): Promise<void> {
        const db = await this.dbPromise;
        await db.players.upsert(player);
    }

    async deletePlayer(id: string): Promise<void> {
        const db = await this.dbPromise;
        const doc = await db.players.findOne(id).exec();
        if (doc) await doc.remove();
    }

    // Products
    async getProducts(): Promise<Product[]> {
        const db = await this.dbPromise;
        const docs = await db.products.find().exec();
        return docs.map(doc => doc.toJSON() as Product);
    }

    async saveProduct(product: Product): Promise<void> {
        const db = await this.dbPromise;
        await db.products.upsert(product);
    }

    async updateProduct(product: Product): Promise<void> {
        const db = await this.dbPromise;
        await db.products.upsert(product);
    }

    // Events
    async getEvents(): Promise<Event[]> {
        const db = await this.dbPromise;
        const docs = await db.events.find().exec();
        return docs.map(doc => doc.toJSON() as Event);
    }

    async saveEvent(event: Event): Promise<void> {
        const db = await this.dbPromise;
        await db.events.upsert(event);
    }

    async updateEvent(event: Event): Promise<void> {
        const db = await this.dbPromise;
        await db.events.upsert(event);
    }

    async deleteEvent(id: string): Promise<void> {
        const db = await this.dbPromise;
        const doc = await db.events.findOne(id).exec();
        if (doc) await doc.remove();
    }

    // Transactions
    async getTransactions(): Promise<Transaction[]> {
        const db = await this.dbPromise;
        const docs = await db.transactions.find().sort({ date: 'desc' }).exec();
        return docs.map(doc => doc.toJSON() as Transaction);
    }

    async saveTransaction(transaction: Transaction): Promise<void> {
        const db = await this.dbPromise;
        await db.transactions.insert(transaction);
    }

    async deleteTransaction(id: string): Promise<void> {
        const db = await this.dbPromise;
        const doc = await db.transactions.findOne(id).exec();
        if (doc) await doc.remove();
    }

    // System
    async clearAll(): Promise<void> {
        const db = await this.dbPromise;
        await Promise.all([
            db.players.find().remove(),
            db.products.find().remove(),
            db.events.find().remove(),
            db.transactions.find().remove(),
            db.store_profile.find().remove(),
            db.store_settings.find().remove()
        ]);
    }

    // Store Profile
    async getStoreProfile(): Promise<any> {
        const db = await this.dbPromise;
        const doc = await db.store_profile.findOne({ selector: { id: 'current' } }).exec();
        return doc ? doc.toJSON() : null;
    }

    async saveStoreProfile(profile: any): Promise<void> {
        const db = await this.dbPromise;
        await db.store_profile.upsert({ ...profile, id: 'current' });
    }

    // Store Settings
    async getStoreSettings(): Promise<any> {
        const db = await this.dbPromise;
        const doc = await db.store_settings.findOne({ selector: { id: 'current' } }).exec();
        return doc ? doc.toJSON() : null;
    }

    async saveStoreSettings(settings: any): Promise<void> {
        const db = await this.dbPromise;
        await db.store_settings.upsert({ ...settings, id: 'current' });
    }

    // Helper to check if DB is empty (for migration)
    async isEmpty(): Promise<boolean> {
        const db = await this.dbPromise;
        const players = await db.players.findOne().exec();
        return !players;
    }

    // Observable methods for reactive subscriptions
    getPlayers$(): Observable<Player[]> {
        return new Observable(observer => {
            this.dbPromise.then(db => {
                const subscription = db.players.find().$.pipe(
                    map(docs => docs.map(doc => doc.toJSON() as Player))
                ).subscribe(observer);
                return () => subscription.unsubscribe();
            });
        });
    }

    getProducts$(): Observable<Product[]> {
        return new Observable(observer => {
            this.dbPromise.then(db => {
                const subscription = db.products.find().$.pipe(
                    map(docs => docs.map(doc => doc.toJSON() as Product))
                ).subscribe(observer);
                return () => subscription.unsubscribe();
            });
        });
    }

    getEvents$(): Observable<Event[]> {
        return new Observable(observer => {
            this.dbPromise.then(db => {
                const subscription = db.events.find().$.pipe(
                    map(docs => docs.map(doc => doc.toJSON() as Event))
                ).subscribe(observer);
                return () => subscription.unsubscribe();
            });
        });
    }

    getTransactions$(): Observable<Transaction[]> {
        return new Observable(observer => {
            this.dbPromise.then(db => {
                const subscription = db.transactions.find().sort({ date: 'desc' }).$.pipe(
                    map(docs => docs.map(doc => doc.toJSON() as Transaction))
                ).subscribe(observer);
                return () => subscription.unsubscribe();
            });
        });
    }

    getStoreProfile$(): Observable<any> {
        return new Observable(observer => {
            this.dbPromise.then(db => {
                const subscription = db.store_profile.findOne({ selector: { id: 'current' } }).$.pipe(
                    map(doc => doc ? doc.toJSON() : null)
                ).subscribe(observer);
                return () => subscription.unsubscribe();
            });
        });
    }

    getStoreSettings$(): Observable<any> {
        return new Observable(observer => {
            this.dbPromise.then(db => {
                const subscription = db.store_settings.findOne({ selector: { id: 'current' } }).$.pipe(
                    map(doc => doc ? doc.toJSON() : null)
                ).subscribe(observer);
                return () => subscription.unsubscribe();
            });
        });
    }

    getSyncStatus() {
        return this.syncQueue?.getStatus();
    }
}
