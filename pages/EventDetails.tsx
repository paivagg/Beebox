
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Player } from '../types';

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { events, players, addParticipantToEvent, toggleEventPayment, addPlayer, removeParticipantFromEvent, deleteEvent, finalizeEvent } = useStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const event = events.find(e => e.id === id);

  if (!event) return <div className="text-white p-8">Evento não encontrado</div>;

  const totalRevenue = event.participants.length * event.price;
  const paidRevenue = event.participants.filter(p => p.paid).length * event.price;
  const hasUnpaidParticipants = event.participants.some(p => !p.paid);

  const filteredPlayers = players.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getMonth = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('pt-BR', { day: 'numeric', month: 'long' });
  };

  const handleCreatePlayer = () => {
    if (searchQuery.trim()) {
      addPlayer(searchQuery);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.')) {
      deleteEvent(event.id);
      navigate('/events');
    }
  };

  const handleFinalize = async () => {
    if (window.confirm('Deseja finalizar o evento? Isso irá debitar o valor da inscrição de todos os participantes pendentes.')) {
      try {
        await finalizeEvent(event.id);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Erro ao finalizar evento');
      }
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <header className="sticky top-0 z-20 flex items-center p-4 pb-2 pt-8 justify-between md:static">
        <button onClick={() => navigate(-1)} className="glass flex size-10 shrink-0 items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors md:hidden">
          <span className="material-symbols-outlined text-xl">arrow_back_ios_new</span>
        </button>
        <h1 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center drop-shadow-md md:text-left md:text-3xl md:flex-none">Detalhes do Evento</h1>
        <div className="flex-1 md:hidden"></div>
        <button
          onClick={handleDelete}
          className="glass flex size-10 shrink-0 items-center justify-center rounded-full text-negative hover:text-red-400"
        >
          <span className="material-symbols-outlined text-xl">delete</span>
        </button>
      </header>

      <main className="flex-1 px-4 pb-24 pt-2">
        {/* Info Header */}
        <div className="mb-6 mt-2">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2 drop-shadow-md">{event.title}</h2>
              <div className="flex flex-wrap items-center gap-2 text-gray-300 text-sm">
                <span className="glass px-2 py-1 rounded-lg flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">calendar_month</span>
                  {getMonth(event.date)}
                </span>
                <span className="glass px-2 py-1 rounded-lg flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">payments</span>
                  R$ {event.price.toFixed(2)}
                </span>
                {event.status === 'finalized' && (
                  <span className={`glass px-2 py-1 rounded-lg flex items-center gap-1 font-bold ${hasUnpaidParticipants ? 'text-negative border border-negative/50' : 'text-positive border border-positive/50'}`}>
                    <span className="material-symbols-outlined text-sm">{hasUnpaidParticipants ? 'warning' : 'check_circle'}</span>
                    {hasUnpaidParticipants ? 'Pendências' : 'Finalizado'}
                  </span>
                )}
              </div>
            </div>
            {event.status !== 'finalized' && (
              <button
                onClick={handleFinalize}
                className="glass flex items-center gap-1 px-3 py-2 rounded-xl text-primary hover:bg-white/10 transition-colors font-bold text-sm"
              >
                <span className="material-symbols-outlined text-lg">flag</span>
                Finalizar
              </button>
            )}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="glass-card p-4 rounded-2xl">
            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Participantes</p>
            <p className="text-3xl font-bold text-white mt-1">{event.participants.length}</p>
          </div>
          <div className="glass-card p-4 rounded-2xl">
            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Valor Pago</p>
            <p className="text-3xl font-bold text-positive mt-1">R$ {paidRevenue.toFixed(0)}</p>
            <p className="text-xs text-gray-500 mt-1">Potencial: R$ {totalRevenue.toFixed(0)}</p>
          </div>
          <div className="glass-card p-4 rounded-2xl hidden lg:block">
            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Status</p>
            <p className={`text-xl font-bold mt-1 ${event.status === 'finalized' ? 'text-positive' : 'text-primary'}`}>
              {event.status === 'finalized' ? 'Finalizado' : 'Agendado'}
            </p>
          </div>
          <div className="glass-card p-4 rounded-2xl hidden lg:block">
            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Preço</p>
            <p className="text-xl font-bold text-white mt-1">R$ {event.price.toFixed(2)}</p>
          </div>
        </div>

        {/* Participants Header */}
        <div className="flex justify-between items-center mb-4 pl-1">
          <h3 className="text-lg font-bold text-white drop-shadow-md">Inscritos</h3>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1 bg-primary/90 backdrop-blur text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg hover:bg-primary transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">person_add</span>
            Adicionar
          </button>
        </div>

        {/* Participants List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {event.participants.length > 0 ? (
            event.participants.map(p => (
              <div key={p.player_id} className="flex items-center justify-between p-3 glass-card rounded-2xl">
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-full bg-cover border border-white/10"
                    style={{ backgroundImage: `url("${p.avatar_url}")` }}
                  ></div>
                  <p className="text-white font-medium line-clamp-1">{p.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleEventPayment(event.id, p.player_id)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-colors ${p.paid
                      ? 'bg-positive/20 text-positive border-positive/30'
                      : 'bg-negative/20 text-negative border-negative/30'}`}
                  >
                    {p.paid ? 'PAGO' : 'PENDENTE'}
                  </button>
                  <button
                    onClick={() => removeParticipantFromEvent(event.id, p.player_id)}
                    className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-gray-400 hover:text-negative transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-400 py-8 glass-card rounded-2xl">
              Nenhum participante inscrito.
            </div>
          )}
        </div>
      </main>

      {/* Add Participant Modal (Centered) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setIsAddModalOpen(false)}>
          <div
            className="w-full max-w-md glass-card rounded-3xl border border-white/10 shadow-2xl animate-zoom-in flex flex-col h-[70vh]"
            onClick={e => e.stopPropagation()}
          >

            <div className="px-6 pt-6 pb-2 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Adicionar Jogadores</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-primary font-bold">Concluir</button>
            </div>

            <div className="p-4 flex-1 overflow-hidden flex flex-col">
              <div className="flex gap-2 mb-4">
                <input
                  className="glass-input flex-1 rounded-2xl p-3 pl-4 text-white placeholder:text-gray-400"
                  placeholder="Buscar ou criar jogador..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                <button
                  onClick={handleCreatePlayer}
                  disabled={!searchQuery.trim()}
                  className="flex items-center justify-center w-12 bg-primary rounded-2xl text-white shadow-lg disabled:opacity-50 disabled:bg-zinc-700 hover:bg-orange-600 transition-colors"
                >
                  <span className="material-symbols-outlined">add</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 overflow-y-auto pb-4 pr-1 scrollbar-thin scrollbar-thumb-white/20">
                {filteredPlayers.map(player => {
                  const isAdded = event.participants.some(p => p.player_id === player.id);
                  return (
                    <button
                      key={player.id}
                      onClick={() => !isAdded && addParticipantToEvent(event.id, player)}
                      disabled={isAdded}
                      className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${isAdded
                        ? 'bg-primary/20 border-primary opacity-60'
                        : 'bg-white/5 border-white/5 hover:bg-white/10 active:scale-95'
                        }`}
                    >
                      <div className="relative">
                        <div
                          className="h-12 w-12 rounded-full bg-cover border border-white/10"
                          style={{ backgroundImage: `url("${player.avatar_url}")` }}
                        ></div>
                        {isAdded && (
                          <div className="absolute -top-1 -right-1 bg-primary text-white rounded-full p-0.5 shadow-sm">
                            <span className="material-symbols-outlined text-xs font-bold">check</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-center text-white truncate w-full leading-tight">{player.name.split(' ')[0]}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetails;
