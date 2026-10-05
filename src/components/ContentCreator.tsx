import { useState } from 'react';
import type { AffiliateProduct, ContentItem, SocialPlatform, ContentStyle, ScheduledPost, BufferChannel } from '../types';

interface ContentCreatorProps {
  products: AffiliateProduct[];
  contentItems: ContentItem[];
  onCreateContent: (content: ContentItem) => void;
  onUpdateContent: (id: string, updates: Partial<ContentItem>) => void;
  onDeleteContent: (id: string) => void;
}

const contentStyles: { id: ContentStyle; label: string; icon: string }[] = [
  { id: 'review', label: 'Product Review', icon: '⭐' },
  { id: 'soft_selling', label: 'Soft Selling', icon: '💬' },
  { id: 'problem_solution', label: 'Problem/Solution', icon: '💡' },
  { id: 'promotional', label: 'Promotional', icon: '🔥' },
  { id: 'educational', label: 'Educational', icon: '📚' },
  { id: 'short_hook', label: 'Short Hook', icon: '⚡' },
];

const platforms: { id: SocialPlatform; label: string; icon: string }[] = [
  { id: 'facebook', label: 'Facebook', icon: '📘' },
  { id: 'tiktok', label: 'TikTok', icon: '🎵' },
  { id: 'youtube', label: 'YouTube', icon: '📺' },
];

// Template-based content generation per platform and style
function generateContent(product: AffiliateProduct, platform: SocialPlatform, style: ContentStyle): Partial<ContentItem> {
  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;
  const price = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.price);
  const mpName = product.marketplace.charAt(0).toUpperCase() + product.marketplace.slice(1);

  const templates: Record<SocialPlatform, Record<ContentStyle, { title?: string; caption: string; hashtags: string[]; cta: string }>> = {
    facebook: {
      review: {
        caption: `🔥 REVIEW JUJUR: ${product.title}\n\nSetelah coba produk ini, jujur worth it banget!\n\n💰 ${price}${discount > 0 ? ` (Diskon ${discount}%)` : ''}\n✅ Kualitas premium\n✅ Harga terjangkau\n\n🔗 Link pembelian di komentar!`,
        hashtags: ['#ReviewJujur', '#Rekomendasi', `#${mpName}Finds`, '#WorthIt'],
        cta: `Beli di ${mpName} → Link di komentar`,
      },
      soft_selling: {
        caption: `Cerita dikit ya...\n\nDulu aku susah banget cari ${product.title.split(' ')[0]} yang bagus. Terus coba yang ini dan ternyata...\n\n${price} doang tapi kualitasnya gak main-main! 🤩\n\nYang mau tau link-nya, cek komentar ya 👇`,
        hashtags: ['#StoryTime', '#Rekomendasi', '#RacunOnline'],
        cta: `Link di komentar ya!`,
      },
      problem_solution: {
        caption: `Pernah gak sih ngalamin ini? 😩\n\nAku dulu juga gitu, sampai akhirnya ketemu ${product.title}!\n\n✅ Masalah solved\n✅ Harga cuma ${price}\n\n🔗 Link di komentar!`,
        hashtags: ['#Solusi', '#LifeHack', `#${mpName}Finds`],
        cta: `Solusi ada di komentar →`,
      },
      promotional: {
        caption: `🚨 FLASH SALE ALERT! 🚨\n\n${product.title}\n\n💰 ${price}${discount > 0 ? `\n🔥 HEMAT ${discount}%!` : ''}\n\nBuruan sebelum kehabisan! 🔗 Link di komentar!`,
        hashtags: ['#FlashSale', '#Diskon', '#Promo', '#Murah'],
        cta: `Beli sekarang → Link di komentar`,
      },
      educational: {
        caption: `📚 TAHUKAH KAMU?\n\nTips memilih ${product.title.split(' ')[0]} yang bagus:\n\n1. Perhatikan kualitas\n2. Cek review pembeli\n3. Bandingkan harga\n\nDan aku rekomendasiin yang ini karena...\n\n💰 ${price}\n🔗 Link di komentar!`,
        hashtags: ['#Tips', '#Edukasi', '#InfoProduk'],
        cta: `Link produk di komentar`,
      },
      short_hook: {
        caption: `${product.title} cuma ${price}?! 🤯\n\nGak percaya? Swipe →`,
        hashtags: ['#Viral', '#Murah', '#Racun'],
        cta: `Link di komentar!`,
      },
    },
    tiktok: {
      review: {
        caption: `${product.title} ${price}!\n\nWorth it gak? Tonton sampai habis! 🔥\n\nLink di bio 👆`,
        hashtags: [`#${mpName}Finds`, '#Review', '#Racun', '#Murah'],
        cta: 'Link di bio',
      },
      soft_selling: {
        caption: `POV: Kamu nemu ${product.title.split(' ')[0]} terbaik dengan harga ${price} 😍\n\nLink di bio!`,
        hashtags: ['#POV', '#Racun', '#FYP', '#Viral'],
        cta: 'Link di bio',
      },
      problem_solution: {
        caption: `Stop scroll! Kalau kamu punya masalah ini, aku punya solusinya!\n\n${product.title} - ${price}\n\nLink di bio 👆`,
        hashtags: ['#Solusi', '#LifeHack', '#FYP'],
        cta: 'Link di bio',
      },
      promotional: {
        caption: `🚨 ${discount > 0 ? `DISKON ${discount}%` : 'PROMO'}! 🚨\n${product.title}\n${price}\n\nBuruan sebelum habis!\nLink di bio 🔗`,
        hashtags: ['#FlashSale', '#Diskon', '#FYP', '#Viral'],
        cta: 'Link di bio',
      },
      educational: {
        caption: `3 hal yang harus kamu tau sebelum beli ${product.title.split(' ')[0]}:\n\n1️⃣ Kualitas\n2️⃣ Harga\n3️⃣ Review\n\nSemua ada di video ini!\nLink di bio 👆`,
        hashtags: ['#Tips', '#Edukasi', '#FYP'],
        cta: 'Link di bio',
      },
      short_hook: {
        caption: `${product.title} ${price}?! 🤯\nLink di bio 👆`,
        hashtags: ['#Viral', '#Murah', '#FYP'],
        cta: 'Link di bio',
      },
    },
    youtube: {
      review: {
        title: `Review Jujur ${product.title} | Worth It?`,
        caption: `Review lengkap ${product.title}!\n\n💰 Harga: ${price}${discount > 0 ? ` (Diskon ${discount}%)` : ''}\n\n🔗 Link pembelian: ${product.affiliateUrl}\n\nTimestamp:\n00:00 - Intro\n01:00 - Unboxing\n03:00 - Review\n05:00 - Kesimpulan\n\nJangan lupa like & subscribe!`,
        hashtags: ['#Review', `#${mpName}`, '#WorthIt', '#Rekomendasi'],
        cta: 'Link di deskripsi',
      },
      soft_selling: {
        title: `Akhirnya Nemu ${product.title.split(' ')[0]} Terbaik!`,
        caption: `Cerita pengalaman aku pakai ${product.title}...\n\n💰 ${price}\n\n🔗 Link: ${product.affiliateUrl}\n\nLike & Subscribe!`,
        hashtags: ['#StoryTime', '#Rekomendasi', '#Review'],
        cta: 'Link di deskripsi',
      },
      problem_solution: {
        title: `Solusi ${product.title.split(' ')[0]} Terbaik - ${price}!`,
        caption: `Punya masalah ini? Aku punya solusinya!\n\n${product.title}\n💰 ${price}\n\n🔗 Link: ${product.affiliateUrl}`,
        hashtags: ['#Solusi', '#Tips', '#Review'],
        cta: 'Link di deskripsi',
      },
      promotional: {
        title: `🔥 ${discount > 0 ? `DISKON ${discount}%` : 'PROMO'} - ${product.title}!`,
        caption: `PROMO ALERT!\n\n${product.title}\n💰 ${price}${discount > 0 ? ` (Hemat ${discount}%)` : ''}\n\n🔗 Link: ${product.affiliateUrl}\n\nBuruan sebelum kehabisan!`,
        hashtags: ['#Promo', '#Diskon', '#FlashSale'],
        cta: 'Link di deskripsi',
      },
      educational: {
        title: `Panduan Lengkap Memilih ${product.title.split(' ')[0]}`,
        caption: `Panduan lengkap sebelum beli ${product.title}!\n\n💰 ${price}\n\n🔗 Link: ${product.affiliateUrl}\n\nSubscribe untuk tips lainnya!`,
        hashtags: ['#Tutorial', '#Panduan', '#Tips'],
        cta: 'Link di deskripsi',
      },
      short_hook: {
        title: `${product.title} Cuma ${price}?!`,
        caption: `Shorts: ${product.title} ${price}!\n\n🔗 Link: ${product.affiliateUrl}`,
        hashtags: ['#Shorts', '#Viral', '#Murah'],
        cta: 'Link di deskripsi',
      },
    },
  };

  const template = templates[platform][style];
  return {
    title: template.title,
    caption: template.caption,
    hashtags: template.hashtags,
    cta: template.cta,
  };
}

export default function ContentCreator({ products, contentItems, onCreateContent, onUpdateContent, onDeleteContent }: ContentCreatorProps) {
  const readyProducts = products.filter(p => p.status === 'ready');
  const [selectedProductId, setSelectedProductId] = useState(readyProducts[0]?.id || '');
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>('facebook');
  const [selectedStyle, setSelectedStyle] = useState<ContentStyle>('review');
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [generatedCaption, setGeneratedCaption] = useState('');
  const [generatedHashtags, setGeneratedHashtags] = useState('');
  const [generatedCta, setGeneratedCta] = useState('');

  const handleGenerate = () => {
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    const result = generateContent(product, selectedPlatform, selectedStyle);
    setGeneratedTitle(result.title || '');
    setGeneratedCaption(result.caption || '');
    setGeneratedHashtags((result.hashtags || []).join(' '));
    setGeneratedCta(result.cta || '');
  };

  const handleSave = () => {
    if (!selectedProductId || !generatedCaption) {
      alert('Pilih produk dan generate konten terlebih dahulu');
      return;
    }

    const now = new Date().toISOString();
    const newContent: ContentItem = {
      id: `content_${Date.now()}`,
      productId: selectedProductId,
      platform: selectedPlatform,
      title: generatedTitle || undefined,
      caption: generatedCaption,
      hashtags: generatedHashtags.split(' ').filter(h => h.startsWith('#')),
      cta: generatedCta,
      contentStyle: selectedStyle,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    };

    onCreateContent(newContent);
    setGeneratedTitle('');
    setGeneratedCaption('');
    setGeneratedHashtags('');
    setGeneratedCta('');
  };

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    review: 'bg-blue-100 text-blue-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    scheduled: 'bg-purple-100 text-purple-700',
    published: 'bg-emerald-100 text-emerald-700',
    failed: 'bg-orange-100 text-orange-700',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Buat Konten</h1>
        <p className="text-gray-500 mt-1">Generate konten platform-specific untuk produk affiliate</p>
      </div>

      {readyProducts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <span className="text-6xl mb-4 block">🛒</span>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Belum Ada Produk Ready</h3>
          <p className="text-gray-500">Tambah produk dan set status ke "Ready" terlebih dahulu di halaman Produk.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Generator */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-3">🛒 Pilih Produk</h3>
              <select value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                {readyProducts.map(p => (
                  <option key={p.id} value={p.id}>{p.title} ({p.marketplace})</option>
                ))}
              </select>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-3">📱 Platform</h3>
              <div className="grid grid-cols-3 gap-3">
                {platforms.map(p => (
                  <button key={p.id} onClick={() => setSelectedPlatform(p.id)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                      selectedPlatform === p.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <span className="text-2xl">{p.icon}</span>
                    <span className="text-xs font-medium">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-3">🎨 Content Style</h3>
              <div className="grid grid-cols-2 gap-2">
                {contentStyles.map(s => (
                  <button key={s.id} onClick={() => setSelectedStyle(s.id)}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all ${
                      selectedStyle === s.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <span>{s.icon}</span>
                    <span className="text-xs font-medium">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleGenerate}
              className="w-full gradient-primary text-white py-3 rounded-xl font-semibold shadow-lg shadow-purple-500/30 hover:shadow-xl transition-all">
              ✨ Generate Konten
            </button>
          </div>

          {/* Preview & Edit */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-3">✍️ Edit Konten</h3>
              {selectedPlatform === 'youtube' && (
                <div className="mb-3">
                  <label className="text-xs text-gray-500 mb-1 block">Title</label>
                  <input type="text" value={generatedTitle} onChange={e => setGeneratedTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              )}
              <div className="mb-3">
                <label className="text-xs text-gray-500 mb-1 block">Caption</label>
                <textarea value={generatedCaption} onChange={e => setGeneratedCaption(e.target.value)} rows={8}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" />
                <p className="text-xs text-gray-400 mt-1">{generatedCaption.length} karakter</p>
              </div>
              <div className="mb-3">
                <label className="text-xs text-gray-500 mb-1 block">Hashtags</label>
                <input type="text" value={generatedHashtags} onChange={e => setGeneratedHashtags(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div className="mb-3">
                <label className="text-xs text-gray-500 mb-1 block">CTA</label>
                <input type="text" value={generatedCta} onChange={e => setGeneratedCta(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <button onClick={handleSave}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors">
                💾 Simpan Konten
              </button>
            </div>

            {/* Existing Content List */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-3">📋 Konten Saya ({contentItems.length})</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {contentItems.map(c => (
                  <div key={c.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <span>{c.platform === 'facebook' ? '📘' : c.platform === 'tiktok' ? '🎵' : '📺'}</span>
                    <span className="text-xs font-medium text-gray-700 flex-1 truncate">{c.title || c.caption.slice(0, 40)}...</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[c.status]}`}>{c.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
