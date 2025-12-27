import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useToast } from '../hooks/useToast';
import { CartItem, Player } from '../types';
import { validateStock } from '../utils/validators';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants';
import { v4 as uuidv4 } from 'uuid';

const POS: React.FC = () => {
  const navigate = useNavigate();
  const { players, products, addTransaction, updateProductStock, addProduct } = useStore();
  const { success, error } = useToast();

  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [step, setStep] = useState<'select-player' | 'select-products' | 'review'>('select-player');

  // Confirmation Modal State
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [saveCustomAsProduct, setSaveCustomAsProduct] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'account'>('cash');
  const [confirmData, setConfirmData] = useState<{
    productTotal: number;
    eventTotal: number;
    total: number;
    playerBalance: number;
    creditUsed: number;
    productRemaining: number;
    totalRemaining: number;
  } | null>(null);

  const filteredPlayers = players.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.nickname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = useCallback((product: typeof products[0]) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      const newQuantity = existing ? existing.quantity + 1 : 1;

      // Validar estoque
      if (!validateStock(product.id, newQuantity, products)) {
        error(`${ERROR_MESSAGES.STOCK_INSUFFICIENT}: ${product.name}`);
        return prev;
      }

      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: newQuantity } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, [products, error]);

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const addCustomToCart = () => {
    if (!customName || !customPrice) return;
    const price = parseFloat(customPrice.replace(',', '.'));
    const id = `custom-${Date.now()}`;
    const customItem: CartItem = {
      id,
      name: customName,
      price,
      category: 'Outros',
      stock: 999,
      image_url: 'https://ui-avatars.com/api/?name=?&background=random',
      quantity: 1,
      // @ts-ignore - custom flag for saving later
      isCustom: true
    };
    setCart(prev => [...prev, customItem]);
    setIsCustomModalOpen(false);
    setCustomName('');
    setCustomPrice('');
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleCheckout = useCallback(() => {
    if (!selectedPlayer) return;

    // 1. Validate Stock
    for (const item of cart) {
      if (!validateStock(item.id, item.quantity, products)) {
        error(`${ERROR_MESSAGES.STOCK_INSUFFICIENT}: ${item.name}`);
        return;
      }
    }

    // 2. Separate items by category
    const isEventItem = (item: CartItem) =>
      item.category === 'Event' ||
      item.category === 'Torneio' ||
      item.category === 'Inscrição' ||
      item.name.toLowerCase().includes('torneio') ||
      item.name.toLowerCase().includes('evento') ||
      item.name.toLowerCase().includes('inscrição') ||
      item.name.toLowerCase().includes('campeonato');

    const eventCartItems = cart.filter(isEventItem);
    const productCartItems = cart.filter(i => !isEventItem(i));

    const eventTotal = eventCartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const productTotal = productCartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    // 3. Calculate Payment Details
    const playerCredit = selectedPlayer.balance > 0 ? selectedPlayer.balance : 0;
    const creditUsed = Math.min(playerCredit, productTotal);
    const productRemaining = productTotal - creditUsed;
    const totalRemaining = productRemaining + eventTotal;

    setConfirmData({
      productTotal,
      eventTotal,
      total,
      playerBalance: selectedPlayer.balance,
      creditUsed,
      productRemaining,
      totalRemaining
    });
    setPaymentMethod('cash'); // Default to cash for difference
    setIsConfirmModalOpen(true);
  }, [selectedPlayer, cart, products, total, error]);

  const handleConfirmSale = useCallback(async () => {
    if (!selectedPlayer || !confirmData) return;

    try {
      // Save custom items as products if requested
      if (saveCustomAsProduct) {
        for (const item of cart) {
          // @ts-ignore
          if (item.isCustom) {
            const { quantity, isCustom, ...productData } = item as any;
            await addProduct({
              ...productData,
              id: uuidv4(), // Generate a real ID
              stock: 0 // Initial stock 0, will be updated by sale
            });
          }
        }
      }

      const isEventItem = (item: CartItem) =>
        item.category === 'Event' ||
        item.category === 'Torneio' ||
        item.category === 'Inscrição' ||
        item.name.toLowerCase().includes('torneio') ||
        item.name.toLowerCase().includes('evento') ||
        item.name.toLowerCase().includes('inscrição') ||
        item.name.toLowerCase().includes('campeonato');

      const eventCartItems = cart.filter(isEventItem);
      const productCartItems = cart.filter(i => !isEventItem(i));

      // Determine amounts to debit based on payment method
      let debitProductAmount = confirmData.productTotal;
      let debitEventAmount = confirmData.eventTotal;

      if (paymentMethod === 'cash') {
        // If paying difference in cash, we only debit what was covered by credit
        debitProductAmount = confirmData.creditUsed;
        debitEventAmount = 0; // Paid fully in cash
      }
      // If paymentMethod === 'account', we debit full amounts (default)

      // Create Transactions
      // 1. Products
      if (productCartItems.length > 0 && debitProductAmount > 0) {
        await addTransaction({
          id: uuidv4(),
          player_id: selectedPlayer.id,
          type: 'debit',
          category: 'product',
          title: 'Compra de Produtos',
          amount: debitProductAmount,
          date: new Date().toISOString(),
          icon: 'shopping_cart'
        });
      }

      // Always update stock for products regardless of payment method
      if (productCartItems.length > 0) {
        for (const item of productCartItems) {
          await updateProductStock(item.id, -item.quantity);
        }
      }

      // 2. Events
      if (eventCartItems.length > 0 && debitEventAmount > 0) {
        await addTransaction({
          id: uuidv4(),
          player_id: selectedPlayer.id,
          type: 'debit',
          category: 'event',
          title: 'Inscrição em Evento/Torneio',
          amount: debitEventAmount,
          date: new Date().toISOString(),
          icon: 'emoji_events'
        });
      }

      if (eventCartItems.length > 0) {
        for (const item of eventCartItems) {
          await updateProductStock(item.id, -item.quantity);
        }
      }

      setIsConfirmModalOpen(false);
      setCart([]);
      setSelectedPlayer(null);
      setStep('select-player');
      setConfirmData(null);
      setPaymentMethod('cash');
      success(SUCCESS_MESSAGES.SALE_COMPLETED);
    } catch (err) {
      console.error('POS Error:', err);
      error('Erro ao processar venda: ' + (err instanceof Error ? err.message : 'Erro desconhecido'));
    }
  }, [selectedPlayer, confirmData, cart, addTransaction, updateProductStock, addProduct, saveCustomAsProduct, success, error, paymentMethod]);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-20 p-4 pt-8 bg-transparent">
        <div className="flex items-center justify-between rounded-full glass px-4 py-3">
          <button onClick={() => step === 'select-player' ? navigate(-1) : setStep(prev => prev === 'review' ? 'select-products' : 'select-player')}>
            <span className="material-symbols-outlined text-white">arrow_back_ios_new</span>
          </button>
          <h1 className="text-base font-bold text-white">
            {step === 'select-player' && 'Selecionar Cliente'}
            {step === 'select-products' && 'Adicionar Produtos'}
            {step === 'review' && 'Revisar Compra'}
          </h1>
          <div className="w-6"></div> {/* Spacer */}
        </div>
      </header>

      <main className="flex-1 px-4 pb-28 pt-2">
        {step === 'select-player' && (
          <div className="flex flex-col gap-4 animate-fade-in">
            <input
              className="glass-input w-full rounded-2xl p-4 text-white placeholder:text-gray-400"
              placeholder="Buscar cliente..."
              autoFocus
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <div className="flex flex-col gap-2">
              {filteredPlayers.map(player => (
                <div
                  key={player.id}
                  onClick={() => { setSelectedPlayer(player); setSearchQuery(''); setStep('select-products'); }}
                  className="glass-card flex items-center gap-4 p-3 rounded-2xl cursor-pointer hover:bg-white/5 active:scale-[0.98] transition-all"
                >
                  <div
                    className="h-12 w-12 rounded-full bg-cover border border-white/10"
                    style={{ backgroundImage: `url("${player.avatar_url}")` }}
                  />
                  <div>
                    <p className="font-bold text-white text-lg">{player.name}</p>
                    <p className="text-sm text-gray-400 font-medium">Saldo: <span className={player.balance >= 0 ? 'text-positive' : 'text-negative'}>R$ {player.balance.toFixed(2)}</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 'select-products' && (
          <div className="flex flex-col gap-4 animate-fade-in">
            <input
              className="glass-input w-full rounded-2xl p-4 text-white placeholder:text-gray-400"
              placeholder="Buscar produto..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />

            <div className="flex flex-col gap-4">
              <button
                onClick={() => setIsCustomModalOpen(true)}
                className="glass-card flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-white/10 text-gray-400 hover:text-white hover:border-primary/50 transition-all"
              >
                <span className="material-symbols-outlined">add_circle</span>
                <span className="font-bold">Gasto Avulso</span>
              </button>

              <div className="flex flex-col gap-3">
                {filteredProducts.map(product => (
                  <div key={product.id} className="glass-card flex justify-between items-center p-3 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-12 w-12 rounded-xl bg-cover border border-white/10"
                        style={{ backgroundImage: `url("${product.image_url}")` }}
                      />
                      <div>
                        <p className="font-bold text-white line-clamp-1">{product.name}</p>
                        <p className="text-sm text-gray-400">R$ {product.price.toFixed(2)} <span className="text-gray-600">|</span> {product.stock} un</p>
                      </div>
                    </div>
                    <button
                      onClick={() => addToCart(product)}
                      className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform"
                    >
                      <span className="material-symbols-outlined text-xl">add</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 'review' && (
          <div className="flex flex-col gap-4 animate-fade-in">
            <div className="p-4 rounded-2xl glass-card flex items-center gap-4">
              <div
                className="h-14 w-14 rounded-full bg-cover border-2 border-primary"
                style={{ backgroundImage: `url("${selectedPlayer?.avatar_url}")` }}
              />
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Cliente</p>
                <p className="font-bold text-xl text-white">{selectedPlayer?.name}</p>
              </div>
            </div>

            <h3 className="text-lg font-bold mt-2 ml-1 text-white">Itens do Carrinho</h3>
            {cart.map(item => (
              <div key={item.id} className="glass-card flex justify-between items-center p-4 rounded-2xl">
                <div className="flex-1">
                  <p className="font-bold text-white line-clamp-1">{item.name}</p>
                  <p className="text-sm text-gray-400">R$ {item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-3 bg-white/5 rounded-full px-2 py-1">
                  <button onClick={() => updateQuantity(item.id, -1)} className="text-primary font-bold w-8 h-8 flex items-center justify-center bg-white/5 rounded-full">-</button>
                  <span className="font-bold text-white w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="text-primary font-bold w-8 h-8 flex items-center justify-center bg-white/5 rounded-full">+</button>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-negative ml-3 p-2">
                  <span className="material-symbols-outlined text-xl">delete</span>
                </button>
              </div>
            ))}
            {cart.some(item => (item as any).isCustom) && (
              <div className="pt-4 border-t border-white/10">
                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-sm text-gray-300 font-medium group-hover:text-white transition-colors">Salvar novos itens como produtos?</span>
                  <div className="relative inline-flex items-center">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={saveCustomAsProduct}
                      onChange={e => setSaveCustomAsProduct(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </div>
                </label>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer / Cart Summary */}
      {(step === 'select-products' || step === 'review') && cart.length > 0 && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] glass border-t border-white/10 p-5 pb-8 z-30 rounded-t-3xl backdrop-blur-xl">
          <div className="flex justify-between items-center mb-4 px-2">
            <p className="text-gray-300 font-medium">{cart.reduce((a, b) => a + b.quantity, 0)} itens</p>
            <p className="text-2xl font-bold text-primary drop-shadow-sm">R$ {total.toFixed(2)}</p>
          </div>
          <button
            onClick={() => step === 'select-products' ? setStep('review') : handleCheckout()}
            className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/30 active:scale-[0.98] transition-all text-lg"
          >
            {step === 'select-products' ? 'Ver Carrinho' : 'Confirmar Venda'}
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {isConfirmModalOpen && confirmData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setIsConfirmModalOpen(false)}>
          <div
            className="glass-card w-full max-w-sm rounded-3xl p-6 border border-white/10 shadow-2xl animate-zoom-in flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col items-center mb-4">
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mb-4 text-primary">
                <span className="material-symbols-outlined text-3xl">shopping_cart_checkout</span>
              </div>
              <h3 className="text-xl font-bold text-white text-center">Confirmar Venda?</h3>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 mb-6 space-y-4">
              <div className="space-y-2">
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Resumo da Compra</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Produtos (Elegíveis para Crédito):</span>
                  <span className="text-white font-bold">R$ {confirmData.productTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Eventos (Apenas Dinheiro/Conta):</span>
                  <span className="text-white font-bold">R$ {confirmData.eventTotal.toFixed(2)}</span>
                </div>
                <div className="h-px bg-white/10 my-2"></div>
                <div className="flex justify-between text-base">
                  <span className="text-gray-300 font-bold">Total Geral:</span>
                  <span className="text-primary font-bold text-lg">R$ {confirmData.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10">
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-3">Plano de Pagamento</p>

                {/* Credit Usage Visualization */}
                <div className="flex items-center justify-between p-3 bg-positive/10 rounded-xl border border-positive/20 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-positive text-sm">account_balance_wallet</span>
                    <span className="text-xs text-positive font-bold">Crédito da Loja</span>
                  </div>
                  <span className="text-sm text-positive font-bold">- R$ {confirmData.creditUsed.toFixed(2)}</span>
                </div>

                {confirmData.totalRemaining > 0 ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <p className="text-xs text-gray-400">Saldo Restante:</p>
                      <p className="text-sm text-white font-bold">R$ {confirmData.totalRemaining.toFixed(2)}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setPaymentMethod('cash')}
                        className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-1 ${paymentMethod === 'cash'
                          ? 'bg-primary/20 border-primary text-primary'
                          : 'bg-white/5 border-white/10 text-gray-400'}`}
                      >
                        <span className="material-symbols-outlined text-lg">payments</span>
                        <span className="text-[10px] font-bold uppercase">Dinheiro/Pix</span>
                      </button>
                      <button
                        onClick={() => setPaymentMethod('account')}
                        className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-1 ${paymentMethod === 'account'
                          ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                          : 'bg-white/5 border-white/10 text-gray-400'}`}
                      >
                        <span className="material-symbols-outlined text-lg">person_add</span>
                        <span className="text-[10px] font-bold uppercase">Debitar Conta</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-xs text-gray-400 font-bold italic">Pago integralmente com créditos</span>
                  </div>
                )}
              </div>

              {/* Save Custom Items Toggle */}
              {cart.some(item => (item as any).isCustom) && (
                <div className="pt-4 border-t border-white/10">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-sm text-gray-300 font-medium group-hover:text-white transition-colors">Salvar novos itens como produtos?</span>
                    <div className="relative inline-flex items-center">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={saveCustomAsProduct}
                        onChange={e => setSaveCustomAsProduct(e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </div>
                  </label>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="flex-1 py-4 rounded-2xl bg-white/5 text-white font-bold hover:bg-white/10 transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={handleConfirmSale}
                className="flex-1 py-4 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/30 active:scale-95 transition-all"
              >
                Finalizar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Custom Expense Modal */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setIsCustomModalOpen(false)}>
          <div
            className="glass-card w-full max-w-sm rounded-3xl p-6 border border-white/10 shadow-2xl animate-zoom-in flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-6 text-center">Gasto Avulso</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-2 pl-1">Nome do Item</label>
                <input
                  className="glass-input w-full rounded-2xl p-4 text-white placeholder:text-gray-600"
                  placeholder="Ex: Refrigerante"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  autoFocus
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2 pl-1">Preço (R$)</label>
                <input
                  className="glass-input w-full rounded-2xl p-4 text-white placeholder:text-gray-600"
                  type="text"
                  placeholder="0,00"
                  value={customPrice}
                  onChange={e => setCustomPrice(e.target.value)}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsCustomModalOpen(false)}
                  className="flex-1 py-3.5 rounded-2xl bg-white/5 text-white font-medium hover:bg-white/10 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={addCustomToCart}
                  disabled={!customName || !customPrice}
                  className="flex-1 py-3.5 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/30 active:scale-95 transition-all disabled:opacity-50"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;