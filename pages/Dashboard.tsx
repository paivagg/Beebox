
import React, { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { formatMonthAbbr, formatDay, formatCurrencyValue } from '../utils/formatters';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { transactions, events } = useStore();

  // Calculate daily sales
  const dailySales = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return transactions
      .filter(t => t.type === 'debit' && t.date.startsWith(today))
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [transactions]);

  // Total sales count for history summary
  const totalSalesCount = useMemo(() => {
    return transactions.filter(t => t.type === 'debit').length;
  }, [transactions]);

  // Sort upcoming events
  const upcomingEvents = useMemo(() => {
    return [...events]
      .filter(e => new Date(e.date) >= new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
  }, [events]);



  return (
    <div className="relative flex flex-col w-full">
      {/* Header */}
      <header className="flex items-center p-6 pb-2 pt-8 sticky top-0 z-10">
        <div className="flex-1">
          <h1 className="text-white text-3xl font-bold leading-tight tracking-[-0.015em] drop-shadow-lg">Dashboard</h1>
        </div>
        <div className="flex items-center justify-end">
          <button
            onClick={() => navigate('/profile')}
            className="glass flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 w-10 text-white hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined">person</span>
          </button>
        </div>
      </header>

      <main className="flex-grow px-4">
        {/* Metrics */}
        <section className="grid grid-cols-2 gap-4 pt-6">
          <div className="glass-card flex flex-col gap-2 rounded-2xl p-5">
            <p className="text-text-secondary-dark text-sm font-medium leading-normal uppercase tracking-wider">Vendas do Dia</p>
            <p className="text-white tracking-light text-2xl font-bold leading-tight">
              R${formatCurrencyValue(dailySales)}
            </p>
          </div>
          <div
            onClick={() => navigate('/sales-history')}
            className="glass-card flex flex-col gap-2 rounded-2xl p-5 cursor-pointer hover:bg-white/5 active:scale-95 transition-all"
          >
            <div className="flex justify-between items-center">
              <p className="text-text-secondary-dark text-sm font-medium leading-normal uppercase tracking-wider">Histórico</p>
              <span className="material-symbols-outlined text-gray-400 text-sm">arrow_forward</span>
            </div>
            <p className="text-white tracking-light text-2xl font-bold leading-tight">{totalSalesCount} <span className="text-sm font-normal text-gray-400">vendas</span></p>
          </div>
        </section>

        {/* Quick Actions */}
        <h2 className="text-white text-xl font-bold leading-tight tracking-[-0.015em] pt-8 pb-4 pl-1 drop-shadow-md">Ações Rápidas</h2>
        <section className="grid grid-cols-2 gap-3">
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
            onClick={() => navigate('/events')}
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
        </section>

        {/* Upcoming Events */}
        <div className="flex items-center justify-between pt-8 pb-4 pl-1">
          <h2 className="text-white text-xl font-bold leading-tight tracking-[-0.015em] drop-shadow-md">Próximos Eventos</h2>
          <button className="text-primary text-sm font-bold hover:underline" onClick={() => navigate('/events')}>Ver todos</button>
        </div>
        <section className="flex flex-col gap-3">
          {upcomingEvents.length > 0 ? upcomingEvents.map(event => (
            <div key={event.id} className="glass-card flex items-center gap-4 rounded-2xl p-4 transition-colors hover:bg-white/5 cursor-pointer" onClick={() => navigate(`/events/${event.id}`)}>
              <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-primary/20 backdrop-blur-sm">
                <p className="text-[10px] font-bold text-primary leading-none uppercase">{formatMonthAbbr(event.date)}</p>
                <p className="text-xl font-bold text-white leading-none">{formatDay(event.date)}</p>
              </div>
              <div className="flex-1">
                <p className="font-bold text-white line-clamp-1">{event.title}</p>
                <p className="text-sm text-text-secondary-dark">R$ {event.price.toFixed(2).replace('.', ',')}</p>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center justify-center px-2 py-1 rounded-lg bg-white/5">
                  <p className="font-bold text-white text-sm">{event.participants.length} inscritos</p>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center text-gray-400 py-6 glass-card rounded-2xl">
              Nenhum evento próximo.
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
