import React from 'react';
import { useSyncStatus } from '../hooks/useSyncStatus';

export const SyncStatusIndicator: React.FC = () => {
    const { isOnline, pendingOperations, isSyncing } = useSyncStatus();

    const getStatusColor = () => {
        if (!isOnline && pendingOperations > 0) return 'bg-red-500';
        if (isSyncing) return 'bg-yellow-500';
        if (isOnline && pendingOperations === 0) return 'bg-green-500';
        return 'bg-gray-500';
    };

    const getStatusText = () => {
        if (!isOnline && pendingOperations > 0) return `Offline (${pendingOperations} pendentes)`;
        if (isSyncing) return 'Sincronizando...';
        if (isOnline && pendingOperations === 0) return 'Sincronizado';
        return 'Offline';
    };

    return (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 glass-card px-3 py-2 rounded-full border border-white/10">
            <div className={`w-2 h-2 rounded-full ${getStatusColor()} ${isSyncing ? 'animate-pulse' : ''}`} />
            <span className="text-xs text-white font-medium">{getStatusText()}</span>
        </div>
    );
};
