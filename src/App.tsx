import { useState } from 'react';
import { TabType, Product, ScheduledPost, SocialAccount } from './types';
import { sampleProducts, sampleScheduledPosts, sampleAccounts } from './data/sampleData';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ProductSelector from './components/ProductSelector';
import ContentCreator from './components/ContentCreator';
import ScheduleManager from './components/ScheduleManager';
import AccountManager from './components/AccountManager';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [products, setProducts] = useState<Product[]>(sampleProducts);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>(sampleScheduledPosts);
  const [accounts, setAccounts] = useState<SocialAccount[]>(sampleAccounts);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleToggleProduct = (id: string) => {
    setProducts(prev => prev.map(p =>
      p.id === id ? { ...p, selected: !p.selected } : p
    ));
  };

  const handleCreatePost = (postData: {
    productId: string;
    platforms: string[];
    caption: string;
    hashtags: string[];
    scheduledDate: string;
    scheduledTime: string;
  }) => {
    const product = products.find(p => p.id === postData.productId);
    if (!product) return;

    const newPost: ScheduledPost = {
      id: Date.now().toString(),
      productId: postData.productId,
      productName: product.name,
      productImage: product.image,
      platforms: postData.platforms as ScheduledPost['platforms'],
      scheduledDate: postData.scheduledDate,
      scheduledTime: postData.scheduledTime,
      caption: postData.caption,
      hashtags: postData.hashtags,
      status: 'scheduled',
      marketplace: product.marketplace === 'shopee' ? 'Shopee' : product.marketplace === 'lazada' ? 'Lazada' : 'Tokopedia',
    };

    setScheduledPosts(prev => [...prev, newPost]);
  };

  const handleDeletePost = (id: string) => {
    setScheduledPosts(prev => prev.filter(p => p.id !== id));
  };

  const handleUpdateStatus = (id: string, status: ScheduledPost['status']) => {
    setScheduledPosts(prev => prev.map(p =>
      p.id === id ? { ...p, status } : p
    ));
  };

  const handleToggleConnection = (id: string) => {
    setAccounts(prev => prev.map(a =>
      a.id === id ? { ...a, connected: !a.connected } : a
    ));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard posts={scheduledPosts} products={products} />;
      case 'products':
        return <ProductSelector products={products} onToggleProduct={handleToggleProduct} />;
      case 'content':
        return <ContentCreator products={products} onCreatePost={handleCreatePost} />;
      case 'schedule':
        return <ScheduleManager posts={scheduledPosts} onDeletePost={handleDeletePost} onUpdateStatus={handleUpdateStatus} />;
      case 'accounts':
        return <AccountManager accounts={accounts} onToggleConnection={handleToggleConnection} />;
      default:
        return <Dashboard posts={scheduledPosts} products={products} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-gray-900 text-white z-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🚀</span>
          <span className="font-bold">AffiliatePost Pro</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-2xl"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <div className="w-64" onClick={e => e.stopPropagation()}>
            <Sidebar
              activeTab={activeTab}
              setActiveTab={(tab) => {
                setActiveTab(tab);
                setMobileMenuOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <div className="fixed left-0 top-0 bottom-0">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0">
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
