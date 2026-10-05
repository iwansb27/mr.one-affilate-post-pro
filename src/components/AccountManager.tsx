import { SocialAccount } from '../types';

interface AccountManagerProps {
  accounts: SocialAccount[];
  onToggleConnection: (id: string) => void;
}

export default function AccountManager({ accounts, onToggleConnection }: AccountManagerProps) {
  const platformDetails: Record<string, { icon: string; color: string; gradient: string; description: string }> = {
    facebook: { icon: '📘', color: 'bg-blue-600', gradient: 'from-blue-500 to-blue-700', description: 'Posting ke Feed, Stories, dan Reels' },
    instagram: { icon: '📷', color: 'bg-pink-500', gradient: 'from-purple-500 via-pink-500 to-orange-400', description: 'Posting ke Feed, Stories, dan Reels' },
    youtube: { icon: '📺', color: 'bg-red-600', gradient: 'from-red-500 to-red-700', description: 'Upload video, Shorts, dan Community Posts' },
    tiktok: { icon: '🎵', color: 'bg-gray-800', gradient: 'from-gray-800 to-gray-900', description: 'Posting video pendek dan TikTok Shop' },
  };

  const marketplaceConnections = [
    { name: 'Shopee Affiliate', icon: '🧡', status: 'connected', products: 45, earnings: 'Rp 2.450.000' },
    { name: 'Lazada Affiliate', icon: '💙', status: 'connected', products: 32, earnings: 'Rp 1.890.000' },
    { name: 'Tokopedia Affiliate', icon: '💚', status: 'connected', products: 28, earnings: 'Rp 1.230.000' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Kelola Akun</h1>
        <p className="text-gray-500 mt-1">Hubungkan akun marketplace dan media sosial Anda</p>
      </div>

      {/* Marketplace Connections */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">🏪 Akun Marketplace Affiliate</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {marketplaceConnections.map((mp, idx) => (
            <div key={idx} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{mp.icon}</span>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{mp.name}</p>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓ Terhubung</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <p className="text-lg font-bold text-gray-800">{mp.products}</p>
                  <p className="text-xs text-gray-500">Produk</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <p className="text-sm font-bold text-green-600">{mp.earnings}</p>
                  <p className="text-xs text-gray-500">Komisi</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Social Media Accounts */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">📱 Akun Media Sosial</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map(account => {
            const details = platformDetails[account.platform];
            return (
              <div key={account.id} className={`border-2 rounded-xl p-5 transition-all ${
                account.connected ? 'border-green-200 bg-green-50/50' : 'border-gray-200 bg-gray-50/50'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${details.gradient} flex items-center justify-center text-2xl text-white shadow-lg`}>
                      {details.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{account.platform.charAt(0).toUpperCase() + account.platform.slice(1)}</p>
                      <p className="text-sm text-gray-500">{account.username}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    account.connected ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {account.connected ? '● Terhubung' : '○ Belum'}
                  </span>
                </div>

                <p className="text-xs text-gray-500 mb-3">{details.description}</p>

                {account.connected && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-semibold text-gray-700">
                      {account.followers.toLocaleString()} followers
                    </span>
                  </div>
                )}

                <button
                  onClick={() => onToggleConnection(account.id)}
                  className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all ${
                    account.connected
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : `bg-gradient-to-r ${details.gradient} text-white hover:opacity-90 shadow-md`
                  }`}
                >
                  {account.connected ? 'Putuskan' : 'Hubungkan Akun'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* API Settings */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">⚙️ Pengaturan API</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Shopee Affiliate API Key</label>
              <input
                type="password"
                value="sk-xxxxxxxxxxxx"
                readOnly
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Lazada Affiliate API Key</label>
              <input
                type="password"
                value="laz-xxxxxxxxxxxx"
                readOnly
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Tokopedia Affiliate API Key</label>
              <input
                type="password"
                value="tkp-xxxxxxxxxxxx"
                readOnly
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Meta API Access Token</label>
              <input
                type="password"
                value="meta-xxxxxxxxxxxx"
                readOnly
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
              />
            </div>
          </div>
          <button className="gradient-primary text-white px-6 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-purple-500/30 hover:shadow-xl transition-all">
            💾 Simpan Pengaturan
          </button>
        </div>
      </div>

      {/* Automation Rules */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
        <h3 className="font-semibold text-lg mb-2">🤖 Fitur Otomatisasi</h3>
        <p className="text-indigo-100 text-sm mb-4">Aktifkan fitur otomatis untuk memaksimalkan hasil affiliate Anda</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { label: 'Auto-post最佳 waktu', desc: 'Posting di jam prime time' },
            { label: 'Auto-caption AI', desc: 'Generate caption dengan AI' },
            { label: 'Auto-hashtag', desc: 'Hashtag trending otomatis' },
          ].map((feature, idx) => (
            <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <p className="font-medium text-sm">{feature.label}</p>
              <p className="text-xs text-indigo-200">{feature.desc}</p>
              <div className="mt-2 flex items-center gap-2">
                <div className="w-8 h-4 bg-white/30 rounded-full relative cursor-pointer">
                  <div className="w-3 h-3 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                </div>
                <span className="text-xs text-indigo-200">Aktif</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
