import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const Players: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { players, addPlayer } = useStore();

  const filteredPlayers = players.filter(player => 
    player.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    player.id.includes(searchTerm) ||
    player.nickname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPlayer = () => {
    if (newPlayerName.trim()) {
      addPlayer(newPlayerName);
      setNewPlayerName('');
      setIsModalOpen(false);
    }
  };

  const getLastActivityText = (dateStr?: string) => {
    if (!dateStr) return 'Sem atividade';
    const date = new Date(dateStr);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));
    
    if (diffInDays === 0) return 'Hoje';
    if (diffInDays === 1) return 'Ontem';
    return `${diffInDays} dias atrás`;
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
            className="absolute inset-y-0 right-0 flex items-center pr-2 z-10"
          >
            <div className="flex items-center justify-center h-8 w-8 bg-primary rounded-xl shadow-lg hover:bg-orange-600 active:scale-95 transition-all">
              <span className="material-symbols-outlined text-white text-xl">add</span>
            </div>
          </button>
        </label>
      </div>

      <div className="flex flex-col gap-3 px-4 pb-4">
        {filteredPlayers.map(player => (
          <div 
            key={player.id} 
            onClick={() => navigate(`/player/${player.id}`)}
            className="glass-card flex cursor-pointer items-center gap-4 rounded-2xl p-3 hover:bg-white/5 transition-all border border-white/5 active:scale-[0.98]"
          >
            <div 
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-12 w-12 border border-white/10" 
              style={{ backgroundImage: `url("${player.avatarUrl}")` }}
            ></div>
            <div className="flex flex-1 flex-col justify-center">
              <div className="flex justify-between items-center">
                <p className="text-white text-base font-medium leading-tight">{player.name}</p>
                <p className={`text-sm font-bold ${player.balance >= 0 ? 'text-positive' : 'text-negative'}`}>
                  R$ {player.balance.toFixed(2)}
                </p>
              </div>
              <div className="flex justify-between items-center mt-1">
                <p className="text-text-secondary-dark text-xs font-normal leading-tight">ID: {player.id}</p>
                <p className="text-text-secondary-dark text-xs">{getLastActivityText(player.lastActivity)}</p>
              </div>
            </div>
          </div>
        ))}
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
                  onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
                  autoFocus
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