import type { AffiliateProduct, ContentItem, ScheduledPost, BufferChannel } from '../types';

interface DashboardProps {
  products: AffiliateProduct[];
  contentItems: ContentItem[];
  scheduledPosts: ScheduledPost[];
  bufferChannels: BufferChannel[];
}

export default function Dashboard({ products, contentItems, scheduledPosts, bufferChannels }: DashboardProps) {
  const readyProducts = products.filter(p => p.status === 'ready').length;
  const approvedContent = contentItems.filter(c => c.status === 'approved').length;
  const scheduledCount = scheduledPosts.filter(p => p.status === 'scheduled').length;
  const publishedCount = scheduledPosts.filter(p => p.status === 'published').length;
  const connectedChannels = bufferChannels.filter(c => c.connected).length;

  const stats = [
    { label: 'Produk Ready', value: readyProducts, icon: '🛒', color: 'from-orange-400 to-red-500' },
    { label: 'Konten Approved', value: approvedContent, icon: '✅', color: 'from-green-400 to-emerald-500' },
    { label: 'Terjadwal', value: scheduledCount, icon: '📅', color: 'from-blue-400 to-purple-500' },
    { label: 'Terpublish', value: publishedCount, icon: '🚀', color: 'from-indigo-400 to-blue-500' },
  ];

  const platformStats = [
    { name: 'Facebook', icon: '📘', count: scheduledPosts.filter(p => p.platform === 'facebook').length, color: 'bg-blue-600' },
    { name: 'TikTok', icon: '🎵', count: scheduledPosts.filter(p => p.platform === 'tiktok').length, color: 'bg-gray-800' },
    { name: 'YouTube', icon: '📺', count: scheduledPosts.filter(p => p.platform === 'youtube').length, color: 'bg-red-600' },
  ];

  const upcomingPosts = scheduledPosts
    .filter(p => p.status === 'scheduled')
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 mt-1">Ringkasan affiliate content automation</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Publishing via</p>
          <p className="text-lg font-semibold text-gray-700">🔗 Buffer</p>
        </div>
      </div>

      {/* Stats */}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Platform Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Distribusi Platform</h3>
          <div className="space-y-4">
            {platformStats.map((p, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-xl">{p.icon}</span>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{p.name}</span>
                    <span className="text-sm text-gray-500">{p.count} post</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className={`${p.color} h-2 rounded-full`} style={{ width: `${Math.min((p.count / Math.max(scheduledPosts.length, 1)) * 100, 100)}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Buffer Channels */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Buffer Channels</h3>
          <div className="space-y-3">
            {bufferChannels.map(ch => (
              <div key={ch.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <span className="text-xl">{ch.platform === 'facebook' ? '📘' : ch.platform === 'tiktok' ? '🎵' : '📺'}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">{ch.username}</p>
                  <p className="text-xs text-gray-500">{ch.platform}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${ch.connected ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                  {ch.connected ? '● Connected' : '○ Disconnected'}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">{connectedChannels}/{bufferChannels.length} channels connected</p>
        </div>

        {/* Upcoming Posts */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Posting Mendatang</h3>
          <div className="space-y-3">
            {upcomingPosts.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">Belum ada posting terjadwal</p>
            ) : (
              upcomingPosts.map(post => (
                <div key={post.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <span className="text-2xl">{post.productImage}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{post.productName}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(post.scheduledAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} • {new Date(post.scheduledAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className="text-sm">{post.platform === 'facebook' ? '📘' : post.platform === 'tiktok' ? '🎵' : '📺'}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Workflow Status */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-500 rounded-2xl p-6 text-white">
        <h3 className="text-xl font-bold mb-3">🔄 Workflow Status</h3>
        <div className="flex flex-wrap gap-3">
          {[
            { step: '1. Input Produk', done: products.length > 0 },
            { step: '2. Buat Konten', done: contentItems.length > 0 },
            { step: '3. Review & Approve', done: approvedContent > 0 },
            { step: '4. Schedule via Buffer', done: scheduledCount > 0 },
            { step: '5. Publish', done: publishedCount > 0 },
          ].map((item, idx) => (
            <div key={idx} className={`px-4 py-2 rounded-xl text-sm font-medium ${item.done ? 'bg-white/30' : 'bg-white/10'}`}>
              {item.done ? '✅' : '⬜'} {item.step}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
