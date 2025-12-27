import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const Players: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerEmail, setNewPlayerEmail] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { players, addPlayer, transactions } = useStore();

  const getPlayerBalances = (playerId: string) => {
    const playerTxs = transactions.filter(t => t.player_id === playerId);

    // Store Credit: Sum of all credits - Sum of all product debits
    // Note: This assumes credits are only used for products. 
    // If they are used for events, it gets complicated.
    // Let's use a simpler logic: 
    // Store Credit = Total Credits - Total Debits (excluding event debits)
    // Event Debt = Total Event Debits

    const totalCredits = playerTxs
      .filter(t => t.type === 'credit')
      .reduce((acc, t) => acc + t.amount, 0);

    const productDebits = playerTxs
      .filter(t => t.type === 'debit' && t.category === 'product')
      .reduce((acc, t) => acc + t.amount, 0);

    const eventDebits = playerTxs
      .filter(t => t.type === 'debit' && t.category === 'event')
      .reduce((acc, t) => acc + t.amount, 0);

    const manualDebits = playerTxs
      .filter(t => t.type === 'debit' && !t.category)
      .reduce((acc, t) => acc + t.amount, 0);

    // Current Store Credit is credits minus product/manual debits
    const currentCredit = Math.max(0, totalCredits - productDebits - manualDebits);

    // Event Debt is just the event debits
    // Wait, if they paid for the event using credits, it shouldn't be debt.
    // But the current system doesn't distinguish between "paid with credit" and "pending debt" in the transactions.
    // Actually, any 'debit' transaction in the history IS a debt that was recorded.

    return {
      credit: currentCredit,
      eventDebt: eventDebits
    };
  };

  const filteredPlayers = players.filter(player =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.id.includes(searchTerm)
  ).sort((a, b) => {
    const dateA = a.last_activity ? new Date(a.last_activity).getTime() : 0;
    const dateB = b.last_activity ? new Date(b.last_activity).getTime() : 0;
    return dateB - dateA;
  });

  const handleAddPlayer = () => {
    if (newPlayerName.trim()) {
      addPlayer(newPlayerName, newPlayerEmail);
      setNewPlayerName('');
      setNewPlayerEmail('');
      setIsModalOpen(false);
    }
  };

  const getLastActivityText = (dateStr?: string) => {
    if (!dateStr) return 'Sem atividade';
    const date = new Date(dateStr);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 3600 * 24));

    if (diffInDays === 0) return 'Hoje';
    if (diffInDays === 1) return 'Ontem';
    return `${diffInDays} dias atrás`;
  };

  const getExpirationDateText = (dateStr?: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const expirationDate = new Date(date.getTime() + 60 * 24 * 60 * 60 * 1000);
    return expirationDate.toLocaleDateString('pt-BR');
  };

  return (
    <div className="relative flex flex-col w-full min-h-screen">
      <div className="px-4 pt-8 pb-4 sticky top-0 z-20 md:static md:px-0 md:mb-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center drop-shadow-md md:text-left md:text-3xl md:flex-none">Jogadores</h1>
        </div>

        <div className="mb-6">
          <label className="relative flex w-full h-14">
            {/* Search Icon */}
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5 z-10">
              <span className="material-symbols-outlined text-gray-500">search</span>
            </div>

            {/* Input */}
            <input
              className="glass-input w-full rounded-2xl pl-14 pr-14 text-base placeholder:text-gray-600 h-14 transition-all focus:border-primary/50 bg-black/20"
              placeholder="Buscar jogador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* Add Button inside Search Bar */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="absolute inset-y-0 right-0 flex items-center pr-2 z-10"
            >
              <div className="flex items-center justify-center h-10 w-10 bg-primary rounded-xl shadow-lg hover:bg-orange-600 active:scale-95 transition-all">
                <span className="material-symbols-outlined text-white text-2xl">add</span>
              </div>
            </button>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 px-4 pb-4">
        {filteredPlayers.map(player => {
          const { credit, eventDebt } = getPlayerBalances(player.id);
          return (
            <div
              key={player.id}
              onClick={() => navigate(`/player/${player.id}`)}
              className="glass-card flex cursor-pointer items-center gap-4 rounded-2xl p-3 hover:bg-white/5 transition-all border border-white/5 active:scale-[0.98]"
            >
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-12 w-12 border border-white/10"
                style={{ backgroundImage: `url("${player.avatar_url}")` }}
              ></div>
              <div className="flex flex-1 flex-col justify-center">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-white text-base font-bold leading-tight tracking-tight">{player.name}</p>
                    <p className="text-text-secondary-dark text-xs font-medium">{getLastActivityText(player.last_activity)}</p>
                    {player.balance > 0 && player.credit_updated_at && (
                      <p className="text-[10px] text-orange-400 font-bold uppercase tracking-wider mt-0.5">
                        Vence em: {getExpirationDateText(player.credit_updated_at)}
                      </p>
                    )}
                    {player.email && <p className="text-gray-500 text-[10px] mt-1 italic">{player.email}</p>}
                  </div>
                  <div className="flex flex-col items-end pt-0.5">
                    {credit > 0 && (
                      <p className="text-base font-black text-positive tracking-tight">
                        R$ {credit.toFixed(2)}
                      </p>
                    )}
                    {eventDebt > 0 && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <p className="text-sm font-black text-negative tracking-tight">
                          - R$ {eventDebt.toFixed(2)}
                        </p>
                        <span className="material-symbols-outlined text-negative text-sm filled">emoji_events</span>
                      </div>
                    )}
                    {credit === 0 && eventDebt === 0 && (
                      <p className="text-base font-black text-gray-600 tracking-tight">
                        R$ 0,00
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {filteredPlayers.length === 0 && (
          <div className="text-center text-gray-400 mt-10 glass-card p-6 rounded-2xl mx-4">
            Nenhum jogador encontrado.
          </div>
        )}
      </div>

      {/* Add Player Modal (Centered) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setIsModalOpen(false)}>
          <div
            className="glass-card w-full max-w-sm rounded-3xl p-6 border border-white/10 shadow-2xl animate-zoom-in flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-6 text-center">Novo Jogador</h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-2 pl-1">Nome</label>
                <input
                  className="glass-input w-full rounded-2xl p-4 text-white placeholder:text-gray-600"
                  placeholder="Nome do jogador"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  autoFocus
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-2 pl-1">Email</label>
                <input
                  className="glass-input w-full rounded-2xl p-4 text-white placeholder:text-gray-600"
                  placeholder="email@exemplo.com"
                  type="email"
                  value={newPlayerEmail}
                  onChange={(e) => setNewPlayerEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3.5 rounded-2xl bg-white/5 text-white font-medium hover:bg-white/10 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddPlayer}
                  className="flex-1 py-3.5 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/30 active:scale-95 transition-all"
                >
                  Criar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Players;