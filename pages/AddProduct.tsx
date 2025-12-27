
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';
import { v4 as uuidv4 } from 'uuid';

const AddProduct: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { addProduct, updateProduct, products } = useStore();

  const [stock, setStock] = useState(1);
  const [name, setName] = useState('');
  const [collection, setCollection] = useState('');
  const [cost, setCost] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('TCG');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [customCategories, setCustomCategories] = useState<string[]>(['TCG', 'Acessórios', 'Colecionáveis', 'Outros']);

  useEffect(() => {
    if (id) {
      const product = products.find(p => p.id === id);
      if (product) {
        setName(product.name);
        setStock(product.stock);
        setPrice(product.price.toString().replace('.', ','));
        setCost(product.cost_price ? product.cost_price.toString().replace('.', ',') : '');
        setCollection(product.product_collection || '');
        if (product.category && !customCategories.includes(product.category)) {
          setCustomCategories(prev => [...prev, product.category]);
        }
        setCategory(product.category || 'TCG');
      }
    }
  }, [id, products]);

  const handleSave = () => {
    if (!name || !price) return;

    const parsedPrice = parseFloat(price.replace(',', '.'));
    const parsedCost = cost ? parseFloat(cost.replace(',', '.')) : undefined;

    const productData: Product = {
      id: id || uuidv4(),
      name,
      product_collection: collection,
      stock,
      price: parsedPrice,
      category,
      image_url: 'https://placehold.co/400x400/222/white?text=No+Image', // Placeholder
      cost_price: parsedCost
    };

    if (id) {
      updateProduct(productData);
    } else {
      addProduct(productData);
    }
    navigate('/products');
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim() && !customCategories.includes(newCategoryName.trim())) {
      setCustomCategories(prev => [...prev, newCategoryName.trim()]);
      setCategory(newCategoryName.trim());
      setNewCategoryName('');
      setIsCategoryModalOpen(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full overflow-x-hidden">
      <div className="relative flex w-full flex-col font-sans text-white">
        <header className="sticky top-0 z-20 p-4 pt-8 md:static md:px-0 md:mb-8">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="glass flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors md:hidden">
              <span className="material-symbols-outlined text-lg">arrow_back_ios_new</span>
            </button>
            <h1 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center drop-shadow-md md:text-left md:text-3xl md:flex-none">
              {id ? 'Editar Produto' : 'Adicionar Produto'}
            </h1>
            <div className="flex-1 md:hidden"></div>
          </div>
        </header>

        <main className="flex-1 pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-4">
            <div className="space-y-6">
              {/* Photo Upload */}
              <div className="flex flex-col items-center justify-center space-y-3 py-12 glass-card rounded-3xl border-2 border-dashed border-white/10 hover:border-primary/50 transition-colors cursor-pointer group">
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-white/5 group-hover:bg-primary/10 transition-colors">
                  <span className="material-symbols-outlined text-5xl text-gray-400 group-hover:text-primary">photo_camera</span>
                </div>
                <p className="text-sm text-gray-400 group-hover:text-primary">Adicionar Foto do Produto</p>
              </div>

              {/* Details Form */}
              <div className="space-y-px overflow-hidden rounded-2xl glass-card">
                <div className="flex items-center p-6">
                  <label className="w-1/3 text-sm font-bold text-gray-400 uppercase tracking-wider" htmlFor="product-name">Nome</label>
                  <input
                    id="product-name"
                    className="glass-input w-2/3 rounded-xl px-4 py-3 text-right text-base text-white placeholder:text-gray-600 focus:outline-none focus:ring-0 font-bold"
                    type="text"
                    placeholder="Ex: Charizard"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
                <div className="flex items-center p-6 border-t border-white/5">
                  <label className="w-1/3 text-sm font-bold text-gray-400 uppercase tracking-wider" htmlFor="product-collection">Coleção</label>
                  <input
                    id="product-collection"
                    className="glass-input w-2/3 rounded-xl px-4 py-3 text-right text-base text-white placeholder:text-gray-600 focus:outline-none focus:ring-0 font-bold"
                    type="text"
                    placeholder="Ex: Obsidian Flames"
                    value={collection}
                    onChange={e => setCollection(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Tags / Category */}
              <div className="glass-card p-6 rounded-3xl">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Tag / Categoria</p>
                  <button
                    onClick={() => setIsCategoryModalOpen(true)}
                    className="text-xs font-bold text-primary flex items-center gap-1 hover:text-orange-400 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">add_circle</span>
                    Nova Categoria
                  </button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {customCategories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${category === cat
                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                        : 'glass text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pricing Form */}
              <div className="space-y-px overflow-hidden rounded-2xl glass-card">
                <div className="flex items-center p-6">
                  <p className="flex-1 text-sm font-bold text-gray-400 uppercase tracking-wider">Preço de Custo</p>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center text-sm text-gray-500">R$</span>
                    <input
                      className="glass-input w-40 rounded-xl px-4 py-3 pl-10 text-right text-lg text-white placeholder:text-gray-600 focus:outline-none focus:ring-0 font-bold"
                      type="number"
                      placeholder="0,00"
                      value={cost}
                      onChange={e => setCost(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-center p-6 border-t border-white/5">
                  <p className="flex-1 text-sm font-bold text-gray-400 uppercase tracking-wider">Preço de Venda</p>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center text-sm text-gray-500">R$</span>
                    <input
                      className="glass-input w-40 rounded-xl px-4 py-3 pl-10 text-right text-lg text-white placeholder:text-gray-600 focus:outline-none focus:ring-0 font-bold"
                      type="number"
                      placeholder="0,00"
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Desktop Save Button */}
              <button
                onClick={handleSave}
                className="hidden md:flex w-full py-5 rounded-2xl bg-primary text-white font-bold text-xl shadow-lg shadow-primary/30 active:scale-[0.98] transition-all hover:bg-orange-600 items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">save</span>
                {id ? 'Atualizar Produto' : 'Salvar Produto'}
              </button>
            </div>
          </div>
        </main>

        {/* Mobile Save Button */}
        <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black via-black/80 to-transparent z-30 md:hidden">
          <button
            onClick={handleSave}
            className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-lg shadow-lg shadow-primary/30 active:scale-[0.98] transition-all hover:bg-orange-600"
          >
            {id ? 'Atualizar Produto' : 'Salvar Produto'}
          </button>
        </div>
      </div>


      {/* New Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setIsCategoryModalOpen(false)}>
          <div
            className="glass-card w-full max-w-sm rounded-3xl p-6 border border-white/10 shadow-2xl animate-zoom-in flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-6 text-center">Nova Categoria</h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-2 pl-1">Nome da Categoria</label>
                <input
                  autoFocus
                  className="glass-input w-full rounded-2xl p-4 text-white placeholder:text-gray-600"
                  placeholder="Ex: Playmats"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="flex-1 py-3.5 rounded-2xl bg-white/5 text-white font-medium hover:bg-white/10 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddCategory}
                  className="flex-1 py-3.5 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/30 active:scale-95 transition-all"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div >
  );
};

export default AddProduct;
