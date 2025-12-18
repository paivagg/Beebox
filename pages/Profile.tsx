
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { storeProfile } = useStore();

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <header className="sticky top-0 z-20 flex items-center p-4 pb-2 pt-8 justify-between">
        <button onClick={() => navigate(-1)} className="glass flex size-10 shrink-0 items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors">
          <span className="material-symbols-outlined text-xl">arrow_back_ios_new</span>
        </button>
        <h1 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center drop-shadow-md">Perfil da Loja</h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 px-4 pb-12 pt-4">
        {/* Avatar Section */}
        <section className="flex flex-col items-center gap-4 py-6">
          <div className="relative">
            <div className="h-28 w-28 rounded-full bg-white/10 flex items-center justify-center border-2 border-white/20 backdrop-blur-md shadow-2xl overflow-hidden">
              {storeProfile.avatarUrl ? (
                <img src={storeProfile.avatarUrl} alt="Store Profile" className="h-full w-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-5xl text-gray-400">storefront</span>
              )}
            </div>
            <button
              onClick={() => navigate('/store-data')}
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center shadow-lg hover:bg-orange-600 transition-colors"
            >
              <span className="material-symbols-outlined text-sm text-white">edit</span>
            </button>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white drop-shadow-md">{storeProfile.name}</h2>
            <p className="text-primary font-medium">{storeProfile.role}</p>
          </div>
        </section>

        {/* Menu Section */}
        <section className="flex flex-col gap-6 pt-4">

          <div className="space-y-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-2">Geral</p>
            <div className="glass-card rounded-2xl overflow-hidden">
              <button
                onClick={() => navigate('/store-data')}
                className="flex w-full items-center justify-between p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <span className="material-symbols-outlined">store</span>
                  </div>
                  <span className="text-base font-medium text-white">Dados da Loja</span>
                </div>
                <span className="material-symbols-outlined text-gray-500">chevron_right</span>
              </button>

              <div className="h-[1px] w-full bg-white/5 mx-auto"></div>

              <button
                onClick={() => navigate('/settings')}
                className="flex w-full items-center justify-between p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                    <span className="material-symbols-outlined">settings</span>
                  </div>
                  <span className="text-base font-medium text-white">Configurações</span>
                </div>
                <span className="material-symbols-outlined text-gray-500">chevron_right</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-2">Sistema</p>
            <div className="glass-card rounded-2xl overflow-hidden">
              <button className="flex w-full items-center justify-between p-4 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400">
                    <span className="material-symbols-outlined">cloud_upload</span>
                  </div>
                  <span className="text-base font-medium text-white">Backup de Dados</span>
                </div>
                <span className="material-symbols-outlined text-gray-500">chevron_right</span>
              </button>

              <div className="h-[1px] w-full bg-white/5 mx-auto"></div>

              <button className="flex w-full items-center justify-between p-4 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-400">
                    <span className="material-symbols-outlined">help</span>
                  </div>
                  <span className="text-base font-medium text-white">Ajuda e Suporte</span>
                </div>
                <span className="material-symbols-outlined text-gray-500">chevron_right</span>
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              if (window.confirm('Tem certeza que deseja sair?')) {
                navigate('/');
              }
            }}
            className="glass-card flex w-full items-center justify-center gap-2 p-4 rounded-2xl text-negative hover:bg-negative/10 transition-colors mt-4 active:scale-[0.98]"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-bold">Sair da Conta</span>
          </button>

          <p className="text-center text-xs text-gray-600 mt-2">Versão 1.0.4</p>

        </section>
      </main>
    </div>
  );
};

export default Profile;
