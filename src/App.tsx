import { useState, useEffect } from 'react';
import type { AffiliateProduct, ContentItem, ScheduledPost, BufferChannel, TabType } from './types';
import { sampleProducts, sampleContentItems, sampleScheduledPosts, sampleBufferChannels } from './data/sampleData';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ProductInput from './components/ProductInput';
import ContentCreator from './components/ContentCreator';
import ContentReview from './components/ContentReview';
import QueueManager from './components/QueueManager';
import AccountManager from './components/AccountManager';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [products, setProducts] = useState<AffiliateProduct[]>(sampleProducts);
  const [contentItems, setContentItems] = useState<ContentItem[]>(sampleContentItems);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>(sampleScheduledPosts);
  const [bufferChannels, setBufferChannels] = useState<BufferChannel[]>(sampleBufferChannels);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle adding a new product
  const handleAddProduct = (product: AffiliateProduct) => {
    setProducts(prev => [...prev, product]);
  };

  // Handle updating product status
  const handleUpdateProductStatus = (id: string, status: AffiliateProduct['status']) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  // Handle deleting product
  const handleDeleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // Handle creating content
  const handleCreateContent = (content: ContentItem) => {
    setContentItems(prev => [...prev, content]);
  };

  // Handle updating content status (review workflow)
  const handleUpdateContentStatus = (id: string, status: ContentItem['status']) => {
    setContentItems(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  };

  // Handle updating content
  const handleUpdateContent = (id: string, updates: Partial<ContentItem>) => {
    setContentItems(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  // Handle deleting content
  const handleDeleteContent = (id: string) => {
    setContentItems(prev => prev.filter(c => c.id !== id));
  };

  // Handle scheduling posts (from queue generator)
  const handleSchedulePosts = (posts: ScheduledPost[]) => {
    setScheduledPosts(prev => [...prev, ...posts]);
  };

  // Handle updating post status
  const handleUpdatePostStatus = (id: string, status: ScheduledPost['status']) => {
    setScheduledPosts(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  // Handle deleting post
  const handleDeletePost = (id: string) => {
    setScheduledPosts(prev => prev.filter(p => p.id !== id));
  };

  // Handle updating buffer channels
  const handleUpdateChannel = (id: string, updates: Partial<BufferChannel>) => {
    setBufferChannels(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            products={products}
            contentItems={contentItems}
            scheduledPosts={scheduledPosts}
            bufferChannels={bufferChannels}
          />
        );
      case 'products':
        return (
          <ProductInput
            products={products}
            onAddProduct={handleAddProduct}
            onUpdateStatus={handleUpdateProductStatus}
            onDeleteProduct={handleDeleteProduct}
          />
        );
      case 'content':
        return (
          <ContentCreator
            products={products}
            contentItems={contentItems}
            onCreateContent={handleCreateContent}
            onUpdateContent={handleUpdateContent}
            onDeleteContent={handleDeleteContent}
          />
        );
      case 'review':
        return (
          <ContentReview
            contentItems={contentItems}
            products={products}
            onUpdateStatus={handleUpdateContentStatus}
            onUpdateContent={handleUpdateContent}
            onSchedulePosts={handleSchedulePosts}
            bufferChannels={bufferChannels}
          />
        );
      case 'schedule':
        return (
          <QueueManager
            scheduledPosts={scheduledPosts}
            contentItems={contentItems}
            onUpdateStatus={handleUpdatePostStatus}
            onDeletePost={handleDeletePost}
          />
        );
      case 'accounts':
        return (
          <AccountManager
            channels={bufferChannels}
            onUpdateChannel={handleUpdateChannel}
          />
        );
      default:
        return (
          <Dashboard
            products={products}
            contentItems={contentItems}
            scheduledPosts={scheduledPosts}
            bufferChannels={bufferChannels}
          />
        );
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
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-2xl">
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <div className="w-64" onClick={e => e.stopPropagation()}>
            <Sidebar activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setMobileMenuOpen(false); }} />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 bottom-0">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
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
