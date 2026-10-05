import { useState } from 'react';
import type { ScheduledPost, ContentItem } from '../types';

interface QueueManagerProps {
  scheduledPosts: ScheduledPost[];
  contentItems: ContentItem[];
  onUpdateStatus: (id: string, status: ScheduledPost['status']) => void;
  onDeletePost: (id: string) => void;
}

export default function QueueManager({ scheduledPosts, contentItems, onUpdateStatus, onDeletePost }: QueueManagerProps) {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [filterStatus, setFilterStatus] = useState<'all' | ScheduledPost['status']>('all');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');

  const filteredPosts = scheduledPosts.filter(p => {
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    const matchPlatform = filterPlatform === 'all' || p.platform === filterPlatform;
    return matchStatus && matchPlatform;
  });

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    scheduled: 'bg-blue-100 text-blue-700',
    processing: 'bg-yellow-100 text-yellow-700',
    published: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-500',
  };

  const statusLabels: Record<string, string> = {
    draft: 'Draft',
    scheduled: 'Terjadwal',
    processing: 'Processing',
    published: 'Published',
    failed: 'Gagal',
    cancelled: 'Dibatalkan',
  };

  // Calendar data
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  const getPostsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return filteredPosts.filter(p => p.scheduledAt.startsWith(dateStr));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Jadwal Posting</h1>
          <p className="text-gray-500 mt-1">Kelola queue publishing via Buffer</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
            📋 List
          </button>
          <button onClick={() => setViewMode('calendar')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${viewMode === 'calendar' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
            📅 Kalender
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-wrap gap-3">
        <span className="text-sm text-gray-500 font-medium self-center">Filter:</span>
        {(['all', 'draft', 'scheduled', 'processing', 'published', 'failed', 'cancelled'] as const).map(status => (
          <button key={status} onClick={() => setFilterStatus(status)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterStatus === status ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {status === 'all' ? 'Semua' : statusLabels[status]}
          </button>
        ))}
        <select value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)}
          className="ml-auto px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-purple-500">
          <option value="all">Semua Platform</option>
          <option value="facebook">📘 Facebook</option>
          <option value="tiktok">🎵 TikTok</option>
          <option value="youtube">📺 YouTube</option>
        </select>
      </div>

      {/* Content */}
      {viewMode === 'list' ? (
        <div className="space-y-3">
          {filteredPosts.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
              <span className="text-5xl mb-4 block">📅</span>
              <p className="text-gray-500">Tidak ada posting dengan filter ini</p>
            </div>
          ) : (
            filteredPosts.map(post => (
              <div key={post.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 card-hover">
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{post.productImage}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-800 text-sm truncate">{post.productName}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[post.status]}`}>
                        {statusLabels[post.status]}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>📅 {new Date(post.scheduledAt).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                      <span>⏰ {new Date(post.scheduledAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>🌏 {post.timezone}</span>
                      <span>{post.platform === 'facebook' ? '📘' : post.platform === 'tiktok' ? '🎵' : '📺'} {post.platform}</span>
                      {post.bufferPostId && <span className="text-green-600">🔗 Buffer: {post.bufferPostId}</span>}
                    </div>
                    {post.errorMessage && <p className="text-xs text-red-500 mt-1">❌ {post.errorMessage}</p>}
                  </div>
                  <div className="flex flex-col gap-2">
                    {post.status === 'scheduled' && (
                      <button onClick={() => onUpdateStatus(post.id, 'cancelled')} className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-200">
                        Cancel
                      </button>
                    )}
                    {post.status === 'failed' && (
                      <button onClick={() => onUpdateStatus(post.id, 'scheduled')} className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-200">
                        Retry
                      </button>
                    )}
                    <button onClick={() => onDeletePost(post.id)} className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-200">
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">
            {new Date(year, month).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="grid grid-cols-7 gap-1">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">{day}</div>
            ))}
            {emptyDays.map(i => <div key={`empty-${i}`} className="h-20"></div>)}
            {calendarDays.map(day => {
              const dayPosts = getPostsForDay(day);
              const isToday = day === now.getDate();
              return (
                <div key={day} className={`h-20 border rounded-lg p-1 text-xs ${isToday ? 'border-purple-500 bg-purple-50' : 'border-gray-100'}`}>
                  <span className={`font-medium ${isToday ? 'text-purple-600' : 'text-gray-600'}`}>{day}</span>
                  <div className="mt-1 space-y-0.5 overflow-hidden">
                    {dayPosts.slice(0, 2).map(post => (
                      <div key={post.id} className={`text-[10px] px-1 py-0.5 rounded truncate ${
                        post.status === 'published' ? 'bg-green-100 text-green-700' :
                        post.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                        post.status === 'failed' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {post.platform === 'facebook' ? '📘' : post.platform === 'tiktok' ? '🎵' : '📺'} {new Date(post.scheduledAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    ))}
                    {dayPosts.length > 2 && <div className="text-[10px] text-gray-400">+{dayPosts.length - 2} lagi</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
