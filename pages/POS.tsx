import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useToast } from '../hooks/useToast';
import { CartItem, Player } from '../types';
import { validateStock } from '../utils/validators';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants';

const POS: React.FC = () => {
  const navigate = useNavigate();
  const { players, products, addTransaction, updateProductStock } = useStore();
  const { success, error } = useToast();

  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [step, setStep] = useState<'select-player' | 'select-products' | 'review'>('select-player');

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

    try {
      // Verificar estoque de todos os itens antes de processar
      for (const item of cart) {
        if (!validateStock(item.id, item.quantity, products)) {
          error(`${ERROR_MESSAGES.STOCK_INSUFFICIENT}: ${item.name}`);
          return;
        }
      }

      // Create a transaction for the sale
      addTransaction({
        id: crypto.randomUUID(),
        playerId: selectedPlayer.id,
        type: 'debit',
        title: 'Compra na Loja',
        amount: total,
        date: new Date().toISOString(),
        icon: 'shopping_cart'
      });

      // Update stocks
      cart.forEach(item => {
        updateProductStock(item.id, -item.quantity);
      });

      success(SUCCESS_MESSAGES.SALE_COMPLETED);
      navigate('/dashboard');
    } catch (err) {
      error('Erro ao processar venda: ' + (err instanceof Error ? err.message : 'Erro desconhecido'));
    }
  }, [selectedPlayer, cart, products, total, addTransaction, updateProductStock, navigate, success, error]);

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
                    style={{ backgroundImage: `url("${player.avatarUrl}")` }}
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

            <div className="flex flex-col gap-3">
              {filteredProducts.map(product => (
                <div key={product.id} className="glass-card flex justify-between items-center p-3 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-12 w-12 rounded-xl bg-cover border border-white/10"
                      style={{ backgroundImage: `url("${product.imageUrl}")` }}
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
        )}

        {step === 'review' && (
          <div className="flex flex-col gap-4 animate-fade-in">
            <div className="p-4 rounded-2xl glass-card flex items-center gap-4">
              <div
                className="h-14 w-14 rounded-full bg-cover border-2 border-primary"
                style={{ backgroundImage: `url("${selectedPlayer?.avatarUrl}")` }}
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
    </div>
  );
};

export default POS;