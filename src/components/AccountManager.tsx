import type { BufferChannel, SocialPlatform } from '../types';
import { bufferService } from '../services/social/buffer';

interface AccountManagerProps {
  channels: BufferChannel[];
  onUpdateChannel: (id: string, updates: Partial<BufferChannel>) => void;
}

export default function AccountManager({ channels, onUpdateChannel }: AccountManagerProps) {
  const bufferStatus = bufferService.getStatus();

  const platformInfo: Record<SocialPlatform, { icon: string; name: string; gradient: string }> = {
    facebook: { icon: '📘', name: 'Facebook', gradient: 'from-blue-500 to-blue-700' },
    tiktok: { icon: '🎵', name: 'TikTok', gradient: 'from-gray-800 to-gray-900' },
    youtube: { icon: '📺', name: 'YouTube', gradient: 'from-red-500 to-red-700' },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Buffer Integration</h1>
        <p className="text-gray-500 mt-1">Kelola koneksi Buffer untuk auto-publishing</p>
      </div>

      {/* Buffer Status */}
      <div className={`rounded-2xl p-6 border-2 ${
        bufferStatus === 'CONNECTED' ? 'bg-green-50 border-green-200' :
        bufferStatus === 'CONNECTOR_READY' ? 'bg-amber-50 border-amber-200' :
        'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔗</span>
            <div>
              <p className="font-semibold text-gray-800">Buffer API</p>
              <p className="text-sm text-gray-500">Publishing provider utama</p>
            </div>
          </div>
          <span className={`text-sm px-3 py-1 rounded-full font-medium ${
            bufferStatus === 'CONNECTED' ? 'bg-green-100 text-green-700' :
            bufferStatus === 'CONNECTOR_READY' ? 'bg-amber-100 text-amber-700' :
            'bg-gray-200 text-gray-600'
          }`}>
            {bufferStatus === 'CONNECTED' ? '✅ Connected' :
             bufferStatus === 'CONNECTOR_READY' ? '🔌 Connector Ready' :
             '⚙️ Not Configured'}
          </span>
        </div>

        {bufferStatus === 'NOT_CONFIGURED' && (
          <div className="bg-white rounded-xl p-4 mt-3">
            <p className="text-sm text-gray-700 font-medium mb-2">Untuk mengaktifkan Buffer:</p>
            <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
              <li>Buat akun di <a href="https://buffer.com" target="_blank" className="text-purple-600 underline">buffer.com</a></li>
              <li>Connect social media accounts (Facebook, TikTok, YouTube)</li>
              <li>Dapatkan Access Token dari Buffer Developer settings</li>
              <li>Set <code className="bg-gray-100 px-1 rounded">VITE_BUFFER_ACCESS_TOKEN</code> di file .env</li>
            </ol>
          </div>
        )}

        {bufferStatus === 'CONNECTOR_READY' && (
          <div className="bg-white rounded-xl p-4 mt-3">
            <p className="text-sm text-amber-700">
              ✅ Buffer connector siap. Access token sudah dikonfigurasi.
              Channel akan otomatis terdeteksi dari akun Buffer Anda.
            </p>
          </div>
        )}
      </div>

      {/* Connected Channels */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">📱 Connected Channels</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {channels.map(channel => {
            const info = platformInfo[channel.platform];
            return (
              <div key={channel.id} className={`border-2 rounded-xl p-4 ${
                channel.connected ? 'border-green-200 bg-green-50/50' : 'border-gray-200'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${info.gradient} flex items-center justify-center text-xl text-white shadow-lg`}>
                    {info.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{info.name}</p>
                    <p className="text-xs text-gray-500">{channel.username}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    channel.connected ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {channel.connected ? '● Connected' : '○ Disconnected'}
                  </span>
                  <button
                    onClick={() => onUpdateChannel(channel.id, { connected: !channel.connected })}
                    className={`text-xs px-3 py-1 rounded-lg ${
                      channel.connected ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    {channel.connected ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Buffer Configuration */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">⚙️ Buffer Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Buffer Access Token</label>
            <input
              type="password"
              value={import.meta.env.VITE_BUFFER_ACCESS_TOKEN ? '••••••••••••' : ''}
              readOnly
              placeholder="Set VITE_BUFFER_ACCESS_TOKEN in .env"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
            />
          </div>
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-xs text-blue-700">
              <strong>ℹ️ Info:</strong> Buffer API digunakan sebagai publishing provider. 
              Semua post akan dikirim ke Buffer terlebih dahulu, kemudian Buffer yang akan mempublish ke Facebook, TikTok, dan YouTube.
            </p>
          </div>
        </div>
      </div>

      {/* Publishing Pipeline */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
        <h3 className="font-semibold text-lg mb-3">🔄 Publishing Pipeline</h3>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {['AffiliatePost Pro', '→', 'Buffer', '→', 'Facebook', '/', 'TikTok', '/', 'YouTube', '→', 'Published'].map((item, idx) => (
            <span key={idx} className={`px-2 py-1 rounded ${item === '→' || item === '/' ? 'bg-transparent' : 'bg-white/20'}`}>
              {item}
            </span>
          ))}
        </div>
        <p className="text-indigo-100 text-xs mt-3">
          Konten dikirim ke Buffer → Buffer handles scheduling & publishing → Status tracking kembali ke AffiliatePost Pro
        </p>
      </div>
    </div>
  );
}
