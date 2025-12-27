import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CategoryData } from '../../hooks/useAnalytics';

interface CategoryDistributionProps {
    data: CategoryData[];
    loading?: boolean;
}

const COLORS = ['#f97316', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const CategoryDistribution: React.FC<CategoryDistributionProps> = ({ data, loading = false }) => {
    if (loading) {
        return (
            <div className="glass-card rounded-2xl p-4 border border-white/5 h-64 animate-pulse">
                <div className="h-full bg-white/5 rounded"></div>
            </div>
        );
    }

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="glass-card p-3 rounded-xl border border-white/10 shadow-xl">
                    <p className="text-white font-medium text-sm">{payload[0].name}</p>
                    <p className="text-primary text-xs font-medium">
                        R$ {payload[0].value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-white/60 text-xs">
                        {payload[0].payload.percentage.toFixed(1)}% do total
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="glass-card rounded-2xl p-4 border border-white/5">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">pie_chart</span>
                Por Categoria
            </h3>

            {data.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-white/40">
                    <div className="text-center">
                        <span className="material-symbols-outlined text-4xl mb-2 block">analytics</span>
                        <p className="text-sm">Sem dados</p>
                    </div>
                </div>
            ) : (
                <>
                    <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={70}
                                fill="#8884d8"
                                dataKey="value"
                                label={false}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>

                    {/* Legend */}
                    <div className="grid grid-cols-2 gap-2 mt-4">
                        {data.map((entry, index) => (
                            <div key={entry.name} className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                />
                                <span className="text-xs text-white/80 truncate">{entry.name}</span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
