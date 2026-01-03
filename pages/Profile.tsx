
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { storeProfile, players, transactions } = useStore();

  const handleExportBackup = () => {
    // Header
    const csvRows = [['Nome', 'Email', 'Créditos Totais (R$)', 'Débitos Totais (R$)', 'Saldo Atual (R$)']];

    players.forEach(player => {
      const playerTxs = transactions.filter(t => t.player_id === player.id);

      const totalCredits = playerTxs
        .filter(t => t.type === 'credit')
        .reduce((acc, t) => acc + t.amount, 0);

      const totalDebits = playerTxs
        .filter(t => t.type === 'debit')
        .reduce((acc, t) => acc + t.amount, 0);

      // Escape quotes in names
      const safeName = `"${player.name.replace(/"/g, '""')}"`;
      const safeEmail = `"${(player.email || '').replace(/"/g, '""')}"`;

      csvRows.push([
        safeName,
        safeEmail,
        totalCredits.toFixed(2).replace('.', ','),
        totalDebits.toFixed(2).replace('.', ','),
        player.balance.toFixed(2).replace('.', ',')
      ]);
    });

    const csvContent = "data:text/csv;charset=utf-8,"
      + csvRows.map(e => e.join(";")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `backup_jogadores_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <header className="sticky top-0 z-20 flex items-center p-4 pb-2 pt-8 justify-between md:static">
        <button onClick={() => navigate(-1)} className="glass flex size-10 shrink-0 items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors md:hidden">
          <span className="material-symbols-outlined text-xl">arrow_back_ios_new</span>
        </button>
        <h1 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center drop-shadow-md md:text-left md:text-3xl md:flex-none">Perfil da Loja</h1>
        <div className="flex-1 md:hidden"></div>
      </header>

      <main className="flex-1 px-4 pb-12 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Avatar Section */}
          <section className="flex flex-col items-center gap-4 py-6 glass-card rounded-3xl p-8 h-fit">
            <div className="relative">
              <div className="h-32 w-32 rounded-full bg-white/10 flex items-center justify-center border-2 border-white/20 backdrop-blur-md shadow-2xl overflow-hidden">
                {storeProfile.avatar_url ? (
                  <img src={storeProfile.avatar_url} alt="Store Profile" className="h-full w-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-6xl text-gray-400">storefront</span>
                )}
              </div>
              <button
                onClick={() => navigate('/store-data')}
                className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-primary flex items-center justify-center shadow-lg hover:bg-orange-600 transition-colors border-4 border-[#121212]"
              >
                <span className="material-symbols-outlined text-base text-white">edit</span>
              </button>
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white drop-shadow-md">{storeProfile.name}</h2>
              <p className="text-primary font-medium">{storeProfile.role}</p>
            </div>

            <button
              onClick={() => {
                if (window.confirm('Tem certeza que deseja sair?')) {
                  navigate('/');
                }
              }}
              className="flex w-full items-center justify-center gap-2 p-4 rounded-2xl text-negative hover:bg-negative/10 transition-colors mt-4 border border-negative/20"
            >
              <span className="material-symbols-outlined">logout</span>
              <span className="font-bold">Sair da Conta</span>
            </button>
          </section>

          {/* Menu Section */}
          <section className="lg:col-span-2 flex flex-col gap-6">
            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-2">Sistema</p>
              <div className="glass-card rounded-2xl overflow-hidden grid grid-cols-1">
                <button
                  onClick={handleExportBackup}
                  className="flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400">
                      <span className="material-symbols-outlined text-2xl">download</span>
                    </div>
                    <div className="text-left">
                      <span className="text-base font-bold text-white block">Backup (CSV)</span>
                      <span className="text-xs text-gray-500">Exportar dados dos jogadores</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-gray-500">chevron_right</span>
                </button>
              </div>
            </div>

            <p className="text-center text-xs text-gray-600 mt-2">Versão 1.0.4 • TCG Manager Pro</p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Profile;
