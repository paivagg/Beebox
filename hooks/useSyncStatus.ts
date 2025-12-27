import { useState, useEffect } from 'react';
import { SyncStatus } from '../src/infrastructure/SyncQueue';

// This will be initialized when RxDBStorageService is ready
let syncStatusObservable: any = null;

export const setSyncStatusObservable = (observable: any) => {
    syncStatusObservable = observable;
};

export const useSyncStatus = (): SyncStatus => {
    const [status, setStatus] = useState<SyncStatus>({
        isOnline: navigator.onLine,
        pendingOperations: 0,
        lastSync: new Date(),
        isSyncing: false
    });

    useEffect(() => {
        if (!syncStatusObservable) {
            // Fallback to basic online/offline detection
            const handleOnline = () => setStatus(prev => ({ ...prev, isOnline: true }));
            const handleOffline = () => setStatus(prev => ({ ...prev, isOnline: false }));

            window.addEventListener('online', handleOnline);
            window.addEventListener('offline', handleOffline);

            return () => {
                window.removeEventListener('online', handleOnline);
                window.removeEventListener('offline', handleOffline);
            };
        }

        const subscription = syncStatusObservable.subscribe(setStatus);
        return () => subscription.unsubscribe();
    }, []);

    return status;
};
