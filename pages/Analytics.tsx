import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useAnalytics, Period } from '../hooks/useAnalytics';
import { KPICard } from '../components/analytics/KPICard';
import { SalesChart } from '../components/analytics/SalesChart';
import { CategoryDistribution } from '../components/analytics/CategoryDistribution';

export const Analytics: React.FC = () => {
    const navigate = useNavigate();
    const { transactions, players, events, resetAnalytics } = useStore();
    const [period, setPeriod] = useState<Period>('month');

    const analytics = useAnalytics(transactions, players, events, period);

    const periods: { value: Period; label: string }[] = [
        { value: 'today', label: 'Hoje' },
        { value: 'week', label: 'Semana' },
        { value: 'month', label: 'Mês' },
        { value: 'year', label: 'Ano' }
    ];

    return (
        <div className="relative flex flex-col w-full min-h-screen">
            {/* Header */}
            <div className="px-4 pt-8 pb-4 sticky top-0 z-20">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate('/')}
                        className="glass flex items-center justify-center rounded-full h-10 w-10 text-white hover:bg-white/10 transition-colors"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="text-3xl font-bold tracking-tighter text-white drop-shadow-md flex-1">Analytics</h1>
                    <button
                        onClick={resetAnalytics}
                        className="glass flex items-center justify-center rounded-full h-10 w-10 text-white hover:bg-red-500/20 transition-colors"
                        title="Reset Analytics"
                    >
                        <span className="material-symbols-outlined">restart_alt</span>
                    </button>
                </div>

                {/* Period Selector */}
                <div className="flex gap-2 glass-card p-1 rounded-2xl">
                    {periods.map(p => (
                        <button
                            key={p.value}
                            onClick={() => setPeriod(p.value)}
                            className={`flex-1 px-3 py-2 rounded-xl font-medium text-sm transition-all ${period === p.value
                                ? 'bg-primary text-white shadow-lg'
                                : 'text-white/60 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-4 px-4 pb-4">
                {/* KPI Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    <KPICard
                        title="Vendas"
                        value={`R$ ${analytics.totalSales.toFixed(2)}`}
                        change={analytics.changeVsPrevious.sales}
                        icon="payments"
                        trend={analytics.changeVsPrevious.sales >= 0 ? 'up' : 'down'}
                    />
                    <KPICard
                        title="Transações"
                        value={analytics.totalTransactions}
                        change={analytics.changeVsPrevious.transactions}
                        icon="receipt_long"
                        trend={analytics.changeVsPrevious.transactions >= 0 ? 'up' : 'down'}
                    />
                    <KPICard
                        title="Ticket Médio"
                        value={`R$ ${analytics.averageTicket.toFixed(2)}`}
                        change={analytics.changeVsPrevious.ticket}
                        icon="shopping_cart"
                        trend={analytics.changeVsPrevious.ticket >= 0 ? 'up' : 'down'}
                    />
                    <KPICard
                        title="Créditos"
                        value={`R$ ${analytics.activeCredits.toFixed(2)}`}
                        icon="account_balance_wallet"
                    />
                    <KPICard
                        title="Eventos"
                        value={analytics.eventsCount}
                        icon="emoji_events"
                    />
                    <KPICard
                        title="Players"
                        value={analytics.activePlayers}
                        icon="group"
                    />
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <SalesChart data={analytics.salesByDay} />
                    <CategoryDistribution data={analytics.categoryDistribution} />
                </div>

                {/* Top Players */}
                <div className="glass-card rounded-2xl p-4 border border-white/5">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">leaderboard</span>
                        Top Players
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                        {Object.entries(
                            transactions.reduce((acc, t) => {
                                if (t.player_id && t.type === 'debit') {
                                    acc[t.player_id] = (acc[t.player_id] || 0) + t.amount;
                                }
                                return acc;
                            }, {} as Record<string, number>)
                        )
                            .map(([playerId, volume]) => {
                                const player = players.find(p => p.id === playerId);
                                return {
                                    ...player,
                                    id: playerId,
                                    name: player?.name || 'Jogador Desconhecido',
                                    avatar_url: player?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(player?.name || 'U')}&background=random`,
                                    volume,
                                    balance: player?.balance || 0
                                };
                            })
                            .filter(p => p.name !== 'Jogador Desconhecido')
                            .sort((a, b) => b.volume - a.volume)
                            .slice(0, 10)
                            .map((player, index) => (
                                <div
                                    key={player.id}
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                                    onClick={() => navigate(`/player/${player.id}`)}
                                >
                                    <span className="text-white/40 text-sm font-medium w-6">#{index + 1}</span>
                                    <img
                                        src={player.avatar_url}
                                        alt={player.name}
                                        className="w-10 h-10 rounded-full border border-white/10"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-medium text-sm truncate">{player.name}</p>
                                        <p className="text-white/40 text-xs">
                                            Volume: R$ {player.volume.toFixed(2)}
                                        </p>
                                    </div>
                                    <span className={`text-sm font-bold ${player.balance >= 0 ? 'text-positive' : 'text-negative'}`}>
                                        R$ {player.balance.toFixed(2)}
                                    </span>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
