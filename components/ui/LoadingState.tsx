import React from 'react';

interface LoadingStateProps {
    type?: 'spinner' | 'skeleton' | 'pulse';
    text?: string;
    className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
    type = 'spinner',
    text,
    className = ''
}) => {
    if (type === 'spinner') {
        return (
            <div className={`flex flex-col items-center justify-center gap-4 py-12 ${className}`}>
                <div className="relative h-12 w-12">
                    <div className="absolute inset-0 rounded-full border-4 border-white/10"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                </div>
                {text && (
                    <p className="text-sm text-gray-400 font-medium animate-pulse">{text}</p>
                )}
            </div>
        );
    }

    if (type === 'pulse') {
        return (
            <div className={`flex items-center justify-center gap-2 py-8 ${className}`}>
                <div className="h-3 w-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="h-3 w-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="h-3 w-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
        );
    }

    // Skeleton
    return (
        <div className={`space-y-4 ${className}`}>
            <div className="glass-card rounded-2xl p-4 space-y-3">
                <div className="h-4 bg-white/10 rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-white/10 rounded animate-pulse w-1/2"></div>
                <div className="h-4 bg-white/10 rounded animate-pulse w-5/6"></div>
            </div>
            <div className="glass-card rounded-2xl p-4 space-y-3">
                <div className="h-4 bg-white/10 rounded animate-pulse w-2/3"></div>
                <div className="h-4 bg-white/10 rounded animate-pulse w-4/5"></div>
            </div>
        </div>
    );
};

interface SkeletonCardProps {
    count?: number;
    className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
    count = 1,
    className = ''
}) => {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className={`glass-card rounded-2xl p-4 ${className}`}>
                    <div className="flex items-center gap-4">
                        {/* Avatar skeleton */}
                        <div className="h-12 w-12 rounded-full bg-white/10 animate-pulse"></div>

                        {/* Content skeleton */}
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-white/10 rounded animate-pulse w-3/4"></div>
                            <div className="h-3 bg-white/10 rounded animate-pulse w-1/2"></div>
                        </div>

                        {/* Action skeleton */}
                        <div className="h-8 w-16 bg-white/10 rounded animate-pulse"></div>
                    </div>
                </div>
            ))}
        </>
    );
};
