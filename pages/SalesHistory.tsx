
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const SalesHistory: React.FC = () => {
  const navigate = useNavigate();
  const { transactions, players } = useStore();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter only debit transactions (sales)
  const sales = transactions
    .filter(t => t.type === 'debit')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getPlayerName = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    return player ? player.name : 'Cliente Desconhecido';
  };

  const filteredSales = sales.filter(sale =>
    sale.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getPlayerName(sale.player_id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString('pt-BR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <header className="sticky top-0 z-20 p-4 pt-8">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="glass flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined text-lg">arrow_back_ios_new</span>
          </button>
          <h1 className="text-lg font-bold drop-shadow-md">Histórico de Vendas</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="flex-1 px-4 pb-4 pt-2">
        <div className="mb-6">
          <div className="relative flex w-full h-12">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 z-10">
              <span className="material-symbols-outlined text-gray-400">search</span>
            </div>
            <input
              className="glass-input w-full rounded-2xl pl-12 pr-4 text-base placeholder:text-gray-500 h-12 transition-all focus:border-primary/50"
              placeholder="Buscar por cliente ou item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredSales.map(sale => (
            <div key={sale.id} className="glass-card flex items-center justify-between rounded-2xl p-4 transition-transform hover:scale-[1.01]">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full backdrop-blur-md bg-white/5">
                  <span className="material-symbols-outlined text-2xl text-gray-300">shopping_bag</span>
                </div>
                <div className="flex flex-col">
                  <p className="text-base font-bold text-white line-clamp-1">{sale.title}</p>
                  <p className="text-xs text-primary font-medium">{getPlayerName(sale.player_id)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(sale.date)}</p>
                </div>
              </div>
              <p className="text-base font-bold whitespace-nowrap text-white">
                R$ {sale.amount.toFixed(2).replace('.', ',')}
              </p>
            </div>
          ))}

          {filteredSales.length === 0 && (
            <div className="text-center text-gray-400 py-10 glass-card rounded-2xl">
              Nenhuma venda encontrada.
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SalesHistory;
