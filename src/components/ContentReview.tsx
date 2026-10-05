import { useState } from 'react';

function getTimeZoneOffset(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'longOffset' }).formatToParts(date);
  const value = parts.find(part => part.type === 'timeZoneName')?.value || 'GMT';
  const match = value.match(/GMT([+-])(\d{2}):?(\d{2})?/);
  if (!match) return '+00:00';
  const hours = match[2] || '00';
  const minutes = match[3] || '00';
  return `${match[1]}${hours}:${minutes}`;
}

import type { AffiliateProduct, ContentItem, ScheduledPost, BufferChannel, SocialPlatform } from '../types';

interface ContentReviewProps {
  contentItems: ContentItem[];
  products: AffiliateProduct[];
  onUpdateStatus: (id: string, status: ContentItem['status']) => void;
  onUpdateContent: (id: string, updates: Partial<ContentItem>) => void;
  onSchedulePosts: (posts: ScheduledPost[]) => void;
  bufferChannels: BufferChannel[];
}

export default function ContentReview({ contentItems, products, onUpdateStatus, onUpdateContent, onSchedulePosts, bufferChannels }: ContentReviewProps) {
  const [selectedContentIds, setSelectedContentIds] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>(['facebook', 'tiktok', 'youtube']);
  const [frequency, setFrequency] = useState<'1x/day' | '2x/day'>('1x/day');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [timezone, setTimezone] = useState('Asia/Jakarta');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState('');

  const draftContent = contentItems.filter(c => c.status === 'draft' || c.status === 'review');
  const approvedContent = contentItems.filter(c => c.status === 'approved');

  const toggleContentSelection = (id: string) => {
    setSelectedContentIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const togglePlatform = (p: SocialPlatform) => {
    setSelectedPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const generateQueue = () => {
    if (selectedContentIds.length === 0 || selectedPlatforms.length === 0) {
      alert('Pilih minimal 1 konten dan 1 platform');
      return;
    }

    const posts: ScheduledPost[] = [];
    const postsPerDay = frequency === '1x/day' ? 1 : 2;
    const times = frequency === '1x/day' ? ['10:00'] : ['10:00', '16:00'];

    let contentIndex = 0;
    let platformIndex = 0;
    let timeIndex = 0;

    for (let day = 0; day < 7; day++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + day);

      for (let slot = 0; slot < postsPerDay && contentIndex < selectedContentIds.length; slot++) {
        const contentId = selectedContentIds[contentIndex % selectedContentIds.length];
        const content = contentItems.find(c => c.id === contentId);
        const product = products.find(p => p.id === content?.productId);
        if (!content || !product) continue;

        const platform = selectedPlatforms[platformIndex % selectedPlatforms.length];
        const time = times[timeIndex % times.length];
        const dateString = date.toISOString().split('T')[0];
        const offset = getTimeZoneOffset(new Date(`${dateString}T${time}:00Z`), timezone);
        const scheduledAt = `${dateString}T${time}:00${offset}`;

        // Never schedule content that is no longer approved.
        if (content.status !== 'approved') continue;

        posts.push({
          id: `sched_${Date.now()}_${posts.length}`,
          contentId: content.id,
          productId: product.id,
          productName: product.title,
          productImage: '📦',
          platform,
          scheduledAt,
          timezone,
          status: 'scheduled',
          idempotencyKey: `idem_${contentId}_${platform}_${day}_${slot}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        contentIndex++;
        platformIndex++;
        timeIndex++;
      }
    }

    if (posts.length > 0) {
      onSchedulePosts(posts);
      // Keep the approval gate explicit: only content that actually produced a queue entry is marked scheduled.
      const scheduledContentIds = [...new Set(posts.map(post => post.contentId))];
      scheduledContentIds.forEach(id => onUpdateStatus(id, 'scheduled'));
      setSelectedContentIds([]);
      alert(`✅ ${posts.length} posting berhasil dijadwalkan untuk 7 hari ke depan!`);
    }
  };

  const handleApprove = (id: string) => onUpdateStatus(id, 'approved');
  const handleReject = (id: string) => onUpdateStatus(id, 'rejected');
  const handleStartEdit = (id: string, caption: string) => { setEditingId(id); setEditCaption(caption); };
  const handleSaveEdit = (id: string) => { onUpdateContent(id, { caption: editCaption }); setEditingId(null); };

  const connectedChannels = bufferChannels.filter(c => c.connected);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Review & Queue</h1>
        <p className="text-gray-500 mt-1">Review konten dan generate 7-day content queue</p>
      </div>

      {/* Review Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">📝 Review Konten ({draftContent.length})</h3>
        {draftContent.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">Tidak ada konten untuk di-review</p>
        ) : (
          <div className="space-y-3">
            {draftContent.map(content => {
              const product = products.find(p => p.id === content.productId);
              return (
                <div key={content.id} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span>{content.platform === 'facebook' ? '📘' : content.platform === 'tiktok' ? '🎵' : '📺'}</span>
                    <span className="text-sm font-medium text-gray-700">{product?.title || 'Unknown Product'}</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{content.contentStyle}</span>
                  </div>
                  {editingId === content.id ? (
                    <div className="space-y-2">
                      <textarea value={editCaption} onChange={e => setEditCaption(e.target.value)} rows={4}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" />
                      <div className="flex gap-2">
                        <button onClick={() => handleSaveEdit(content.id)} className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg">💾 Save</button>
                        <button onClick={() => setEditingId(null)} className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap line-clamp-3 mb-3">{content.caption}</p>
                      <div className="flex gap-2">
                        <button onClick={() => handleApprove(content.id)} className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200">✅ Approve</button>
                        <button onClick={() => handleReject(content.id)} className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-200">❌ Reject</button>
                        <button onClick={() => handleStartEdit(content.id, content.caption)} className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-200">✏️ Edit</button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 7-Day Queue Generator */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">📅 Generate 7-Day Content Queue</h3>
        
        {/* Select approved content */}
        <div className="mb-4">
          <label className="text-sm text-gray-600 mb-2 block font-medium">Pilih Konten Approved ({approvedContent.length} tersedia)</label>
          {approvedContent.length === 0 ? (
            <p className="text-sm text-gray-400 bg-gray-50 p-3 rounded-lg">Belum ada konten yang di-approve</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {approvedContent.map(c => {
                const product = products.find(p => p.id === c.productId);
                return (
                  <label key={c.id} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer ${
                    selectedContentIds.includes(c.id) ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                  }`}>
                    <input type="checkbox" checked={selectedContentIds.includes(c.id)} onChange={() => toggleContentSelection(c.id)} className="rounded" />
                    <span className="text-sm">{c.platform === 'facebook' ? '📘' : c.platform === 'tiktok' ? '🎵' : '📺'}</span>
                    <span className="text-xs text-gray-700 truncate">{product?.title?.slice(0, 30)}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Platform selection */}
        <div className="mb-4">
          <label className="text-sm text-gray-600 mb-2 block font-medium">Platform Target</label>
          <div className="flex gap-3">
            {(['facebook', 'tiktok', 'youtube'] as SocialPlatform[]).map(p => (
              <button key={p} onClick={() => togglePlatform(p)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all ${
                  selectedPlatforms.includes(p) ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                }`}>
                <span>{p === 'facebook' ? '📘' : p === 'tiktok' ? '🎵' : '📺'}</span>
                <span className="text-sm font-medium capitalize">{p}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Frequency & Date */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Frekuensi</label>
            <select value={frequency} onChange={e => setFrequency(e.target.value as any)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="1x/day">1x per hari</option>
              <option value="2x/day">2x per hari</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Tanggal Mulai</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Timezone</label>
            <select value={timezone} onChange={e => setTimezone(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="Asia/Jakarta">WIB (Asia/Jakarta)</option>
              <option value="Asia/Makassar">WITA (Asia/Makassar)</option>
              <option value="Asia/Jayapura">WIT (Asia/Jayapura)</option>
            </select>
          </div>
        </div>

        {/* Buffer channel status */}
        <div className="mb-4 p-3 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-500 mb-1">Buffer Channels Connected: {connectedChannels.length}/{bufferChannels.length}</p>
          {connectedChannels.length === 0 && (
            <p className="text-xs text-amber-600">⚠️ Belum ada channel Buffer yang terhubung. Posting akan disimpan sebagai draft.</p>
          )}
        </div>

        <button onClick={generateQueue}
          disabled={selectedContentIds.length === 0 || selectedPlatforms.length === 0}
          className="w-full gradient-primary text-white py-3 rounded-xl font-semibold shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
          🚀 Generate 7-Day Queue
        </button>
      </div>
    </div>
  );
}
