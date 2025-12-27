import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SalesDataPoint } from '../../hooks/useAnalytics';

interface SalesChartProps {
    data: SalesDataPoint[];
    loading?: boolean;
    hideHeader?: boolean;
}

export const SalesChart: React.FC<SalesChartProps> = ({ data, loading = false, hideHeader = false }) => {
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
                    <p className="text-white font-medium text-sm mb-1">{payload[0].payload.date}</p>
                    <p className="text-primary text-xs font-medium">
                        R$ {payload[0].value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-white/60 text-xs">
                        {payload[1]?.value || 0} transações
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className={hideHeader ? "" : "glass-card rounded-2xl p-4 border border-white/5"}>
            {!hideHeader && (
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-xl">show_chart</span>
                    Vendas no Período
                </h3>
            )}

            <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                        dataKey="date"
                        stroke="rgba(255,255,255,0.4)"
                        style={{ fontSize: '10px' }}
                        tick={{ fill: 'rgba(255,255,255,0.6)' }}
                    />
                    <YAxis
                        stroke="rgba(255,255,255,0.4)"
                        style={{ fontSize: '10px' }}
                        tick={{ fill: 'rgba(255,255,255,0.6)' }}
                        tickFormatter={(value) => `R$${value}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                        type="monotone"
                        dataKey="sales"
                        stroke="#f97316"
                        strokeWidth={2}
                        dot={{ fill: '#f97316', r: 3 }}
                        activeDot={{ r: 5 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="transactions"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ fill: '#10b981', r: 2 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
