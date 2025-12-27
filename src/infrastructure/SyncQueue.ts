import { RxDatabase, RxCollection } from 'rxdb';
import { BehaviorSubject, Observable } from 'rxjs';
import { SyncQueueDocType } from '../db/schema';

export interface SyncQueueItem {
    id: string;
    operation: 'create' | 'update' | 'delete';
    targetCollection: 'players' | 'products' | 'events' | 'transactions' | 'store_profile' | 'store_settings';
    data: any;
    retries: number;
    lastAttempt?: string;
    error?: string;
    created_at: string;
}

export interface SyncStatus {
    isOnline: boolean;
    pendingOperations: number;
    lastSync: Date;
    isSyncing: boolean;
}

const MAX_RETRIES = 5;
const BASE_DELAY = 1000; // 1 second
const MAX_DELAY = 32000; // 32 seconds

export class SyncQueue {
    private db: any; // RxDatabase with any collections
    private queueCollection: RxCollection<SyncQueueDocType>;
    private statusSubject: BehaviorSubject<SyncStatus>;
    private isProcessing = false;
    private onlineListener: () => void;

    constructor(db: any) {
        this.db = db;
        this.queueCollection = db.sync_queue;

        this.statusSubject = new BehaviorSubject<SyncStatus>({
            isOnline: navigator.onLine,
            pendingOperations: 0,
            lastSync: new Date(),
            isSyncing: false
        });

        // Listen to online/offline events
        this.onlineListener = () => {
            this.updateStatus({ isOnline: navigator.onLine });
            if (navigator.onLine) {
                this.processQueue();
            }
        };

        window.addEventListener('online', this.onlineListener);
        window.addEventListener('offline', this.onlineListener);

        // Initialize pending count
        this.updatePendingCount();
    }

    async add(operation: SyncQueueItem['operation'], targetCollection: SyncQueueItem['targetCollection'], data: any): Promise<void> {
        const item: SyncQueueItem = {
            id: crypto.randomUUID(),
            operation,
            targetCollection,
            data,
            retries: 0,
            created_at: new Date().toISOString()
        };

        await this.queueCollection.insert(item as any);
        await this.updatePendingCount();

        console.log(`[SyncQueue] Operação adicionada à fila: ${operation} ${targetCollection}`, item.id);

        // Try to process immediately if online
        if (navigator.onLine) {
            this.processQueue();
        }
    }

    async processQueue(): Promise<void> {
        if (this.isProcessing || !navigator.onLine) {
            return;
        }

        this.isProcessing = true;
        this.updateStatus({ isSyncing: true });

        try {
            const items = await this.queueCollection
                .find()
                .where('retries')
                .lt(MAX_RETRIES)
                .exec();

            console.log(`[SyncQueue] Processando ${items.length} operações pendentes`);

            for (const item of items) {
                await this.processItem(item);
            }

            this.updateStatus({
                lastSync: new Date(),
                isSyncing: false
            });
        } catch (error) {
            console.error('[SyncQueue] Erro ao processar fila:', error);
            this.updateStatus({ isSyncing: false });
        } finally {
            this.isProcessing = false;
            await this.updatePendingCount();
        }
    }

    private async processItem(item: any): Promise<void> {
        const data = item.toJSON() as SyncQueueItem;

        try {
            // Calculate exponential backoff delay
            const delay = Math.min(BASE_DELAY * Math.pow(2, data.retries), MAX_DELAY);
            const timeSinceLastAttempt = data.lastAttempt
                ? Date.now() - new Date(data.lastAttempt).getTime()
                : delay;

            // Skip if not enough time has passed since last attempt
            if (timeSinceLastAttempt < delay) {
                return;
            }

            console.log(`[SyncQueue] Tentando sincronizar: ${data.operation} ${data.targetCollection} (tentativa ${data.retries + 1})`);

            // Simulate API call (replace with actual API service)
            await this.syncToBackend(data);

            // Success - remove from queue
            await item.remove();
            console.log(`[SyncQueue] Sincronização bem-sucedida: ${data.id}`);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            console.error(`[SyncQueue] Falha na sincronização: ${data.id}`, errorMessage);

            // Update retry count and error
            await item.update({
                $set: {
                    retries: data.retries + 1,
                    lastAttempt: new Date().toISOString(),
                    error: errorMessage
                }
            });

            // Remove if max retries reached
            if (data.retries + 1 >= MAX_RETRIES) {
                console.error(`[SyncQueue] Max retries atingido, removendo da fila: ${data.id}`);
                await item.remove();
            }
        }
    }

    private async syncToBackend(item: SyncQueueItem): Promise<void> {
        // This will be integrated with ApiService
        // For now, we'll simulate the sync
        const endpoint = this.getEndpoint(item.targetCollection, item.operation, item.data.id);
        const method = this.getHttpMethod(item.operation);

        // Simulate network request
        const response = await fetch(endpoint, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: item.operation !== 'delete' ? JSON.stringify(item.data) : undefined
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
    }

    private getEndpoint(collection: string, operation: string, id?: string): string {
        const base = '/api'; // Replace with actual API base URL
        if (operation === 'delete' || operation === 'update') {
            return `${base}/${collection}/${id}`;
        }
        return `${base}/${collection}`;
    }

    private getHttpMethod(operation: SyncQueueItem['operation']): string {
        switch (operation) {
            case 'create': return 'POST';
            case 'update': return 'PUT';
            case 'delete': return 'DELETE';
        }
    }

    private async updatePendingCount(): Promise<void> {
        const count = await this.queueCollection.count().exec();
        this.updateStatus({ pendingOperations: count });
    }

    private updateStatus(partial: Partial<SyncStatus>): void {
        const current = this.statusSubject.value;
        this.statusSubject.next({ ...current, ...partial });
    }

    getStatus(): Observable<SyncStatus> {
        return this.statusSubject.asObservable();
    }

    getCurrentStatus(): SyncStatus {
        return this.statusSubject.value;
    }

    destroy(): void {
        window.removeEventListener('online', this.onlineListener);
        window.removeEventListener('offline', this.onlineListener);
        this.statusSubject.complete();
    }
}
