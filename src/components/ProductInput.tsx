import { useState } from 'react';
import type { AffiliateProduct, Marketplace } from '../types';

interface ProductInputProps {
  products: AffiliateProduct[];
  onAddProduct: (product: AffiliateProduct) => void;
  onUpdateStatus: (id: string, status: AffiliateProduct['status']) => void;
  onDeleteProduct: (id: string) => void;
}

const marketplaceInfo: Record<Marketplace, { name: string; icon: string; color: string }> = {
  shopee: { name: 'Shopee', icon: '🧡', color: 'bg-orange-500' },
  lazada: { name: 'Lazada', icon: '💙', color: 'bg-blue-500' },
  tokopedia: { name: 'Tokopedia', icon: '💚', color: 'bg-green-500' },
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

export default function ProductInput({ products, onAddProduct, onUpdateStatus, onDeleteProduct }: ProductInputProps) {
  const [showForm, setShowForm] = useState(false);
  const [filterMarketplace, setFilterMarketplace] = useState<'all' | Marketplace>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | AffiliateProduct['status']>('all');

  const [formData, setFormData] = useState({
    marketplace: 'shopee' as Marketplace,
    productUrl: '',
    affiliateUrl: '',
    title: '',
    description: '',
    price: '',
    originalPrice: '',
    commission: '',
    imageUrl: '',
    videoUrl: '',
    notes: '',
  });

  const filteredProducts = products.filter(p => {
    const matchMp = filterMarketplace === 'all' || p.marketplace === filterMarketplace;
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchMp && matchStatus;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.productUrl || !formData.affiliateUrl || !formData.price) {
      alert('Harap isi field yang wajib: Title, Product URL, Affiliate URL, dan Price');
      return;
    }

    const now = new Date().toISOString();
    const newProduct: AffiliateProduct = {
      id: `prod_${Date.now()}`,
      marketplace: formData.marketplace,
      productUrl: formData.productUrl,
      affiliateUrl: formData.affiliateUrl,
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price),
      originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
      commission: formData.commission ? parseFloat(formData.commission) : 0,
      imageUrl: formData.imageUrl || `https://via.placeholder.com/400x400?text=${encodeURIComponent(formData.title.slice(0, 20))}`,
      videoUrl: formData.videoUrl || undefined,
      notes: formData.notes || undefined,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    };

    onAddProduct(newProduct);
    setFormData({
      marketplace: 'shopee', productUrl: '', affiliateUrl: '', title: '',
      description: '', price: '', originalPrice: '', commission: '',
      imageUrl: '', videoUrl: '', notes: '',
    });
    setShowForm(false);
  };

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    ready: 'bg-green-100 text-green-700',
    archived: 'bg-yellow-100 text-yellow-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Produk Affiliate</h1>
          <p className="text-gray-500 mt-1">Input manual produk affiliate dari marketplace</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="gradient-primary text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-purple-500/30 hover:shadow-xl transition-all"
        >
          {showForm ? '✕ Tutup' : '+ Tambah Produk'}
        </button>
      </div>

      {/* Input Form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">📝 Input Produk Baru</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Marketplace *</label>
                <select
                  value={formData.marketplace}
                  onChange={(e) => setFormData(prev => ({ ...prev, marketplace: e.target.value as Marketplace }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="shopee">🧡 Shopee</option>
                  <option value="lazada">💙 Lazada</option>
                  <option value="tokopedia">💚 Tokopedia</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Product URL *</label>
                <input
                  type="url"
                  value={formData.productUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, productUrl: e.target.value }))}
                  placeholder="https://shopee.co.id/product-name-i.123.456"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Affiliate URL *</label>
                <input
                  type="url"
                  value={formData.affiliateUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, affiliateUrl: e.target.value }))}
                  placeholder="https://shopee.co.id/product?affiliate=xxx"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Judul Produk *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Nama produk"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Harga (Rp) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="299000"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Harga Asli (Rp)</label>
                <input
                  type="number"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: e.target.value }))}
                  placeholder="599000"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Komisi (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.commission}
                  onChange={(e) => setFormData(prev => ({ ...prev, commission: e.target.value }))}
                  placeholder="8.5"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Image URL</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Deskripsi</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Deskripsi produk..."
                rows={3}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Video URL (opsional)</label>
              <input
                type="url"
                value={formData.videoUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                placeholder="https://..."
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Catatan</label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Catatan internal..."
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="gradient-primary text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-purple-500/30">
                💾 Simpan Produk
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-600 px-6 py-2.5 rounded-xl font-medium">
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-wrap gap-3">
        <select
          value={filterMarketplace}
          onChange={(e) => setFilterMarketplace(e.target.value as any)}
          className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">🏪 Semua Marketplace</option>
          <option value="shopee">🧡 Shopee</option>
          <option value="lazada">💙 Lazada</option>
          <option value="tokopedia">💚 Tokopedia</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">📋 Semua Status</option>
          <option value="draft">Draft</option>
          <option value="ready">Ready</option>
          <option value="archived">Archived</option>
        </select>
        <span className="ml-auto text-sm text-gray-500 self-center">{filteredProducts.length} produk</span>
      </div>

      {/* Product List */}
      <div className="space-y-3">
        {filteredProducts.map(product => {
          const mp = marketplaceInfo[product.marketplace];
          return (
            <div key={product.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 card-hover">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img src={product.imageUrl} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs ${mp.color} text-white px-2 py-0.5 rounded-lg font-medium`}>
                      {mp.icon} {mp.name}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[product.status]}`}>
                      {product.status.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-800 text-sm">{product.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span className="font-semibold text-purple-600">{formatPrice(product.price)}</span>
                    {product.originalPrice && (
                      <span className="line-through">{formatPrice(product.originalPrice)}</span>
                    )}
                    {product.commission > 0 && (
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Komisi {product.commission}%</span>
                    )}
                  </div>
                  {product.notes && <p className="text-xs text-gray-400 mt-1">📝 {product.notes}</p>}
                </div>
                <div className="flex flex-col gap-2">
                  {product.status === 'draft' && (
                    <button onClick={() => onUpdateStatus(product.id, 'ready')} className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200">
                      ✓ Mark Ready
                    </button>
                  )}
                  {product.status === 'ready' && (
                    <button onClick={() => onUpdateStatus(product.id, 'archived')} className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-lg hover:bg-yellow-200">
                      📦 Archive
                    </button>
                  )}
                  <button onClick={() => onDeleteProduct(product.id)} className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-200">
                    🗑️ Hapus
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <span className="text-5xl mb-4 block">🛒</span>
          <p className="text-gray-500">Belum ada produk. Klik "Tambah Produk" untuk mulai.</p>
        </div>
      )}
    </div>
  );
}
