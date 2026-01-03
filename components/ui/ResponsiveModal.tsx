import React, { useEffect } from 'react';

interface ResponsiveModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const ResponsiveModal: React.FC<ResponsiveModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    className = ''
}) => {
    // Fechar com ESC
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            // Prevenir scroll do body quando modal aberto
            document.body.style.overflow = 'hidden';

            return () => {
                document.removeEventListener('keydown', handleKeyDown);
                document.body.style.overflow = 'unset';
            };
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-2xl'
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-end md:items-center 
                justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div
                className={`glass-card w-full ${sizeClasses[size]} 
                  rounded-t-3xl md:rounded-3xl p-6 
                  border-t md:border border-white/10 
                  shadow-2xl animate-slide-up md:animate-zoom-in
                  max-h-[90vh] overflow-y-auto
                  ${className}`}
                onClick={e => e.stopPropagation()}
                style={{
                    paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))'
                }}
            >
                {/* Header com botão fechar */}
                <div className="flex items-center justify-between mb-6 sticky top-0 
                      bg-[#282828]/80 backdrop-blur-md -mx-6 -mt-6 px-6 py-4 
                      rounded-t-3xl md:rounded-t-3xl border-b border-white/5">
                    <h3
                        id="modal-title"
                        className="text-xl font-bold text-white"
                    >
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="h-8 w-8 rounded-full glass flex items-center 
                     justify-center hover:bg-white/10 transition-colors
                     focus:outline-none focus:ring-2 focus:ring-primary/50"
                        aria-label="Fechar modal"
                    >
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>

                <div className="mt-2">
                    {children}
                </div>
            </div>
        </div>
    );
};
