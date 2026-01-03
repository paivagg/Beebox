
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Transaction, Product, Player } from '../types';
import { v4 as uuidv4 } from 'uuid';

const PlayerProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { players, transactions, addTransaction, products, addProduct, updatePlayer, deletePlayer, deleteTransaction } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Transaction State
  const [transactionType, setTransactionType] = useState<'credit' | 'debit'>('credit');
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');

  // Edit Profile State
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');

  // Product Search & Create State
  const [productSearch, setProductSearch] = useState('');
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');

  // Calculate Best Sellers
  const sortedProducts = useMemo(() => {
    const productSales: Record<string, number> = {};

    transactions.forEach(t => {
      if (t.type === 'debit' && t.category === 'product' && t.title) {
        // Try to match by name if we don't have product_id in transaction (legacy)
        // Ideally transactions should have product_id
        const product = products.find(p => p.name === t.title);
        if (product) {
          productSales[product.id] = (productSales[product.id] || 0) + 1;
        }
      }
    });

    return [...products].sort((a, b) => {
      const salesA = productSales[a.id] || 0;
      const salesB = productSales[b.id] || 0;
      return salesB - salesA;
    });
  }, [products, transactions]);

  const filteredProducts = useMemo(() => {
    return sortedProducts.filter(p =>
      p.name.toLowerCase().includes(productSearch.toLowerCase())
    );
  }, [sortedProducts, productSearch]);

  const handleCreateProduct = async () => {
    if (!newProductName || !newProductPrice) return;

    const newProduct: Product = {
      id: uuidv4(),
      name: newProductName,
      price: parseFloat(newProductPrice.replace(',', '.')),
      category: 'Outros', // Default category
      stock: 0,
      image_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(newProductName)}&background=random&color=fff&background=F97316`
    };

    await addProduct(newProduct);

    // Reset and select
    setIsCreatingProduct(false);
    setNewProductName('');
    setNewProductPrice('');
    handleProductSelect(newProduct);
  };

  const player = players.find(p => p.id === id);
  const playerTransactions = transactions
    .filter(t => t.player_id === id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getBalances = () => {
    const totalCredits = playerTransactions
      .filter(t => t.type === 'credit')
      .reduce((acc, t) => acc + t.amount, 0);

    const productDebits = playerTransactions
      .filter(t => t.type === 'debit' && t.category === 'product')
      .reduce((acc, t) => acc + t.amount, 0);

    const eventDebits = playerTransactions
      .filter(t => t.type === 'debit' && t.category === 'event')
      .reduce((acc, t) => acc + t.amount, 0);

    const manualDebits = playerTransactions
      .filter(t => t.type === 'debit' && !t.category)
      .reduce((acc, t) => acc + t.amount, 0);

    const currentCredit = Math.max(0, totalCredits - productDebits - manualDebits);

    return {
      credit: currentCredit,
      eventDebt: eventDebits
    };
  };

  const { credit, eventDebt } = getBalances();

  if (!player) return <div className="p-8 text-white text-center">Jogador não encontrado</div>;

  const handleTransaction = async () => {
    if (!amount || isNaN(parseFloat(amount))) return;

    const newTx: Transaction = {
      id: uuidv4(),
      player_id: player.id,
      type: transactionType,
      category: transactionType === 'debit' ? 'product' : undefined,
      title: title || (transactionType === 'credit' ? 'Crédito Adicionado' : 'Débito Manual'),
      amount: parseFloat(amount),
      date: new Date().toISOString(),
      icon: transactionType === 'credit' ? 'arrow_upward' : 'arrow_downward'
    };

    await addTransaction(newTx);
    setIsModalOpen(false);
    setAmount('');
    setTitle('');
  };

  const handleUpdateProfile = () => {
    if (!editName) return;

    const updatedPlayer: Player = {
      ...player,
      name: editName,
      email: editEmail
    };

    updatePlayer(updatedPlayer);
    setIsEditModalOpen(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja excluir este jogador? Esta ação não pode ser desfeita.')) {
      await deletePlayer(player.id);
      navigate('/players');
    }
  };

  const openTransactionModal = (type: 'credit' | 'debit') => {
    setTransactionType(type);
    setAmount('');
    setTitle('');
    setIsModalOpen(true);
  };

  const openEditModal = () => {
    setEditName(player.name);
    setEditEmail(player.email || '');
    setIsEditModalOpen(true);
  };

  const handleProductSelect = (product: Product) => {
    setAmount(product.price.toString());
    setTitle(product.name);
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString('pt-BR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
      <header className="sticky top-0 z-20 p-4 pt-8 md:static md:px-0 md:mb-4">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="glass flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors md:hidden">
            <span className="material-symbols-outlined text-lg">arrow_back_ios_new</span>
          </button>
          <h1 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center drop-shadow-md md:text-left md:text-3xl md:flex-none">Perfil do Jogador</h1>
          <div className="flex-1 md:hidden"></div>
          <div className="flex gap-2">
            <button
              onClick={openEditModal}
              className="glass flex size-10 shrink-0 items-center justify-center rounded-full text-primary hover:text-orange-400"
            >
              <span className="material-symbols-outlined text-xl">edit</span>
            </button>
            <button
              onClick={handleDelete}
              className="glass flex size-10 shrink-0 items-center justify-center rounded-full text-negative hover:text-red-400"
            >
              <span className="material-symbols-outlined text-xl">delete</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 pb-32">
        {/* Header/Avatar Section Grouped */}
        <section className="flex w-full flex-col lg:flex-row gap-6 pt-4">
          <div className="glass-card flex-1 rounded-3xl p-6 flex flex-col items-center gap-4 border border-white/10 shadow-xl">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-24 w-24 border-4 border-white/10 shadow-lg"
              style={{ backgroundImage: `url("${player.avatar_url}")` }}
            ></div>
            <div className="flex flex-col items-center justify-center">
              <p className="text-white text-2xl font-bold leading-tight tracking-tight text-center">{player.name}</p>
              {player.email && <p className="text-gray-400 text-sm font-medium text-center mt-1">{player.email}</p>}
            </div>

            <div className="w-full h-px bg-white/5 my-2"></div>

            <div className="flex flex-col items-center justify-center w-full">
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">
                Saldo Disponível
              </p>
              <p className="text-4xl font-black leading-tight text-positive drop-shadow-sm">
                R$ {credit.toFixed(2).replace('.', ',')}
              </p>

              {eventDebt > 0 && (
                <div className="flex flex-col items-center mt-4 pt-4 border-t border-white/5 w-full">
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">
                    Dívida de Inscrição
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-black leading-tight text-negative drop-shadow-sm">
                      - R$ {eventDebt.toFixed(2).replace('.', ',')}
                    </p>
                    <span className="material-symbols-outlined text-negative text-xl filled">emoji_events</span>
                  </div>
                </div>
              )}

              {credit > 0 && player.credit_updated_at && (
                <p className="text-orange-400/80 text-[10px] font-bold mt-4 uppercase tracking-wider">
                  Expira em: {new Date(new Date(player.credit_updated_at).getTime() + 60 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>
          </div>

          {/* Desktop Actions Card */}
          <div className="hidden lg:flex flex-col gap-4 w-64">
            <div className="glass-card rounded-3xl p-6 flex flex-col gap-4 border border-white/10 shadow-xl">
              <h3 className="text-white font-bold text-sm uppercase tracking-wider">Ações</h3>
              <button
                onClick={() => openTransactionModal('credit')}
                className="flex items-center gap-3 w-full rounded-2xl py-3 px-4 bg-positive text-white active:scale-95 transition-all shadow-lg shadow-green-900/20"
              >
                <span className="material-symbols-outlined text-xl filled">add_circle</span>
                <span className="text-sm font-bold uppercase">Adicionar</span>
              </button>
              <button
                onClick={() => openTransactionModal('debit')}
                className="flex items-center gap-3 w-full rounded-2xl py-3 px-4 bg-negative text-white active:scale-95 transition-all shadow-lg shadow-red-900/20"
              >
                <span className="material-symbols-outlined text-xl">remove_circle</span>
                <span className="text-sm font-bold uppercase">Gasto</span>
              </button>
            </div>
          </div>
        </section>

        {/* History */}
        <section className="pt-8 pb-8">
          <div className="flex justify-between items-center pb-4 pl-1">
            <h2 className="text-white text-xl font-bold leading-tight tracking-[-0.015em] drop-shadow-md">Histórico</h2>
            <button className="text-primary text-sm font-bold hover:underline">Ver tudo</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {playerTransactions.length > 0 ? playerTransactions.map(tx => (
              <div key={tx.id} className={`glass-card flex items-center justify-between rounded-2xl p-4 transition-transform hover:scale-[1.01] ${tx.isExpired ? 'opacity-40 grayscale' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full backdrop-blur-md ${tx.type === 'credit' ? 'bg-positive/20 text-positive' : 'bg-negative/20 text-negative'}`}>
                    <span className="material-symbols-outlined text-2xl">
                      {tx.icon}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-base font-bold text-white line-clamp-1">{tx.title}</p>
                    <p className="text-sm text-gray-400">{formatDate(tx.date)}</p>
                    {tx.type === 'credit' && !tx.isExpired && (
                      <p className="text-[10px] text-orange-400 font-bold mt-0.5 uppercase">
                        Vence em: {new Date(new Date(tx.date).getTime() + 60 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                    {tx.isExpired && (
                      <p className="text-[10px] text-gray-500 font-bold mt-0.5 uppercase">
                        Expirado
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className={`text-base font-bold whitespace-nowrap ${tx.type === 'credit' ? 'text-positive' : 'text-negative'}`}>
                    {tx.type === 'credit' ? '+' : '-'} R$ {tx.amount.toFixed(2).replace('.', ',')}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Deseja excluir esta transação? O saldo do jogador será revertido.')) {
                        deleteTransaction(tx.id);
                      }
                    }}
                    className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-white/10 text-gray-400 hover:text-negative transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
            )) : (
              <p className="text-center text-gray-400 py-6 glass-card rounded-2xl">Nenhuma transação encontrada.</p>
            )}
          </div>
        </section>
      </main>

      {/* Action Bar */}
      <nav className="fixed bottom-6 left-4 right-4 z-30 flex justify-center lg:hidden">
        <div className="flex w-full max-w-sm justify-around items-center rounded-3xl glass-nav p-2 gap-3">
          <button
            onClick={() => openTransactionModal('credit')}
            className="flex flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl py-2 bg-positive text-white active:scale-95 transition-all shadow-lg shadow-green-900/20"
          >
            <span className="material-symbols-outlined text-xl filled">add_circle</span>
            <span className="text-[10px] font-bold uppercase">Adicionar</span>
          </button>
          <button
            onClick={() => openTransactionModal('debit')}
            className="flex flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl py-2 bg-negative text-white active:scale-95 transition-all shadow-lg shadow-red-900/20"
          >
            <span className="material-symbols-outlined text-xl">remove_circle</span>
            <span className="text-[10px] font-bold uppercase">Gasto</span>
          </button>
        </div>
      </nav>

      {/* Transaction Modal (Centered) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setIsModalOpen(false)}>
          <div
            className="glass-card w-full max-w-sm rounded-3xl p-6 border border-white/10 shadow-2xl animate-zoom-in flex flex-col max-h-[85vh]"
            onClick={e => e.stopPropagation()}
          >

            <h3 className={`text-2xl font-bold mb-6 text-center ${transactionType === 'credit' ? 'text-positive' : 'text-negative'}`}>
              {transactionType === 'credit' ? 'Adicionar Crédito' : 'Novo Gasto'}
            </h3>

            {/* Product Selection Section */}
            {transactionType === 'debit' && (
              <div className="mb-6 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Seleção Rápida</p>
                  <button
                    onClick={() => setIsCreatingProduct(!isCreatingProduct)}
                    className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">{isCreatingProduct ? 'close' : 'add'}</span>
                    {isCreatingProduct ? 'Cancelar' : 'Novo Produto'}
                  </button>
                </div>

                {isCreatingProduct ? (
                  <div className="glass-card p-3 rounded-xl border border-white/10 space-y-3 animate-fade-in">
                    <input
                      className="glass-input w-full rounded-lg p-2 text-sm text-white placeholder:text-gray-600"
                      placeholder="Nome do Produto"
                      value={newProductName}
                      onChange={e => setNewProductName(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        className="glass-input flex-1 rounded-lg p-2 text-sm text-white placeholder:text-gray-600"
                        placeholder="Preço (R$)"
                        value={newProductPrice}
                        onChange={e => setNewProductPrice(e.target.value)}
                      />
                      <button
                        onClick={handleCreateProduct}
                        disabled={!newProductName || !newProductPrice}
                        className="bg-primary text-white px-4 rounded-lg font-bold text-sm disabled:opacity-50"
                      >
                        Salvar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">search</span>
                      <input
                        className="glass-input w-full rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder:text-gray-600"
                        placeholder="Buscar produto..."
                        value={productSearch}
                        onChange={e => setProductSearch(e.target.value)}
                      />
                    </div>

                    <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                      {filteredProducts.map(product => (
                        <div
                          key={product.id}
                          onClick={() => handleProductSelect(product)}
                          className="glass flex-shrink-0 w-24 flex flex-col gap-2 cursor-pointer p-2 rounded-xl hover:bg-white/10 transition-colors active:scale-95 group relative"
                        >
                          <div
                            className="w-full aspect-square rounded-lg bg-cover bg-center border border-white/10 group-hover:border-primary/50 transition-colors"
                            style={{ backgroundImage: `url("${product.image_url}")` }}
                          ></div>
                          <div>
                            <p className="text-xs text-white truncate font-medium group-hover:text-primary transition-colors">{product.name}</p>
                            <p className="text-xs font-bold text-gray-400">R$ {product.price.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                      {filteredProducts.length === 0 && (
                        <div className="w-full text-center py-4 text-gray-500 text-xs">
                          Nenhum produto encontrado
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="text-sm text-gray-400 block mb-2 pl-1">Valor</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-lg">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    className="glass-input w-full rounded-2xl p-4 pl-12 text-white text-lg font-bold"
                    placeholder="0,00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    autoFocus={transactionType === 'credit'}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-2 pl-1">Descrição</label>
                <input
                  type="text"
                  className="glass-input w-full rounded-2xl p-4 text-white"
                  placeholder={transactionType === 'credit' ? "Ex: Depósito PIX" : "Ex: Coca-cola"}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 rounded-2xl bg-white/5 text-white font-medium hover:bg-white/10 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleTransaction}
                  className={`flex-1 py-4 rounded-2xl text-white font-bold transition-transform active:scale-95 shadow-lg ${transactionType === 'credit' ? 'bg-positive shadow-green-900/30' : 'bg-negative shadow-red-900/30'}`}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal (Centered) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setIsEditModalOpen(false)}>
          <div
            className="glass-card w-full max-w-sm rounded-3xl p-6 border border-white/10 shadow-2xl animate-zoom-in flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-6 text-center">Editar Perfil</h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-2 pl-1">Nome Completo</label>
                <input
                  className="glass-input w-full rounded-2xl p-4 text-white placeholder:text-gray-600"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-2 pl-1">Email</label>
                <input
                  className="glass-input w-full rounded-2xl p-4 text-white placeholder:text-gray-600"
                  placeholder="email@exemplo.com"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-3.5 rounded-2xl bg-white/5 text-white font-medium hover:bg-white/10 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdateProfile}
                  className="flex-1 py-3.5 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/30 active:scale-95 transition-all"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerProfile;
