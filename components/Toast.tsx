import React, { useEffect } from 'react';
import { Toast as ToastType } from '../hooks/useToast';

interface ToastProps {
    toast: ToastType;
    onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
    useEffect(() => {
        if (toast.duration && toast.duration > 0) {
            const timer = setTimeout(() => {
                onClose(toast.id);
            }, toast.duration);

            return () => clearTimeout(timer);
        }
    }, [toast.id, toast.duration, onClose]);

    const getIcon = () => {
        switch (toast.type) {
            case 'success':
                return 'check_circle';
            case 'error':
                return 'error';
            case 'warning':
                return 'warning';
            case 'info':
            default:
                return 'info';
        }
    };

    const getColorClasses = () => {
        switch (toast.type) {
            case 'success':
                return 'bg-green-500/90 text-white';
            case 'error':
                return 'bg-red-500/90 text-white';
            case 'warning':
                return 'bg-yellow-500/90 text-white';
            case 'info':
            default:
                return 'bg-blue-500/90 text-white';
        }
    };

    return (
        <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg backdrop-blur-md ${getColorClasses()} animate-slide-in-top`}
            style={{ minWidth: '280px', maxWidth: '400px' }}
        >
            <span className="material-symbols-outlined text-2xl">{getIcon()}</span>
            <p className="flex-1 font-medium text-sm">{toast.message}</p>
            <button
                onClick={() => onClose(toast.id)}
                className="hover:bg-white/20 rounded-full p-1 transition-colors"
            >
                <span className="material-symbols-outlined text-lg">close</span>
            </button>
        </div>
    );
};

interface ToastContainerProps {
    toasts: ToastType[];
    onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 pointer-events-none">
            <div className="flex flex-col gap-2 pointer-events-auto">
                {toasts.map((toast) => (
                    <Toast key={toast.id} toast={toast} onClose={onClose} />
                ))}
            </div>
        </div>
    );
};

export default Toast;
