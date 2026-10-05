import type { TabType } from '../types';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const menuItems: { id: TabType; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'products', label: 'Produk', icon: '🛒' },
  { id: 'content', label: 'Buat Konten', icon: '✍️' },
  { id: 'review', label: 'Review & Queue', icon: '✅' },
  { id: 'schedule', label: 'Jadwal', icon: '📅' },
  { id: 'accounts', label: 'Buffer', icon: '🔗' },
];

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center text-xl">🚀</div>
          <div>
            <h1 className="font-bold text-lg leading-tight">AffiliatePost</h1>
            <p className="text-xs text-gray-400">Buffer Automation</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
              activeTab === item.id
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-700">
        <div className="bg-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Publishing via Buffer</p>
          <div className="flex items-center gap-2">
            <span className="text-green-400 text-sm">●</span>
            <span className="text-xs text-gray-300">FB • TikTok • YT</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
