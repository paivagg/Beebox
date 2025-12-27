
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
        <div className="glass-nav flex items-center justify-around rounded-full px-4 py-2">
          {leftNavItems.concat(rightNavItems).map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center h-10 w-12 rounded-full transition-all ${isActive ? 'text-primary' : 'text-text-secondary-dark hover:text-white'
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
      </nav>
    </>
  );
};

export default BottomNav;
