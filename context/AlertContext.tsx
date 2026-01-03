import React, { createContext, useContext, useState, useCallback } from 'react';
import { ResponsiveModal } from '../components';

interface AlertOptions {
    title?: string;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    onConfirm?: () => void;
    confirmText?: string;
}

interface AlertContextType {
    showAlert: (options: AlertOptions) => void;
    hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within an AlertProvider');
    }
    return context;
};

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [alertConfig, setAlertConfig] = useState<AlertOptions | null>(null);

    const showAlert = useCallback((options: AlertOptions) => {
        setAlertConfig(options);
        setIsOpen(true);
    }, []);

    const hideAlert = useCallback(() => {
        setIsOpen(false);
        if (alertConfig?.onConfirm) {
            // Optional: call onConfirm when closing? 
            // Usually onConfirm is for a specific button. 
            // Let's keep it simple: hideAlert just closes.
        }
        setTimeout(() => setAlertConfig(null), 300); // Clear after animation
    }, [alertConfig]);

    const handleConfirm = () => {
        if (alertConfig?.onConfirm) {
            alertConfig.onConfirm();
        }
        hideAlert();
    };

    const getIcon = () => {
        switch (alertConfig?.type) {
            case 'success': return 'check_circle';
            case 'error': return 'error';
            case 'warning': return 'warning';
            case 'info': return 'info';
            default: return 'info';
        }
    };

    const getColor = () => {
        switch (alertConfig?.type) {
            case 'success': return 'text-positive';
            case 'error': return 'text-negative';
            case 'warning': return 'text-yellow-500';
            case 'info': return 'text-primary';
            default: return 'text-primary';
        }
    };

    return (
        <AlertContext.Provider value={{ showAlert, hideAlert }}>
            {children}

            {alertConfig && (
                <ResponsiveModal
                    isOpen={isOpen}
                    onClose={hideAlert}
                    title={alertConfig.title || 'Aviso do Sistema'}
                    size="sm"
                >
                    <div className="flex flex-col items-center text-center p-4">
                        <span className={`material-symbols-outlined text-5xl mb-4 ${getColor()}`}>
                            {getIcon()}
                        </span>

                        <p className="text-white text-lg mb-8">
                            {alertConfig.message}
                        </p>

                        <button
                            onClick={handleConfirm}
                            className="w-full py-3.5 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/30 active:scale-95 transition-all"
                        >
                            {alertConfig.confirmText || 'OK'}
                        </button>
                    </div>
                </ResponsiveModal>
            )}
        </AlertContext.Provider>
    );
};
