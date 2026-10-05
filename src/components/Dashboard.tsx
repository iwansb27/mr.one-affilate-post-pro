import { ScheduledPost, Product } from '../types';
import { ConnectorStatus } from '../services/types';

interface SystemStatus {
  database: 'CONFIGURED' | 'NOT_CONFIGURED';
  marketplaceConnectors: Record<string, ConnectorStatus>;
  socialConnectors: Record<string, ConnectorStatus>;
  contentEngine: { aiStatus: 'CONFIGURED' | 'NOT_CONFIGURED'; templateStatus: 'FUNCTIONAL' };
  scheduler: { isConfigured: boolean; workerStatus: 'NOT_RUNNING' | 'RUNNING' };
}

interface DashboardProps {
  posts: ScheduledPost[];
  products: Product[];
  systemStatus?: SystemStatus | null;
}

export default function Dashboard({ posts, products, systemStatus }: DashboardProps) {
  const scheduledCount = posts.filter(p => p.status === 'scheduled').length;
  const postedCount = posts.filter(p => p.status === 'posted').length;
  const draftCount = posts.filter(p => p.status === 'draft').length;
  const selectedProducts = products.filter(p => p.selected).length;

  const stats = [
    { label: 'Produk Dipilih', value: selectedProducts, icon: '🛒', color: 'from-orange-400 to-red-500' },
    { label: 'Dijadwalkan', value: scheduledCount, icon: '📅', color: 'from-blue-400 to-purple-500' },
    { label: 'Sudah Posting', value: postedCount, icon: '✅', color: 'from-green-400 to-emerald-500' },
    { label: 'Draft Konten', value: draftCount, icon: '📝', color: 'from-yellow-400 to-orange-500' },
  ];

  const platformStats = [
    { name: 'Facebook', icon: '📘', posts: posts.filter(p => p.platforms.includes('facebook')).length, color: 'bg-blue-600' },
    { name: 'Instagram', icon: '📷', posts: posts.filter(p => p.platforms.includes('instagram')).length, color: 'bg-pink-500' },
    { name: 'YouTube', icon: '📺', posts: posts.filter(p => p.platforms.includes('youtube')).length, color: 'bg-red-600' },
    { name: 'TikTok', icon: '🎵', posts: posts.filter(p => p.platforms.includes('tiktok')).length, color: 'bg-gray-800' },
  ];

  const marketplaceStats = [
    { name: 'Shopee', icon: '🧡', products: products.filter(p => p.marketplace === 'shopee').length, color: 'gradient-shopee' },
    { name: 'Lazada', icon: '💙', products: products.filter(p => p.marketplace === 'lazada').length, color: 'gradient-lazada' },
    { name: 'Tokopedia', icon: '💚', products: products.filter(p => p.marketplace === 'tokopedia').length, color: 'gradient-tokopedia' },
  ];

  const upcomingPosts = posts
    .filter(p => p.status === 'scheduled')
    .sort((a, b) => `${a.scheduledDate}${a.scheduledTime}`.localeCompare(`${b.scheduledDate}${b.scheduledTime}`))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 mt-1">Ringkasan aktivitas affiliate marketing Anda</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Hari ini</p>
          <p className="text-lg font-semibold text-gray-700">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 card-hover">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">{stat.icon}</span>
              <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${stat.color} opacity-20`}></div>
            </div>
            <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Platform Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Distribusi Platform</h3>
          <div className="space-y-4">
            {platformStats.map((platform, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-xl">{platform.icon}</span>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{platform.name}</span>
                    <span className="text-sm text-gray-500">{platform.posts} post</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`${platform.color} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${(platform.posts / Math.max(posts.length, 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Marketplace Stats */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Produk per Marketplace</h3>
          <div className="space-y-4">
            {marketplaceStats.map((marketplace, idx) => (
              <div key={idx} className={`rounded-xl p-4 ${marketplace.color} text-white`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{marketplace.icon}</span>
                    <span className="font-semibold">{marketplace.name}</span>
                  </div>
                  <span className="text-2xl font-bold">{marketplace.products}</span>
                </div>
                <p className="text-sm opacity-80 mt-1">produk tersedia</p>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Posts */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Posting Mendatang</h3>
          <div className="space-y-3">
            {upcomingPosts.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">Belum ada posting terjadwal</p>
            ) : (
              upcomingPosts.map((post) => (
                <div key={post.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <span className="text-2xl">{post.productImage}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{post.productName}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(post.scheduledDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} • {post.scheduledTime}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {post.platforms.map((p, i) => (
                      <span key={i} className="text-xs">
                        {p === 'facebook' ? '📘' : p === 'instagram' ? '📷' : p === 'youtube' ? '📺' : '🎵'}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-1">Mulai Otomatisasi Sekarang!</h3>
            <p className="text-purple-100 text-sm">Pilih produk affiliate, buat konten menarik, dan jadwalkan posting ke semua platform sekaligus.</p>
          </div>
          <div className="flex gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-sm font-medium hover:bg-white/30 transition-colors cursor-pointer">
              🛒 Pilih Produk
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-sm font-medium hover:bg-white/30 transition-colors cursor-pointer">
              ✍️ Buat Konten
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
