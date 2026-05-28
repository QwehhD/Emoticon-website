'use client';

import { useState } from 'react';
import { Heart, BarChart3, TrendingUp } from 'lucide-react';
import { EMOTION_CONFIG, EmotionLog } from '@/types/emotion';

interface StatChartProps {
  stats: Record<string, number>;
  title?: string;
}

export function StatChart({ stats, title = 'Emotion Distribution' }: StatChartProps) {
  const total = Object.values(stats).reduce((a, b) => a + b, 0);

  if (total === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
        <p className="text-slate-400">No data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-blue-600" />
        {title}
      </h3>

      <div className="space-y-4">
        {Object.entries(stats).map(([emotion, count]) => {
          const percentage = ((count / total) * 100).toFixed(1);
          const config = EMOTION_CONFIG[emotion as keyof typeof EMOTION_CONFIG];

          return (
            <div key={emotion}>
              <div className="flex justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{config?.emoji || '😐'}</span>
                  <span className="font-medium text-slate-700">{config?.label || emotion}</span>
                </div>
                <span className="text-sm font-bold text-slate-600">
                  {count} ({percentage}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all ${config?.bgColor || 'bg-slate-400'}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface FilterOptions {
  uid?: string;
  emotion?: string;
}

interface EmotionDashboardProps {
  logs: EmotionLog[];
  stats: Record<string, number>;
  isConnected: boolean;
  loading: boolean;
  error: string | null;
}

export function EmotionDashboard({ logs, stats, isConnected, loading, error }: EmotionDashboardProps) {
  const [filter, setFilter] = useState<FilterOptions>({});

  const filteredLogs = logs.filter((log) => {
    if (filter.uid && log.card_uid !== filter.uid) return false;
    if (filter.emotion && log.emotion !== filter.emotion) return false;
    return true;
  });

  const uniqueUIDs = [...new Set(logs.map((log) => log.card_uid))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-emerald-50 p-6 rounded-2xl border border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-500" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Emotion Analytics</h1>
              <p className="text-sm text-slate-600">Real-time emotion tracking dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className="text-sm font-medium text-slate-600">
              {isConnected ? 'Connected' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="text-sm font-medium">⚠ {error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-lg mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              User UID
            </label>
            <select
              value={filter.uid || ''}
              onChange={(e) => setFilter({ ...filter, uid: e.target.value || undefined })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Users</option>
              {uniqueUIDs.map((uid) => (
                <option key={uid} value={uid}>
                  {uid}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Emotion
            </label>
            <select
              value={filter.emotion || ''}
              onChange={(e) => setFilter({ ...filter, emotion: e.target.value || undefined })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Emotions</option>
              {Object.entries(EMOTION_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.emoji} {config.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats Chart */}
      <StatChart stats={stats} />

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          Recent Activity ({filteredLogs.length} entries)
        </h3>

        {loading && <p className="text-slate-500">Loading...</p>}

        {!loading && filteredLogs.length === 0 && (
          <p className="text-slate-400">No emotion logs found</p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-xs uppercase tracking-widest font-bold border-b border-slate-100">
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">UID</th>
                <th className="px-4 py-3 text-center">Emotion</th>
                <th className="px-4 py-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredLogs.slice(0, 20).map((log) => (
                <tr key={`${log.id}-${log.timestamp}`} className="hover:bg-slate-50/50 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">
                        {log.name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium">{log.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded">
                      {log.card_uid}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-bold ${
                      EMOTION_CONFIG[log.emotion]?.bgColor || 'bg-slate-100'
                    } ${EMOTION_CONFIG[log.emotion]?.textColor || 'text-slate-600'}`}>
                      {EMOTION_CONFIG[log.emotion]?.emoji || '😐'}
                      {EMOTION_CONFIG[log.emotion]?.label || log.emotion}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">{log.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Connection Status Footer */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg text-center">
        <p className="text-xs text-slate-500 font-medium">
          📊 Dashboard updates every 5 seconds · {Object.values(stats).reduce((a, b) => a + b, 0)} total emotions logged
        </p>
      </div>
    </div>
  );
}
