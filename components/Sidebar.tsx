import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';

const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { storeProfile } = useStore();

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
        { name: 'Configurações', icon: 'settings', path: '/settings' },
    ];

    return (
        <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 left-0 glass-nav border-r border-white/10 z-50">
            <div className="p-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                        <span className="material-symbols-outlined text-white text-2xl">style</span>
                    </div>
                    <h1 className="text-xl font-black tracking-tight text-white">
                        TCG Manager
                    </h1>
                </div>
                <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold ml-1">Store Edition</p>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto scrollbar-none">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group ${isActive
                                ? 'bg-primary text-white shadow-xl shadow-primary/20'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`
                        }
                    >
                        <span className={`material-symbols-outlined transition-transform group-hover:scale-110`}>{item.icon}</span>
                        <span className="font-bold text-sm">{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-white/5 space-y-1">
                {bottomItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all ${isActive
                                ? 'bg-white/10 text-white'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`
                        }
                    >
                        <span className="material-symbols-outlined">{item.icon}</span>
                        <span className="font-bold text-sm">{item.name}</span>
                    </NavLink>
                ))}

                <button
                    onClick={() => navigate('/profile')}
                    className="flex w-full items-center gap-3 p-3 mt-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-left group"
                >
                    <div className="h-10 w-10 rounded-full overflow-hidden border border-white/10">
                        {storeProfile.avatar_url ? (
                            <img src={storeProfile.avatar_url} alt="Store" className="h-full w-full object-cover" />
                        ) : (
                            <div className="h-full w-full bg-zinc-800 flex items-center justify-center">
                                <span className="material-symbols-outlined text-gray-500">store</span>
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{storeProfile.name}</p>
                        <p className="text-[10px] text-primary font-bold uppercase tracking-wider">{storeProfile.role}</p>
                    </div>
                    <span className="material-symbols-outlined text-gray-500 group-hover:text-white transition-colors">chevron_right</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
