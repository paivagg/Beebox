
import React, { useMemo, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { formatMonthAbbr, formatDay, formatCurrencyValue } from '../utils/formatters';
import { useAnalytics } from '../hooks/useAnalytics';
import { KPICard } from '../components/analytics/KPICard';
import { SalesChart } from '../components/analytics/SalesChart';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { transactions = [], events = [], players = [] } = useStore();
  const { user } = useAuth();

  // Calculate monthly registrations (paid event enrollments)
  const monthlyRegistrations = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return transactions
      .filter(t => {
        if (!t.date) return false;
        const tDate = new Date(t.date);
        return (
          t.category === 'event' &&
          t.type === 'debit' &&
          tDate.getMonth() === currentMonth &&
          tDate.getFullYear() === currentYear
        );
      })
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [transactions]);

  // Calculate Top Players (by total transaction volume)
  const topPlayers = useMemo(() => {
    const playerVolumes: Record<string, number> = {};

    transactions.forEach(t => {
      if (t.player_id && t.type === 'debit') {
        playerVolumes[t.player_id] = (playerVolumes[t.player_id] || 0) + t.amount;
      }
    });

    return Object.entries(playerVolumes)
      .map(([playerId, volume]) => {
        const player = players.find(p => p.id === playerId);
        return {
          id: playerId,
          name: player?.name || 'Jogador Desconhecido',
          avatar_url: player?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(player?.name || 'U')}&background=random`,
          volume
        };
      })
      .filter(p => p.name !== 'Jogador Desconhecido')
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 5);
  }, [transactions, players]);

  // Total transactions count
  const totalTransactionsCount = useMemo(() => {
    return transactions.length;
  }, [transactions]);

  const analytics = useAnalytics(transactions, players, events, 'month');



  return (
    <div className="relative flex flex-col w-full">
      {/* Header */}
      <header className="flex items-center p-6 pb-2 pt-8 sticky top-0 z-10 md:static">
        <div className="flex-1">
          <h1 className="text-white text-3xl font-bold leading-tight tracking-[-0.015em] drop-shadow-lg">Dashboard</h1>
        </div>
        <div className="flex items-center justify-end md:hidden">
          <button
            onClick={() => navigate('/profile')}
            className="glass flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 w-10 text-white hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined">person</span>
          </button>
        </div>
      </header>

      <main className="flex-grow px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Actions and Lists */}
          <div className="lg:col-span-2 space-y-8">
            {/* Metrics (Mobile/Tablet) */}
            <section className="grid grid-cols-2 gap-4 pt-4 lg:hidden">
              <div className="glass-card flex flex-col gap-2 rounded-2xl p-5">
                <p className="text-text-secondary-dark text-xs font-bold leading-normal uppercase tracking-wider">Inscrições</p>
                <p className="text-white tracking-light text-xl font-bold leading-tight">
                  R${formatCurrencyValue(monthlyRegistrations)}
                </p>
              </div>
              <div
                onClick={() => navigate('/sales-history')}
                className="glass-card flex flex-col gap-2 rounded-2xl p-5 cursor-pointer hover:bg-white/5 active:scale-95 transition-all"
              >
                <p className="text-text-secondary-dark text-xs font-bold leading-normal uppercase tracking-wider">Transações</p>
                <p className="text-white tracking-light text-xl font-bold leading-tight">{totalTransactionsCount}</p>
              </div>
            </section>

            {/* Quick Actions */}
            <div>
              <h2 className="text-white text-xl font-bold leading-tight tracking-[-0.015em] pb-4 drop-shadow-md">Ações Rápidas</h2>
              <section className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div
                  onClick={() => navigate('/pos')}
                  className="glass-card flex cursor-pointer items-center gap-3 rounded-2xl p-4 hover:bg-white/5 transition-all active:scale-95"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary">
                    <span className="material-symbols-outlined text-2xl">point_of_sale</span>
                  </div>
                  <h3 className="text-white text-sm font-bold leading-tight">PDV</h3>
                </div>
                <div
                  onClick={() => navigate('/events?create=true')}
                  className="glass-card flex cursor-pointer items-center gap-3 rounded-2xl p-4 hover:bg-white/5 transition-all active:scale-95"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary">
                    <span className="material-symbols-outlined text-2xl">event</span>
                  </div>
                  <h3 className="text-white text-sm font-bold leading-tight">Criar Evento</h3>
                </div>
                <div
                  onClick={() => navigate('/products')}
                  className="glass-card flex cursor-pointer items-center gap-3 rounded-2xl p-4 hover:bg-white/5 transition-all active:scale-95"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary">
                    <span className="material-symbols-outlined text-2xl">inventory_2</span>
                  </div>
                  <h3 className="text-white text-sm font-bold leading-tight">Produtos</h3>
                </div>
                <div
                  onClick={() => navigate('/players')}
                  className="glass-card flex cursor-pointer items-center gap-3 rounded-2xl p-4 hover:bg-white/5 transition-all active:scale-95"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary">
                    <span className="material-symbols-outlined text-2xl">person_search</span>
                  </div>
                  <h3 className="text-white text-sm font-bold leading-tight">Jogadores</h3>
                </div>
                <div
                  onClick={() => navigate('/analytics')}
                  className="glass-card flex cursor-pointer items-center gap-3 rounded-2xl p-4 hover:bg-white/5 transition-all active:scale-95"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary">
                    <span className="material-symbols-outlined text-2xl">analytics</span>
                  </div>
                  <h3 className="text-white text-sm font-bold leading-tight">Analytics</h3>
                </div>
              </section>
            </div>

            {/* Top Players */}
            <div>
              <div className="flex items-center justify-between pb-4">
                <h2 className="text-white text-xl font-bold leading-tight tracking-[-0.015em] drop-shadow-md">Top Players</h2>
                <button className="text-primary text-sm font-bold hover:underline" onClick={() => navigate('/players')}>Ver todos</button>
              </div>
              <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {topPlayers.length > 0 ? topPlayers.map(player => (
                  <div key={player.id} className="glass-card flex items-center gap-4 rounded-2xl p-4 transition-colors hover:bg-white/5 cursor-pointer" onClick={() => navigate(`/player/${player.id}`)}>
                    <div
                      className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-12 w-12 border border-white/10"
                      style={{ backgroundImage: `url("${player.avatar_url}")` }}
                    ></div>
                    <div className="flex-1">
                      <p className="font-bold text-white line-clamp-1">{player.name}</p>
                      <p className="text-sm text-text-secondary-dark">Volume total</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-positive text-sm">R$ {formatCurrencyValue(player.volume)}</p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center text-gray-400 py-6 glass-card rounded-2xl md:col-span-2">
                    Nenhuma movimentação registrada.
                  </div>
                )}
              </section>
            </div>
          </div>

          {/* Right Column: Analytics Summary */}
          <div className="lg:col-span-1">
            <div className="glass-card rounded-[2.5rem] p-6 border border-white/5 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-white tracking-tight">Analytics</h2>
                <button
                  onClick={() => navigate('/analytics')}
                  className="h-10 w-10 rounded-full glass flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all"
                >
                  <span className="material-symbols-outlined">open_in_new</span>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <KPICard
                    title="Vendas"
                    value={`R$ ${analytics.totalSales.toFixed(2)}`}
                    change={analytics.changeVsPrevious.sales}
                    icon="payments"
                    trend={analytics.changeVsPrevious.sales >= 0 ? 'up' : 'down'}
                  />
                  <KPICard
                    title="Ticket"
                    value={`R$ ${analytics.averageTicket.toFixed(2)}`}
                    icon="shopping_cart"
                  />
                </div>

                <div className="glass-card rounded-2xl p-4 bg-white/5">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Vendas (30 dias)</p>
                  <div className="h-[200px]">
                    <SalesChart data={analytics.salesByDay} hideHeader />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="glass-card rounded-2xl p-4 border border-white/5">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Transações</p>
                    <p className="text-lg font-bold text-white">{analytics.totalTransactions}</p>
                  </div>
                  <div className="glass-card rounded-2xl p-4 border border-white/5">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Players Ativos</p>
                    <p className="text-lg font-bold text-white">{analytics.activePlayers}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
};

export default Dashboard;


