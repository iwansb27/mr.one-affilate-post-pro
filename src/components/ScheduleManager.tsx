import { useState } from 'react';
import { ScheduledPost } from '../types';

interface ScheduleManagerProps {
  posts: ScheduledPost[];
  onDeletePost: (id: string) => void;
  onUpdateStatus: (id: string, status: ScheduledPost['status']) => void;
}

export default function ScheduleManager({ posts, onDeletePost, onUpdateStatus }: ScheduleManagerProps) {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'scheduled' | 'posted' | 'failed'>('all');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');

  const filteredPosts = posts.filter(p => {
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    const matchPlatform = filterPlatform === 'all' || p.platforms.includes(filterPlatform as any);
    return matchStatus && matchPlatform;
  });

  const statusColors = {
    draft: 'bg-gray-100 text-gray-700',
    scheduled: 'bg-blue-100 text-blue-700',
    posted: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
  };

  const statusLabels = {
    draft: 'Draft',
    scheduled: 'Terjadwal',
    posted: 'Terkirim',
    failed: 'Gagal',
  };

  const platformIcons: Record<string, string> = {
    facebook: '📘',
    instagram: '📷',
    youtube: '📺',
    tiktok: '🎵',
  };

  // Calendar data
  const getDaysInMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth, year, month };
  };

  const { firstDay, daysInMonth, year, month } = getDaysInMonth();
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  const getPostsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return posts.filter(p => p.scheduledDate === dateStr);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Jadwal Posting</h1>
          <p className="text-gray-500 mt-1">Kelola dan pantau semua konten yang sudah dijadwalkan</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              viewMode === 'list' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            📋 List
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              viewMode === 'calendar' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            📅 Kalender
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-gray-500 font-medium">Filter:</span>
          {(['all', 'draft', 'scheduled', 'posted', 'failed'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterStatus === status
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'Semua' : statusLabels[status]}
            </button>
          ))}
          <div className="ml-auto">
            <select
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Semua Platform</option>
              <option value="facebook">📘 Facebook</option>
              <option value="instagram">📷 Instagram</option>
              <option value="youtube">📺 YouTube</option>
              <option value="tiktok">🎵 TikTok</option>
            </select>
          </div>
        </div>
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
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">{post.caption}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400">
                        📅 {new Date(post.scheduledDate).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="text-xs text-gray-400">⏰ {post.scheduledTime}</span>
                      <span className="text-xs text-gray-400">🏪 {post.marketplace}</span>
                      <div className="flex gap-1 ml-auto">
                        {post.platforms.map(p => (
                          <span key={p} className="text-sm">{platformIcons[p]}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {post.status === 'draft' && (
                      <button
                        onClick={() => onUpdateStatus(post.id, 'scheduled')}
                        className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        Jadwalkan
                      </button>
                    )}
                    {post.status === 'scheduled' && (
                      <button
                        onClick={() => onUpdateStatus(post.id, 'posted')}
                        className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        Tandai Terkirim
                      </button>
                    )}
                    <button
                      onClick={() => onDeletePost(post.id)}
                      className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Calendar View */
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">
            {new Date(year, month).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="grid grid-cols-7 gap-1">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
            {emptyDays.map(i => (
              <div key={`empty-${i}`} className="h-20"></div>
            ))}
            {calendarDays.map(day => {
              const dayPosts = getPostsForDay(day);
              const isToday = day === new Date().getDate();
              return (
                <div
                  key={day}
                  className={`h-20 border rounded-lg p-1 text-xs ${
                    isToday ? 'border-purple-500 bg-purple-50' : 'border-gray-100'
                  }`}
                >
                  <span className={`font-medium ${isToday ? 'text-purple-600' : 'text-gray-600'}`}>{day}</span>
                  <div className="mt-1 space-y-0.5 overflow-hidden">
                    {dayPosts.slice(0, 2).map(post => (
                      <div
                        key={post.id}
                        className={`text-[10px] px-1 py-0.5 rounded truncate ${
                          post.status === 'posted' ? 'bg-green-100 text-green-700' :
                          post.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {post.productImage} {post.scheduledTime}
                      </div>
                    ))}
                    {dayPosts.length > 2 && (
                      <div className="text-[10px] text-gray-400">+{dayPosts.length - 2} lagi</div>
                    )}
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
