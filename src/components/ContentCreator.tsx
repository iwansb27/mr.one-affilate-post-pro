import { useState } from 'react';
import { Product } from '../types';

interface ContentCreatorProps {
  products: Product[];
  onCreatePost: (post: {
    productId: string;
    platforms: string[];
    caption: string;
    hashtags: string[];
    scheduledDate: string;
    scheduledTime: string;
  }) => void;
}

export default function ContentCreator({ products, onCreatePost }: ContentCreatorProps) {
  const selectedProducts = products.filter(p => p.selected);
  const [selectedProductId, setSelectedProductId] = useState(selectedProducts[0]?.id || '');
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setSelectedTime] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');

  const platforms = [
    { id: 'facebook', name: 'Facebook', icon: '📘', color: 'bg-blue-600', maxCaption: 63206 },
    { id: 'instagram', name: 'Instagram', icon: '📷', color: 'bg-pink-500', maxCaption: 2200 },
    { id: 'youtube', name: 'YouTube', icon: '📺', color: 'bg-red-600', maxCaption: 5000 },
    { id: 'tiktok', name: 'TikTok', icon: '🎵', color: 'bg-gray-800', maxCaption: 2200 },
  ];

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  const generateContent = () => {
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    const templates = [
      `🔥 REVIEW JUJUR! 🔥\n\n${product.name}\n\n💰 Harga: Rp ${product.price.toLocaleString('id-ID')}\n⭐ Rating: ${product.rating}/5\n📦 Terjual: ${product.sold.toLocaleString()}+\n\nKenapa produk ini worth it?\n✅ Kualitas premium\n✅ Harga terjangkau\n✅ Banyak yang sudah buktiin\n\n🔗 Link di bio!\n\n${hashtags || '#review #rekomendasi #murah'}`,
      `✨ MUST HAVE ITEM! ✨\n\nSiapa yang belum punya ${product.name}?\n\nIni dia produk yang lagi VIRAL banget! 🤩\n\n💸 Cuma Rp ${product.price.toLocaleString('id-ID')} (Diskon ${Math.round((1 - product.price / product.originalPrice) * 100)}%)\n⭐ Rating ${product.rating} dari ${product.sold.toLocaleString()} pembeli!\n\nJangan sampai kehabisan ya! 🏃‍♂️💨\n\n🔗 Cek link di bio sekarang!\n\n${hashtags || '#viral #musthave #diskon'}`,
      `🛒 HAUL BELANJA! 🛒\n\nHari ini mau share produk yang baru aku beli:\n\n📌 ${product.name}\n\n💰 Price: Rp ${product.price.toLocaleString('id-ID')}\n🏷️ Original: Rp ${product.originalPrice.toLocaleString('id-ID')}\n💸 Save: Rp ${(product.originalPrice - product.price).toLocaleString('id-ID')}!\n\nJujur ini worth every penny! Kualitasnya bagus banget buat harga segitu. Yang mau beli, link-nya ada di bio ya! 👆\n\n${hashtags || '#haul #belanja #shopeehaul #racun'}`,
    ];

    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    setGeneratedContent(randomTemplate);
    setCaption(randomTemplate);
  };

  const handleSubmit = () => {
    if (!selectedProductId || selectedPlatforms.length === 0 || !scheduledDate || !scheduledTime) {
      alert('Lengkapi semua field yang diperlukan!');
      return;
    }

    onCreatePost({
      productId: selectedProductId,
      platforms: selectedPlatforms,
      caption,
      hashtags: hashtags.split(' ').filter(h => h.startsWith('#')),
      scheduledDate,
      scheduledTime,
    });

    // Reset form
    setCaption('');
    setHashtags('');
    setSelectedPlatforms([]);
    setScheduledDate('');
    setSelectedTime('');
    setGeneratedContent('');
    alert('✅ Konten berhasil dibuat dan dijadwalkan!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Buat Konten</h1>
        <p className="text-gray-500 mt-1">Buat konten menarik untuk produk affiliate yang dipilih</p>
      </div>

      {selectedProducts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <span className="text-6xl mb-4 block">🛒</span>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Belum Ada Produk Dipilih</h3>
          <p className="text-gray-500">Pilih produk affiliate terlebih dahulu di halaman "Pilih Produk"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left - Content Form */}
          <div className="space-y-4">
            {/* Product Selection */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-3">🛒 Pilih Produk</h3>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {selectedProducts.map(p => (
                  <option key={p.id} value={p.id}>{p.image} {p.name} - {p.marketplace}</option>
                ))}
              </select>
            </div>

            {/* Platform Selection */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-3">📱 Pilih Platform</h3>
              <div className="grid grid-cols-2 gap-3">
                {platforms.map(platform => (
                  <button
                    key={platform.id}
                    onClick={() => togglePlatform(platform.id)}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      selectedPlatforms.includes(platform.id)
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-xl">{platform.icon}</span>
                    <span className="text-sm font-medium">{platform.name}</span>
                    {selectedPlatforms.includes(platform.id) && (
                      <span className="ml-auto text-green-500">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Schedule */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-3">📅 Jadwal Posting</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Tanggal</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Waktu</label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Caption */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">✍️ Caption</h3>
                <button
                  onClick={generateContent}
                  className="text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg font-medium hover:bg-purple-200 transition-colors"
                >
                  ✨ Generate Otomatis
                </button>
              </div>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Tulis caption menarik untuk produk ini..."
                rows={6}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">{caption.length} karakter</p>
            </div>

            {/* Hashtags */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-3"># Hashtags</h3>
              <input
                type="text"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                placeholder="#review #rekomendasi #murah #viral"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <div className="flex flex-wrap gap-2 mt-3">
                {['#review', '#rekomendasi', '#murah', '#viral', '#racun', '#diskon', '#haul', '#worthit'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setHashtags(prev => prev ? `${prev} ${tag}` : tag)}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg hover:bg-purple-100 hover:text-purple-700 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              className="w-full gradient-primary text-white py-4 rounded-2xl font-semibold text-lg shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all"
            >
              🚀 Jadwalkan Posting
            </button>
          </div>

          {/* Right - Preview */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">👁️ Preview Konten</h3>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                >
                  {showPreview ? 'Tutup' : 'Buka'} Preview
                </button>
              </div>

              {selectedProductId && (
                <div className="mb-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{products.find(p => p.id === selectedProductId)?.image}</span>
                    <div>
                      <p className="font-medium text-sm text-gray-800">{products.find(p => p.id === selectedProductId)?.name}</p>
                      <p className="text-xs text-gray-500">Rp {products.find(p => p.id === selectedProductId)?.price.toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                </div>
              )}

              {showPreview && caption && (
                <div className="space-y-4">
                  {selectedPlatforms.map(platformId => {
                    const platform = platforms.find(p => p.id === platformId);
                    if (!platform) return null;
                    return (
                      <div key={platformId} className={`border rounded-xl p-4 ${platform.color} bg-opacity-5`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span>{platform.icon}</span>
                          <span className="text-sm font-medium text-gray-700">Preview {platform.name}</span>
                        </div>
                        <div className="bg-white rounded-lg p-3 text-xs text-gray-600 whitespace-pre-wrap max-h-40 overflow-y-auto">
                          {caption}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {!showPreview && (
                <div className="text-center py-8 text-gray-400">
                  <span className="text-4xl block mb-2">👁️</span>
                  <p className="text-sm">Klik "Buka Preview" untuk melihat tampilan konten</p>
                </div>
              )}

              {generatedContent && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-xs text-green-700 font-medium mb-1">✨ Konten berhasil di-generate!</p>
                  <p className="text-xs text-green-600">Anda bisa mengedit caption sesuai keinginan sebelum dijadwalkan.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
