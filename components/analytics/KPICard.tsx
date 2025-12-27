import React from 'react';

interface KPICardProps {
    title: string;
    value: string | number;
    change?: number;
    icon: string;
    trend?: 'up' | 'down' | 'neutral';
    loading?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({
    title,
    value,
    change,
    icon,
    trend = 'neutral',
    loading = false
}) => {
    const getTrendColor = () => {
        if (trend === 'up') return 'text-positive';
        if (trend === 'down') return 'text-negative';
        return 'text-white/60';
    };

    const getTrendIcon = () => {
        if (trend === 'up') return 'trending_up';
        if (trend === 'down') return 'trending_down';
        return 'remove';
    };

    if (loading) {
        return (
            <div className="glass-card rounded-2xl p-4 border border-white/5 animate-pulse">
                <div className="h-3 bg-white/10 rounded w-1/2 mb-3"></div>
                <div className="h-6 bg-white/10 rounded w-3/4 mb-2"></div>
                <div className="h-2 bg-white/10 rounded w-1/3"></div>
            </div>
        );
    }

    return (
        <div className="glass-card rounded-2xl p-4 border border-white/5 hover:bg-white/5 transition-all">
            <div className="flex items-start justify-between mb-3">
                <p className="text-xs text-white/60 font-medium uppercase tracking-wider">{title}</p>
                <span className="material-symbols-outlined text-primary text-xl">{icon}</span>
            </div>

            <h3 className="text-2xl font-black text-white mb-1 tracking-tight">
                {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
            </h3>

            {change !== undefined && (
                <div className="flex items-center gap-1">
                    <span className={`material-symbols-outlined text-xs ${getTrendColor()}`}>
                        {getTrendIcon()}
                    </span>
                    <span className={`text-xs font-medium ${getTrendColor()}`}>
                        {change > 0 ? '+' : ''}{change.toFixed(1)}%
                    </span>
                </div>
            )}
        </div>
    );
};
