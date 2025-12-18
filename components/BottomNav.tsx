
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const [showQuickActions, setShowQuickActions] = useState(false);

  const leftNavItems = [
    { name: 'Home', icon: 'dashboard', path: '/' },
    { name: 'Jogadores', icon: 'people', path: '/players' },
  ];

  const rightNavItems = [
    { name: 'Eventos', icon: 'event', path: '/events' },
    { name: 'Produtos', icon: 'inventory_2', path: '/products' },
  ];

  const handleAction = (path: string) => {
    navigate(path);
    setShowQuickActions(false);
  };

  return (
    <>
      {/* Gradient Fade for Separation */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#121212] via-[#121212]/90 to-transparent pointer-events-none z-30" />

      <nav className="fixed bottom-6 left-1/2 z-40 w-full max-w-[380px] -translate-x-1/2 transform px-4">
        <div className="glass-nav flex items-center justify-center gap-6 rounded-full px-2 py-1">
          {/* Left Items */}
          <div className="flex gap-1">
            {leftNavItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center h-10 w-12 rounded-full transition-all ${
                    isActive ? 'text-primary' : 'text-text-secondary-dark hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <span 
                    className={`material-symbols-outlined text-[26px] ${isActive ? 'filled' : ''}`}
                  >
                    {item.icon}
                  </span>
                )}
              </NavLink>
            ))}
          </div>

          {/* Center Action Button */}
          <div className="relative -top-7">
            <button
              onClick={() => setShowQuickActions(!showQuickActions)}
              className={`flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/40 transition-transform ${
                showQuickActions ? 'rotate-45 scale-110' : 'active:scale-95'
              }`}
            >
              <span className="material-symbols-outlined text-4xl font-semibold">add</span>
            </button>
          </div>

          {/* Right Items */}
          <div className="flex gap-1">
            {rightNavItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center h-10 w-12 rounded-full transition-all ${
                    isActive ? 'text-primary' : 'text-text-secondary-dark hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <span 
                    className={`material-symbols-outlined text-[26px] ${isActive ? 'filled' : ''}`}
                  >
                    {item.icon}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* Quick Action Modal (Centered) */}
      {showQuickActions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowQuickActions(false)}>
          <div 
            className="w-full max-w-[340px] glass-card rounded-3xl p-6 animate-zoom-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-6 text-center text-lg font-bold text-white">Adicionar Novo</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => handleAction('/pos')}
                className="flex flex-col items-center gap-2 rounded-2xl bg-white/5 p-4 hover:bg-white/10 active:scale-95 transition-all border border-white/5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20 text-green-500">
                  <span className="material-symbols-outlined text-2xl">point_of_sale</span>
                </div>
                <span className="font-medium text-white">Nova Venda</span>
              </button>

              <button 
                onClick={() => handleAction('/products/add')}
                className="flex flex-col items-center gap-2 rounded-2xl bg-white/5 p-4 hover:bg-white/10 active:scale-95 transition-all border border-white/5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/20 text-blue-500">
                  <span className="material-symbols-outlined text-2xl">inventory_2</span>
                </div>
                <span className="font-medium text-white">Novo Produto</span>
              </button>

              <button 
                onClick={() => handleAction('/events')} // Events now has the modal built-in
                className="flex flex-col items-center gap-2 rounded-2xl bg-white/5 p-4 hover:bg-white/10 active:scale-95 transition-all border border-white/5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/20 text-purple-500">
                  <span className="material-symbols-outlined text-2xl">event</span>
                </div>
                <span className="font-medium text-white">Novo Evento</span>
              </button>

              <button 
                onClick={() => handleAction('/players')} // Redirects to players where quick add is available
                className="flex flex-col items-center gap-2 rounded-2xl bg-white/5 p-4 hover:bg-white/10 active:scale-95 transition-all border border-white/5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/20 text-orange-500">
                  <span className="material-symbols-outlined text-2xl">person_add</span>
                </div>
                <span className="font-medium text-white">Novo Jogador</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BottomNav;
