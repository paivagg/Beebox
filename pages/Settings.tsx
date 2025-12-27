import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const Settings: React.FC = () => {
    const navigate = useNavigate();
    const { storeSettings, updateStoreSettings, resetStore } = useStore();

    const toggleSetting = (key: keyof typeof storeSettings) => {
        updateStoreSettings({ [key]: !storeSettings[key] });
    };

    const handleDeleteData = () => {
        if (window.confirm('TEM CERTEZA? Esta ação irá apagar TODOS os dados locais (jogadores, produtos, transações) e não pode ser desfeita.')) {
            resetStore();
            navigate('/');
        }
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background">
            <header className="sticky top-0 z-20 flex items-center p-4 pb-2 pt-8 justify-between bg-background/80 backdrop-blur-md md:static md:bg-transparent">
                <button onClick={() => navigate(-1)} className="glass flex size-10 shrink-0 items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors md:hidden">
                    <span className="material-symbols-outlined text-xl">arrow_back_ios_new</span>
                </button>
                <h1 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center drop-shadow-md md:text-left md:text-3xl md:flex-none">Configurações</h1>
                <div className="flex-1 md:hidden"></div>
            </header>

            <main className="flex-1 px-4 pb-12 pt-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-2">Preferências Visuais</p>
                            <div className="glass-card rounded-2xl overflow-hidden">
                                <div className="flex w-full items-center justify-between p-6 border-b border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                                            <span className="material-symbols-outlined text-2xl">dark_mode</span>
                                        </div>
                                        <div className="flex flex-col text-left">
                                            <span className="text-base font-bold text-white">Modo Escuro</span>
                                            <span className="text-xs text-gray-500">Tema do aplicativo</span>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={storeSettings.darkMode}
                                            onChange={() => toggleSetting('darkMode')}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    </label>
                                </div>

                                <div className="flex w-full items-center justify-between p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400">
                                            <span className="material-symbols-outlined text-2xl">volume_up</span>
                                        </div>
                                        <div className="flex flex-col text-left">
                                            <span className="text-base font-bold text-white">Sons</span>
                                            <span className="text-xs text-gray-500">Efeitos sonoros</span>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={storeSettings.soundEffects}
                                            onChange={() => toggleSetting('soundEffects')}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-2">Comunicação</p>
                            <div className="glass-card rounded-2xl overflow-hidden">
                                <div className="flex w-full items-center justify-between p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                                            <span className="material-symbols-outlined text-2xl">notifications</span>
                                        </div>
                                        <div className="flex flex-col text-left">
                                            <span className="text-base font-bold text-white">Notificações</span>
                                            <span className="text-xs text-gray-500">Alertas de vendas e eventos</span>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={storeSettings.notifications}
                                            onChange={() => toggleSetting('notifications')}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-3">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-2">Segurança e Dados</p>
                            <div className="glass-card rounded-2xl overflow-hidden p-6">
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400">
                                            <span className="material-symbols-outlined text-2xl">dangerous</span>
                                        </div>
                                        <div className="flex flex-col text-left">
                                            <span className="text-base font-bold text-white">Zona de Perigo</span>
                                            <span className="text-xs text-gray-500">Estas ações são irreversíveis</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleDeleteData}
                                        className="flex w-full items-center justify-center gap-2 p-4 rounded-xl bg-negative/10 text-negative hover:bg-negative/20 transition-colors border border-negative/20 font-bold"
                                    >
                                        <span className="material-symbols-outlined">delete_forever</span>
                                        Excluir Todos os Dados
                                    </button>

                                    <p className="text-[10px] text-gray-500 text-center uppercase tracking-widest mt-2">
                                        TCG Manager Pro • v1.0.4
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Settings;
