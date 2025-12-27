
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const navItems = [
        { name: 'Dashboard', icon: 'dashboard', path: '/' },
        { name: 'Jogadores', icon: 'people', path: '/players' },
        { name: 'Produtos', icon: 'inventory_2', path: '/products' },
        { name: 'Eventos', icon: 'event', path: '/events' },
        { name: 'PDV', icon: 'point_of_sale', path: '/pos' },
        { name: 'Analytics', icon: 'analytics', path: '/analytics' },
        { name: 'Histórico', icon: 'history', path: '/sales-history' },
    ];

    const bottomItems = [
        { name: 'Perfil', icon: 'person', path: '/profile' },
        { name: 'Configurações', icon: 'settings', path: '/settings' },
    ];

    return (
        <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 left-0 glass-nav border-r border-white/10 z-50">
            <div className="p-6">
                <h1 className="text-2xl font-bold tracking-tighter text-white drop-shadow-md flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-3xl">rocket_launch</span>
                    TCG Manager
                </h1>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${isActive
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`
                        }
                    >
                        <span className="material-symbols-outlined">{item.icon}</span>
                        <span className="font-bold text-sm">{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="px-4 py-6 border-t border-white/5 space-y-2">
                {bottomItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${isActive
                                ? 'bg-white/10 text-white'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`
                        }
                    >
                        <span className="material-symbols-outlined">{item.icon}</span>
                        <span className="font-bold text-sm">{item.name}</span>
                    </NavLink>
                ))}
            </div>
        </aside>
    );
};

export default Sidebar;
