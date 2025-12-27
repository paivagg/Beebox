import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';
import { v4 as uuidv4 } from 'uuid';

const Products: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProductName, setNewProductName] = useState('');

  const navigate = useNavigate();
  const { products, addProduct } = useStore();

  const filters = ['Todos', 'TCG', 'Acessórios', 'Estoque Baixo'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeFilter === 'Todos' ||
      (activeFilter === 'Estoque Baixo' ? product.stock <= 5 : product.category.includes(activeFilter === 'TCG' ? 'TCG' : activeFilter));
    return matchesSearch && matchesCategory;
  });

  const handleQuickAdd = () => {
    if (!newProductName.trim()) return;

    const newId = uuidv4();
    const newProduct: Product = {
      id: newId,
      name: newProductName,
      category: 'TCG',
      stock: 0,
      price: 0,
      image_url: 'https://placehold.co/400x400/222/white?text=No+Image',
    };

    addProduct(newProduct);
    setIsModalOpen(false);
    setNewProductName('');
    // Redirect to edit page to fill in details
    navigate(`/products/edit/${newId}`);
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
      <div className="px-4 pt-8 pb-4 sticky top-0 z-20 md:static md:px-0 md:mb-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center drop-shadow-md md:text-left md:text-3xl md:flex-none">Produtos</h1>
        </div>

        <div className="mb-6">
          <label className="relative flex w-full h-14">
            {/* Search Icon */}
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5 z-10">
              <span className="material-symbols-outlined text-gray-500">search</span>
            </div>

            {/* Input */}
            <input
              className="glass-input w-full rounded-2xl pl-14 pr-14 text-base placeholder:text-gray-600 h-14 transition-all focus:border-primary/50 bg-black/20"
              placeholder="Buscar por nome ou código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* Add Button inside Search Bar */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="absolute inset-y-0 right-0 flex items-center pr-2 z-10"
            >
              <div className="flex items-center justify-center h-10 w-10 bg-primary rounded-xl shadow-lg hover:bg-orange-600 active:scale-95 transition-all">
                <span className="material-symbols-outlined text-white text-2xl">add</span>
              </div>
            </button>
          </label>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`flex h-11 shrink-0 items-center justify-center gap-x-2 rounded-2xl px-6 transition-all backdrop-blur-md border border-white/10 ${activeFilter === filter
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
            >
              <p className="text-sm font-bold leading-normal tracking-wide">{filter}</p>
            </button>
          ))}
        </div>
      </div>

      <main className="flex-grow px-4 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 pb-24 max-w-[1400px] mx-auto w-full">
        {filteredProducts.map(product => (
          <div
            key={product.id}
            onClick={() => navigate(`/products/edit/${product.id}`)}
            className="glass-card rounded-[2.5rem] overflow-hidden transition-all duration-300 hover:translate-y-[-4px] active:scale-[0.98] cursor-pointer hover:bg-white/5 group border border-white/5 flex flex-col shadow-xl hover:shadow-primary/10"
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden">
              <div
                className="h-full w-full bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url("${product.image_url}")` }}
              ></div>
              <div className="absolute top-4 right-4">
                <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black text-white uppercase tracking-widest border border-white/10 shadow-lg">
                  {product.category}
                </div>
              </div>
            </div>

            <div className="p-6 flex flex-col flex-1">
              <div className="flex-1">
                <p className="text-white text-base font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors mb-1.5">
                  {product.name}
                </p>
                <p className={`text-[10px] font-black uppercase tracking-widest ${product.stock <= 5 ? 'text-negative' : 'text-gray-500'}`}>
                  ESTOQUE: {product.stock} UN
                </p>
              </div>

              <div className="flex items-center justify-between mt-6">
                <p className="text-primary font-black text-2xl tracking-tighter">
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </p>
                <span className="material-symbols-outlined text-gray-600 text-xl group-hover:text-white transition-colors">edit</span>
              </div>
            </div>
          </div>
        ))}
        {filteredProducts.length === 0 && (
          <div className="text-center text-gray-400 mt-8 glass-card p-6 rounded-2xl mx-4">Nenhum produto encontrado.</div>
        )}
      </main>

      {/* Add Product Modal (Centered) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setIsModalOpen(false)}>
          <div
            className="glass-card w-full max-w-sm rounded-3xl p-6 border border-white/10 shadow-2xl animate-zoom-in flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-6 text-center">Novo Produto</h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-2 pl-1">Nome do Produto</label>
                <input
                  className="glass-input w-full rounded-2xl p-4 text-white placeholder:text-gray-600"
                  placeholder="Ex: Booster Box"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
                  autoFocus
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3.5 rounded-2xl bg-white/5 text-white font-medium hover:bg-white/10 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleQuickAdd}
                  className="flex-1 py-3.5 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/30 active:scale-95 transition-all"
                >
                  Continuar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;