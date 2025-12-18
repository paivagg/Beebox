
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';

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

  const categories = ['TCG', 'Acessórios', 'Colecionáveis', 'Outros'];

  useEffect(() => {
    if (id) {
      const product = products.find(p => p.id === id);
      if (product) {
        setName(product.name);
        setStock(product.stock);
        setPrice(product.price.toString().replace('.', ','));
        setCost(product.costPrice ? product.costPrice.toString().replace('.', ',') : '');
        setCollection(product.collection || '');
        setCategory(product.category || 'TCG');
      }
    }
  }, [id, products]);

  const handleSave = () => {
    if (!name || !price) return;

    const parsedPrice = parseFloat(price.replace(',', '.'));
    const parsedCost = cost ? parseFloat(cost.replace(',', '.')) : undefined;

    const productData: Product = {
      id: id || Date.now().toString(),
      name,
      collection,
      stock,
      price: parsedPrice,
      category,
      imageUrl: 'https://placehold.co/400x400/222/white?text=No+Image', // Placeholder
      costPrice: parsedCost
    };

    if (id) {
      updateProduct(productData);
    } else {
      addProduct(productData);
    }
    navigate('/products');
  };

  return (
    <div className="flex justify-center min-h-screen w-full">
      <div className="relative flex w-full max-w-[480px] flex-col overflow-x-hidden font-sans text-white">
        <header className="sticky top-0 z-20 p-4 pt-8">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="glass flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors">
              <span className="material-symbols-outlined text-lg">arrow_back_ios_new</span>
            </button>
            <h1 className="text-lg font-bold drop-shadow-md">{id ? 'Editar Produto' : 'Adicionar Produto'}</h1>
            <div className="w-10"></div>
          </div>
        </header>

        <main className="flex-1 px-4 pb-32">
          <div className="space-y-6">
            {/* Photo Upload */}
            <div className="flex flex-col items-center justify-center space-y-3 py-6">
              <div className="flex h-32 w-32 items-center justify-center rounded-3xl glass-card border border-dashed border-white/20 cursor-pointer hover:bg-white/5 transition-colors">
                <span className="material-symbols-outlined text-5xl text-gray-400">photo_camera</span>
              </div>
              <button className="text-sm font-bold text-primary hover:underline">Adicionar Foto</button>
            </div>

            {/* Details Form */}
            <div className="space-y-px overflow-hidden rounded-2xl glass-card">
              <div className="flex items-center p-4">
                <label className="w-1/3 text-sm font-medium text-gray-400" htmlFor="product-name">Nome</label>
                <input
                  id="product-name"
                  className="form-input w-2/3 appearance-none border-none bg-transparent p-0 text-right text-base text-white placeholder:text-gray-600 focus:outline-none focus:ring-0 font-medium"
                  type="text"
                  placeholder="Ex: Charizard"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div className="flex items-center p-4 border-t border-white/5">
                <label className="w-1/3 text-sm font-medium text-gray-400" htmlFor="product-collection">Coleção</label>
                <input
                  id="product-collection"
                  className="form-input w-2/3 appearance-none border-none bg-transparent p-0 text-right text-base text-white placeholder:text-gray-600 focus:outline-none focus:ring-0 font-medium"
                  type="text"
                  placeholder="Ex: Obsidian Flames"
                  value={collection}
                  onChange={e => setCollection(e.target.value)}
                />
              </div>
            </div>

            {/* Tags / Category */}
            <div>
              <p className="text-sm font-medium text-gray-400 mb-3 ml-1">Tag / Categoria</p>
              <div className="flex gap-2 flex-wrap">
                {categories.map(cat => (
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
              <div className="flex items-center p-4">
                <p className="flex-1 text-sm font-medium text-gray-400">Preço de Custo</p>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center text-sm text-gray-500">R$</span>
                  <input
                    className="form-input w-32 appearance-none border-none bg-transparent p-0 pl-6 text-right text-base text-white placeholder:text-gray-600 focus:outline-none focus:ring-0 font-medium"
                    type="number"
                    placeholder="0,00"
                    value={cost}
                    onChange={e => setCost(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center p-4 border-t border-white/5">
                <p className="flex-1 text-sm font-medium text-gray-400">Preço de Venda</p>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center text-sm text-gray-500">R$</span>
                  <input
                    className="form-input w-32 appearance-none border-none bg-transparent p-0 pl-6 text-right text-base text-white placeholder:text-gray-600 focus:outline-none focus:ring-0 font-medium"
                    type="number"
                    placeholder="0,00"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Stock Counter */}
            <div className="space-y-px overflow-hidden rounded-2xl glass-card">
              <div className="flex items-center justify-between p-4">
                <p className="text-sm font-medium text-gray-400">Estoque</p>
                <div className="flex items-center gap-6 bg-white/5 rounded-xl px-3 py-1.5 border border-white/5">
                  <button
                    onClick={() => setStock(Math.max(0, stock - 1))}
                    className="text-primary text-xl font-bold w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors"
                  >
                    -
                  </button>
                  <span className="text-lg font-bold min-w-[24px] text-center text-white">{stock}</span>
                  <button
                    onClick={() => setStock(stock + 1)}
                    className="text-primary text-xl font-bold w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Bottom Save Button */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] p-6 bg-gradient-to-t from-black via-black/80 to-transparent z-30">
          <button
            onClick={handleSave}
            className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-lg shadow-lg shadow-primary/30 active:scale-[0.98] transition-all hover:bg-orange-600"
          >
            {id ? 'Atualizar Produto' : 'Salvar Produto'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
