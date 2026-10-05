import { SocialAccount } from '../types';
import { ConnectorStatus } from '../services/types';
import { marketplaceConnectorRegistry, socialConnectorRegistry, isSupabaseConfigured, contentEngine } from '../services';

interface SystemStatus {
  database: 'CONFIGURED' | 'NOT_CONFIGURED';
  marketplaceConnectors: Record<string, ConnectorStatus>;
  socialConnectors: Record<string, ConnectorStatus>;
  contentEngine: { aiStatus: 'CONFIGURED' | 'NOT_CONFIGURED'; templateStatus: 'FUNCTIONAL' };
  scheduler: { isConfigured: boolean; workerStatus: 'NOT_RUNNING' | 'RUNNING' };
}

interface AccountManagerProps {
  accounts: SocialAccount[];
  onToggleConnection: (id: string) => void;
  systemStatus?: SystemStatus | null;
}

export default function AccountManager({ accounts, onToggleConnection, systemStatus }: AccountManagerProps) {
  const platformDetails: Record<string, { icon: string; color: string; gradient: string; description: string }> = {
    facebook: { icon: '📘', color: 'bg-blue-600', gradient: 'from-blue-500 to-blue-700', description: 'Posting ke Feed, Stories, dan Reels' },
    instagram: { icon: '📷', color: 'bg-pink-500', gradient: 'from-purple-500 via-pink-500 to-orange-400', description: 'Posting ke Feed, Stories, dan Reels' },
    youtube: { icon: '📺', color: 'bg-red-600', gradient: 'from-red-500 to-red-700', description: 'Upload video, Shorts, dan Community Posts' },
    tiktok: { icon: '🎵', color: 'bg-gray-800', gradient: 'from-gray-800 to-gray-900', description: 'Posting video pendek dan TikTok Shop' },
  };

  // Get real connector statuses
  const marketplaceStatuses = systemStatus?.marketplaceConnectors || marketplaceConnectorRegistry.getAllStatuses();
  const socialStatuses = systemStatus?.socialConnectors || socialConnectorRegistry.getAllStatuses();
  const dbStatus = systemStatus?.database || (isSupabaseConfigured() ? 'CONFIGURED' : 'NOT_CONFIGURED');
  const aiStatus = systemStatus?.contentEngine?.aiStatus || contentEngine.getAIStatus();

  const marketplaceConnections = [
    { name: 'Shopee Affiliate', icon: '🧡', key: 'shopee', connectorStatus: marketplaceStatuses.shopee || 'NOT_CONFIGURED' },
    { name: 'Lazada Affiliate', icon: '💙', key: 'lazada', connectorStatus: marketplaceStatuses.lazada || 'NOT_CONFIGURED' },
    { name: 'Tokopedia Affiliate', icon: '💚', key: 'tokopedia', connectorStatus: marketplaceStatuses.tokopedia || 'NOT_CONFIGURED' },
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
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    mp.connectorStatus === 'CONNECTED' ? 'bg-green-100 text-green-700' :
                    mp.connectorStatus === 'CONNECTOR_READY' ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {mp.connectorStatus === 'CONNECTED' ? '✓ Terhubung' :
                     mp.connectorStatus === 'CONNECTOR_READY' ? '🔌 Connector Ready' :
                     '⚙️ Not Configured'}
                  </span>
                </div>
              </div>
              <div className="mt-3">
                {mp.connectorStatus === 'NOT_CONFIGURED' && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-2">API credentials belum dikonfigurasi.</p>
                    <p className="text-xs text-gray-400">
                      Set <code className="bg-gray-200 px-1 rounded">VITE_{mp.key.toUpperCase()}_APP_KEY</code> di .env
                    </p>
                  </div>
                )}
                {mp.connectorStatus === 'CONNECTOR_READY' && (
                  <div className="bg-amber-50 rounded-lg p-3">
                    <p className="text-xs text-amber-700">
                      Connector siap. OAuth flow belum diimplementasi.
                    </p>
                  </div>
                )}
                {mp.connectorStatus === 'CONNECTED' && (
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-xs text-green-700">
                      ✓ Terhubung dan siap digunakan
                    </p>
                  </div>
                )}
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
            const connectorStatus = socialStatuses[account.platform] || 'NOT_CONFIGURED';
            return (
              <div key={account.id} className={`border-2 rounded-xl p-5 transition-all ${
                connectorStatus === 'CONNECTED' ? 'border-green-200 bg-green-50/50' :
                connectorStatus === 'CONNECTOR_READY' ? 'border-amber-200 bg-amber-50/50' :
                'border-gray-200 bg-gray-50/50'
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
                    connectorStatus === 'CONNECTED' ? 'bg-green-100 text-green-700' :
                    connectorStatus === 'CONNECTOR_READY' ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {connectorStatus === 'CONNECTED' ? '● Connected' :
                     connectorStatus === 'CONNECTOR_READY' ? '🔌 Ready' :
                     '⚙️ Not Configured'}
                  </span>
                </div>

                <p className="text-xs text-gray-500 mb-3">{details.description}</p>

                {connectorStatus === 'NOT_CONFIGURED' && (
                  <div className="bg-gray-100 rounded-lg p-3 mb-3">
                    <p className="text-xs text-gray-600">
                      API credentials belum dikonfigurasi. Hubungkan akun setelah setup credentials.
                    </p>
                  </div>
                )}

                {connectorStatus === 'CONNECTOR_READY' && (
                  <div className="bg-amber-100 rounded-lg p-3 mb-3">
                    <p className="text-xs text-amber-700">
                      Connector siap. OAuth flow belum diimplementasi.
                    </p>
                  </div>
                )}

                {connectorStatus === 'CONNECTED' && account.connected && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-semibold text-gray-700">
                      {account.followers.toLocaleString()} followers
                    </span>
                  </div>
                )}

                <button
                  onClick={() => onToggleConnection(account.id)}
                  disabled={connectorStatus !== 'CONNECTED'}
                  className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all ${
                    connectorStatus === 'CONNECTED'
                      ? account.connected
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : `bg-gradient-to-r ${details.gradient} text-white hover:opacity-90 shadow-md`
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {connectorStatus === 'CONNECTED' 
                    ? (account.connected ? 'Putuskan' : 'Hubungkan Akun')
                    : 'Credentials Required'}
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
