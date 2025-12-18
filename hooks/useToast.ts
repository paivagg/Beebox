import { useState, useCallback } from 'react';
import { DEFAULT_SETTINGS } from '../utils/constants';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface UseToastReturn {
    toasts: Toast[];
    showToast: (message: string, type?: ToastType, duration?: number) => void;
    hideToast: (id: string) => void;
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
}

/**
 * Hook para gerenciar notificações toast
 * @returns Objeto com toasts e funções para mostrar/esconder
 */
export const useToast = (): UseToastReturn => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const hideToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const showToast = useCallback(
        (message: string, type: ToastType = 'info', duration: number = DEFAULT_SETTINGS.TOAST_DURATION) => {
            const id = crypto.randomUUID();
            const newToast: Toast = { id, message, type, duration };

            setToasts((prev) => [...prev, newToast]);

            // Auto-dismiss após a duração especificada
            if (duration > 0) {
                setTimeout(() => {
                    hideToast(id);
                }, duration);
            }
        },
        [hideToast]
    );

    const success = useCallback(
        (message: string, duration?: number) => {
            showToast(message, 'success', duration);
        },
        [showToast]
    );

    const error = useCallback(
        (message: string, duration?: number) => {
            showToast(message, 'error', duration);
        },
        [showToast]
    );

    const warning = useCallback(
        (message: string, duration?: number) => {
            showToast(message, 'warning', duration);
        },
        [showToast]
    );

    const info = useCallback(
        (message: string, duration?: number) => {
            showToast(message, 'info', duration);
        },
        [showToast]
    );

    return {
        toasts,
        showToast,
        hideToast,
        success,
        error,
        warning,
        info,
    };
};
