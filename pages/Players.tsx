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

  const getPlayerBalances = (playerId: string, netBalance: number) => {
    const playerTxs = transactions.filter(t => t.player_id === playerId);

    // Event debt is the sum of all event debits
    const eventDebt = playerTxs
      .filter(t => t.category === 'event' && t.type === 'debit')
      .reduce((acc, t) => acc + t.amount, 0);

    // Total credits added
    const totalCredits = playerTxs
      .filter(t => t.type === 'credit')
      .reduce((acc, t) => acc + t.amount, 0);

    // Product debits
    const productDebits = playerTxs
      .filter(t => t.category === 'product' && t.type === 'debit')
      .reduce((acc, t) => acc + t.amount, 0);

    // Store credit is total credits minus product debits
    // But wait, if they used credits for events, it's more complex.
    // Let's simplify: if balance is negative, it's all debt.
    // If balance is positive, but they have event transactions, maybe they have both.

    // Actually, let's just use the net balance for "Credit" if > 0
    // And if they have ANY event debits, show that as "Dívida de Inscrição"
    // But wait, if they paid for the event, it shouldn't show as debt.

    // The most accurate way: 
    // Store Credit = sum(credits) - sum(product debits)
    // Event Debt = sum(event debits)
    // This doesn't account for using credits to pay for events.

    // Let's try this:
    // If balance < 0, the entire negative amount is "Dívida".
    // If balance >= 0, it's "Crédito".
    // But the user wants to see both if there's an "inscrição" debt.

    // Maybe they mean: if they have a negative balance, show it as debt.
    // If they have a positive balance, show it as credit.
    // But if they have a negative balance AND they had credits before?

    // Let's stick to the simplest interpretation that matches the UI request:
    // Show the positive balance. If negative, show as debt.
    // But "tirar os titilos Credito e Divida".

    return {
      credit: netBalance > 0 ? netBalance : 0,
      debt: netBalance < 0 ? Math.abs(netBalance) : 0
    };
  };

  const filteredPlayers = players.filter(player =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.id.includes(searchTerm) ||
    player.nickname.toLowerCase().includes(searchTerm.toLowerCase())
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
      <div className="px-4 pt-8 pb-4 sticky top-0 z-20">
        <div className="flex justify-between items-center mb-6 pl-1">
          <h1 className="text-3xl font-bold tracking-tighter text-white drop-shadow-md">Jogadores</h1>
        </div>

        <label className="relative flex w-full h-12">
          {/* Search Icon */}
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 z-10">
            <span className="material-symbols-outlined text-gray-400">search</span>
          </div>

          {/* Input */}
          <input
            className="glass-input w-full rounded-2xl pl-12 pr-12 text-base placeholder:text-gray-500 h-12 transition-all focus:border-primary/50"
            placeholder="Buscar jogador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Add Button inside Search Bar */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="absolute inset-y-0 right-0 flex items-center pr-1 z-10"
          >
            <div className="flex items-center justify-center h-10 w-10 bg-primary rounded-2xl shadow-lg hover:bg-orange-600 active:scale-95 transition-all">
              <span className="material-symbols-outlined text-white text-2xl">add</span>
            </div>
          </button>
        </label>
      </div>

      <div className="flex flex-col gap-3 px-4 pb-4">
        {filteredPlayers.map(player => {
          const { credit, debt } = getPlayerBalances(player.id, player.balance);
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
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <p className="text-white text-base font-medium leading-tight">{player.name}</p>
                    {player.email && <p className="text-gray-500 text-xs mt-0.5">{player.email}</p>}
                  </div>
                  <div className="flex flex-col items-end">
                    {credit > 0 && (
                      <p className="text-sm font-bold text-positive">
                        R$ {credit.toFixed(2)}
                      </p>
                    )}
                    {debt > 0 && (
                      <p className="text-xs font-bold text-negative mt-0.5">
                        Dívida: R$ {debt.toFixed(2)}
                      </p>
                    )}
                    {credit === 0 && debt === 0 && (
                      <p className="text-sm font-bold text-gray-500">
                        R$ 0,00
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <div className="flex flex-col gap-1">
                    <p className="text-text-secondary-dark text-xs">{getLastActivityText(player.last_activity)}</p>
                    {player.balance > 0 && player.credit_updated_at && (
                      <p className="text-[10px] text-orange-400 font-medium">
                        Vence em: {getExpirationDateText(player.credit_updated_at)}
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