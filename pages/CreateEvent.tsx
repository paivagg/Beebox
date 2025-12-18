
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Event } from '../types';

const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const { addEvent } = useStore();

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [price, setPrice] = useState('');

  const handleSave = () => {
    if (!title) return;

    // Use current date if not provided
    const finalDate = date || new Date().toISOString().split('T')[0];
    const dummyTime = '12:00'; // Default hidden time since we removed the field

    const newEvent: Event = {
      id: Date.now().toString(),
      title,
      date: new Date(`${finalDate}T${dummyTime}`).toISOString(),
      time: dummyTime,
      price: price ? parseFloat(price.replace(',', '.')) : 0,
      participants: [],
      maxEnrolled: 0, // No limit visual
    };

    addEvent(newEvent);
    navigate('/events');
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden font-sans text-white">
      <header className="sticky top-0 z-20 p-4 pt-8">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="glass flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined text-lg">arrow_back_ios_new</span>
          </button>
          <h1 className="text-lg font-bold drop-shadow-md">Novo Evento</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="flex-1 px-4 pb-32">
        <div className="space-y-6 pt-4">
          <div className="space-y-px overflow-hidden rounded-2xl glass-card">
            <div className="flex items-center p-4">
              <label className="w-1/3 text-sm font-medium text-gray-400">Nome <span className="text-primary">*</span></label>
              <input
                className="form-input w-2/3 appearance-none border-none bg-transparent p-0 text-right text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-0"
                type="text"
                placeholder="Ex: Torneio Modern"
                value={title}
                onChange={e => setTitle(e.target.value)}
                autoFocus
              />
            </div>

            <div className="flex items-center p-4 border-t border-white/5">
              <label className="w-1/3 text-sm font-medium text-gray-400">Data</label>
              <input
                className="form-input w-2/3 appearance-none border-none bg-transparent p-0 text-right text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-0"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-px overflow-hidden rounded-2xl glass-card">
            <div className="flex items-center p-4">
              <label className="w-1/3 text-sm font-medium text-gray-400">Inscrição (R$)</label>
              <input
                className="form-input w-2/3 appearance-none border-none bg-transparent p-0 text-right text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-0"
                type="number"
                placeholder="0,00"
                value={price}
                onChange={e => setPrice(e.target.value)}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Save Button */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] p-6 bg-gradient-to-t from-black via-black/80 to-transparent z-30">
        <button
          onClick={handleSave}
          disabled={!title}
          className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-lg shadow-lg shadow-primary/30 active:scale-[0.98] transition-all hover:bg-orange-600 disabled:opacity-50 disabled:grayscale"
        >
          Salvar Evento
        </button>
      </div>
    </div>
  );
};

export default CreateEvent;
