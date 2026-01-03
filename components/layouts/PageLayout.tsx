import React from 'react';
import { useNavigate } from 'react-router-dom';

interface PageLayoutProps {
    title: string;
    children: React.ReactNode;
    headerActions?: React.ReactNode;
    showBackButton?: boolean;
    className?: string;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
    title,
    children,
    headerActions,
    showBackButton = false,
    className = ''
}) => {
    const navigate = useNavigate();

    return (
        <div className={`relative flex flex-col min-h-screen w-full overflow-x-hidden ${className}`}>
            {/* Header Padronizado */}
            <header className="sticky top-0 z-20 px-4 pt-8 pb-4 
                       bg-gradient-to-b from-[#121212] to-transparent
                       md:static md:px-0 md:mb-4">
                <div className="flex items-center justify-between gap-4">
                    {showBackButton && (
                        <button
                            onClick={() => navigate(-1)}
                            className="glass flex h-10 w-10 shrink-0 items-center 
                       justify-center rounded-full text-white 
                       hover:bg-white/10 transition-colors md:hidden"
                        >
                            <span className="material-symbols-outlined text-lg">arrow_back_ios_new</span>
                        </button>
                    )}

                    <h1 className="text-white text-lg font-bold leading-tight 
                       tracking-[-0.015em] flex-1 text-center drop-shadow-md 
                       md:text-left md:text-3xl md:flex-none">
                        {title}
                    </h1>

                    {headerActions && (
                        <div className="flex items-center gap-2">
                            {headerActions}
                        </div>
                    )}

                    {!showBackButton && !headerActions && (
                        <div className="flex-1 md:hidden" />
                    )}
                </div>
            </header>

            {/* Content com padding consistente */}
            <main className="flex-1 px-4 pb-28 md:pb-8">
                {children}
            </main>
        </div>
    );
};
