
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useLocation } from 'react-router-dom';
import { Event } from '../types';

const Events: React.FC = () => {
  const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Create Event Form State
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [price, setPrice] = useState('');
  const [maxEnrolled, setMaxEnrolled] = useState('0');

  // Finalize Event State
  const [finalizeModalOpen, setFinalizeModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [finalizeStats, setFinalizeStats] = useState<{ pendingCount: number; totalAmount: number } | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { events, addEvent, finalizeEvent } = useStore();

  // Handle auto-open modal from query param
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('create') === 'true') {
      setIsModalOpen(true);
      // Clean up the URL
      navigate('/events', { replace: true });
    }
  }, [location.search, navigate]);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const filteredEvents = events.filter(e => {
    const eventDate = new Date(e.date);
    const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
    const matchesFilter = filter === 'upcoming' ? eventDay >= todayStart : eventDay < todayStart;
    const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const getDay = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.getDate().toString().padStart(2, '0');
  };

  const getMonth = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '');
  };

  const getWeekDay = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('pt-BR', { weekday: 'short' }).toUpperCase().replace('.', '');
  };

  const handleCreateEvent = () => {
    if (!title) return;

    // Use current date if not provided
    const finalDate = date || new Date().toISOString().split('T')[0];
    const dummyTime = '12:00';

    const newEvent: Event = {
      id: Date.now().toString(),
      title,
      date: new Date(`${finalDate}T${dummyTime}`).toISOString(),
      time: dummyTime,
      price: price ? parseFloat(price.replace(',', '.')) : 0,
      participants: [],
      max_enrolled: parseInt(maxEnrolled) || 0,
      status: 'scheduled'
    };

    addEvent(newEvent);
    setIsModalOpen(false);
    setTitle('');
    setDate('');
    setPrice('');
    setMaxEnrolled('0');
  };

  const openFinalizeModal = (e: React.MouseEvent, event: Event) => {
    e.stopPropagation();
    const pending = event.participants.filter(p => !p.paid);
    setFinalizeStats({
      pendingCount: pending.length,
      totalAmount: pending.length * event.price
    });
    setSelectedEventId(event.id);
    setFinalizeModalOpen(true);
  };

  const handleFinalizeConfirm = () => {
    if (selectedEventId) {
      finalizeEvent(selectedEventId);
      setFinalizeModalOpen(false);
      setSelectedEventId(null);
      setFinalizeStats(null);
    }
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden">
      <div className="px-4 pt-8 pb-4 sticky top-0 z-20 md:static md:px-0 md:mb-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center drop-shadow-md md:text-left md:text-3xl md:flex-none">Eventos</h1>
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
              placeholder="Buscar evento..."
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

        {/* Tabs */}
        <div className="glass flex h-12 w-full items-center justify-center rounded-2xl p-1.5">
          <button
            onClick={() => setFilter('upcoming')}
            className={`flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-xl px-2 text-sm font-medium leading-normal transition-all ${filter === 'upcoming'
              ? 'bg-white/10 shadow-sm text-white'
              : 'text-text-secondary-dark hover:text-white'
              }`}
          >
            <span className="truncate">Próximos</span>
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-xl px-2 text-sm font-medium leading-normal transition-all ${filter === 'past'
              ? 'bg-white/10 shadow-sm text-white'
              : 'text-text-secondary-dark hover:text-white'
              }`}
          >
            <span className="truncate">Anteriores</span>
          </button>
        </div>
      </div>

      {/* Event List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-24 px-4 pt-2">
        {filteredEvents.map(event => (
          <div
            key={event.id}
            onClick={() => navigate(`/events/${event.id}`)}
            className="glass-card flex items-center justify-start rounded-2xl p-4 gap-4 cursor-pointer hover:bg-white/5 transition-colors active:scale-[0.99]"
          >
            <div className="flex flex-col items-center justify-center w-16 text-center rounded-xl bg-white/5 py-2 border border-white/5">
              <p className="text-text-secondary-dark text-xs font-bold uppercase leading-normal">{getWeekDay(event.date)}</p>
              <p className="text-primary text-2xl font-bold leading-tight tracking-[-0.015em]">{getDay(event.date)}</p>
              <p className="text-text-secondary-dark text-xs font-bold uppercase leading-normal">{getMonth(event.date)}</p>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <p className="text-white text-lg font-bold leading-tight tracking-[-0.015em] line-clamp-2">{event.title}</p>
                {event.status === 'finalized' && (
                  <span className="text-[10px] font-bold uppercase bg-positive/20 text-positive px-2 py-0.5 rounded-full border border-positive/20">
                    Finalizado
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1 mt-1">
                <p className="text-text-secondary-dark text-sm font-normal leading-normal">
                  R$ {event.price.toFixed(2).replace('.', ',')}
                </p>
                <div className="inline-flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-text-secondary-dark">group</span>
                  <p className="text-text-secondary-dark text-xs font-medium leading-normal">
                    {event.participants.length} inscritos
                  </p>
                </div>
              </div>
            </div>

            {event.status !== 'finalized' && (
              <button
                onClick={(e) => openFinalizeModal(e, event)}
                className="flex items-center justify-center h-10 w-10 bg-white/5 rounded-full hover:bg-primary/20 hover:text-primary transition-colors z-10"
                title="Finalizar Evento"
              >
                <span className="material-symbols-outlined">check_circle</span>
              </button>
            )}
          </div>
        ))}

        {filteredEvents.length === 0 && (
          <div className="text-center text-gray-400 mt-10 p-6 glass-card rounded-2xl">
            Nenhum evento encontrado.
          </div>
        )}
      </div>

      {/* New Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setIsModalOpen(false)}>
          <div
            className="glass-card w-full max-w-sm rounded-3xl p-6 border border-white/10 shadow-2xl animate-zoom-in flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-6 text-center">Novo Evento</h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-2 pl-1">Nome</label>
                <input
                  className="glass-input w-full rounded-2xl p-4 text-white placeholder:text-gray-600"
                  placeholder="Ex: Torneio Modern"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-2 pl-1">Data</label>
                <input
                  className="glass-input w-full rounded-2xl p-4 text-white placeholder:text-gray-600"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-2 pl-1">Inscrição (R$)</label>
                <input
                  className="glass-input w-full rounded-2xl p-4 text-white placeholder:text-gray-600"
                  type="number"
                  placeholder="0,00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-2 pl-1">Limite de Vagas (0 = Ilimitado)</label>
                <input
                  className="glass-input w-full rounded-2xl p-4 text-white placeholder:text-gray-600"
                  type="number"
                  placeholder="0"
                  value={maxEnrolled}
                  onChange={(e) => setMaxEnrolled(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3.5 rounded-2xl bg-white/5 text-white font-medium hover:bg-white/10 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateEvent}
                  disabled={!title}
                  className="flex-1 py-3.5 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/30 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                >
                  Criar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Finalize Event Confirmation Modal */}
      {finalizeModalOpen && finalizeStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setFinalizeModalOpen(false)}>
          <div
            className="glass-card w-full max-w-sm rounded-3xl p-6 border border-white/10 shadow-2xl animate-zoom-in flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col items-center mb-4">
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mb-4 text-primary">
                <span className="material-symbols-outlined text-3xl">check_circle</span>
              </div>
              <h3 className="text-xl font-bold text-white text-center">Finalizar Evento?</h3>
              <p className="text-gray-400 text-center mt-2 text-sm">
                Isso irá gerar débitos automaticamente para os jogadores pendentes.
              </p>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Jogadores Pendentes:</span>
                <span className="text-white font-bold">{finalizeStats.pendingCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Valor Total a Debitar:</span>
                <span className="text-white font-bold">R$ {finalizeStats.totalAmount.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setFinalizeModalOpen(false)}
                className="flex-1 py-3.5 rounded-2xl bg-white/5 text-white font-medium hover:bg-white/10 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleFinalizeConfirm}
                className="flex-1 py-3.5 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/30 active:scale-95 transition-all"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
