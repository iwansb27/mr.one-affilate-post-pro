import { useState } from 'react';
import { Product } from '../types';

interface ProductSelectorProps {
  products: Product[];
  onToggleProduct: (id: string) => void;
}

export default function ProductSelector({ products, onToggleProduct }: ProductSelectorProps) {
  const [selectedMarketplace, setSelectedMarketplace] = useState<'all' | 'shopee' | 'lazada' | 'tokopedia'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(p => {
    const matchMarketplace = selectedMarketplace === 'all' || p.marketplace === selectedMarketplace;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchMarketplace && matchSearch && matchCategory;
  });

  const marketplaceColors = {
    shopee: 'border-orange-400 bg-orange-50',
    lazada: 'border-blue-400 bg-blue-50',
    tokopedia: 'border-green-400 bg-green-50',
  };

  const marketplaceLabels = {
    shopee: { name: 'Shopee', color: 'bg-orange-500', icon: '🧡' },
    lazada: { name: 'Lazada', color: 'bg-blue-500', icon: '💙' },
    tokopedia: { name: 'Tokopedia', color: 'bg-green-500', icon: '💚' },
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Pilih Produk Affiliate</h1>
          <p className="text-gray-500 mt-1">Temukan produk terbaik dari marketplace untuk dipromosikan</p>
        </div>
        <div className="bg-purple-100 text-purple-700 px-4 py-2 rounded-xl font-medium text-sm">
          {products.filter(p => p.selected).length} produk dipilih
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Marketplace Filter */}
          <div className="flex gap-2">
            {(['all', 'shopee', 'lazada', 'tokopedia'] as const).map((mp) => (
              <button
                key={mp}
                onClick={() => setSelectedMarketplace(mp)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedMarketplace === mp
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {mp === 'all' ? '🏪 Semua' : `${marketplaceLabels[mp].icon} ${marketplaceLabels[mp].name}`}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Semua Kategori</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className={`bg-white rounded-2xl border-2 overflow-hidden card-hover cursor-pointer ${
              product.selected ? marketplaceColors[product.marketplace] : 'border-gray-100'
            }`}
            onClick={() => onToggleProduct(product.id)}
          >
            {/* Product Image Area */}
            <div className="p-6 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 relative">
              <span className="text-6xl">{product.image}</span>
              {product.selected && (
                <div className="absolute top-3 right-3 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                  ✓
                </div>
              )}
              <div className={`absolute top-3 left-3 ${marketplaceLabels[product.marketplace].color} text-white text-xs px-2 py-1 rounded-lg font-medium`}>
                {marketplaceLabels[product.marketplace].name}
              </div>
            </div>

            {/* Product Info */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 mb-2">{product.name}</h3>
              
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg font-bold text-purple-600">{formatPrice(product.price)}</span>
                <span className="text-xs text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span>⭐ {product.rating} | Terjual {product.sold.toLocaleString()}</span>
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                  Komisi {product.commission}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">{product.category}</span>
                <span className={`text-xs font-medium px-3 py-1 rounded-lg ${
                  product.selected ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {product.selected ? '✓ Dipilih' : '+ Pilih'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <span className="text-5xl mb-4 block">🔍</span>
          <p className="text-gray-500">Tidak ada produk ditemukan</p>
        </div>
      )}
    </div>
  );
}
