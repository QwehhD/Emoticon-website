'use client';

import { useState } from 'react';
import { Clock, AlertCircle, CheckCircle, Loader, PencilLine, Trash2, Save, X } from 'lucide-react';
import { useEmotionLogs } from '@/hooks/useEmotionLogs';
import { EMOTION_CONFIG, EmotionLog, EmotionType } from '@/types/emotion';

// Helper aman untuk ambil config emotion, handle format lama maupun baru
const getEmotionConfig = (emotion: string) => {
  const map: Record<string, EmotionType> = {
    senang: 'Bersemangat',
    bersemangat: 'Bersemangat',
    sedih: 'Sedih',
    marah: 'Marah',
    cemas: 'Cemas',
    malas: 'Malas',
    tenang: 'Tenang',
  };
  const normalized = map[emotion?.trim().toLowerCase()] ?? (emotion as EmotionType);
  return EMOTION_CONFIG[normalized] ?? EMOTION_CONFIG['Bersemangat'];
};

export default function DashboardPage() {
  const { logs, isConnected, loading, error, deleteLog, updateLog } = useEmotionLogs();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmotion, setEditEmotion] = useState<EmotionType>('Bersemangat');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState<string>('');

  const getLocalDateString = (timestamp: number | string) => {
    const date = new Date(Number(timestamp));
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const filteredLogs = logs.filter(log => {
    if (!filterDate) return true;
    return getLocalDateString(log.timestamp) === filterDate;
  });

  const exportToCSV = () => {
    const headers = ['Nama', 'Card UID', 'Emosi', 'Waktu'];
    const rows = filteredLogs.map(log => {
      const time = new Date(Number(log.timestamp)).toLocaleString('id-ID');
      return `"${log.name || 'Unknown User'}","${log.card_uid}","${log.emotion}","${time}"`;
    });
    
    const csvContent = "\uFEFF" + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const fileName = filterDate ? `export_emosi_${filterDate}.csv` : 'export_emosi_semua.csv';
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const startEdit = (log: EmotionLog) => {
    setEditingId(log.id);
    setEditName(log.name);
    setEditEmotion(log.emotion);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const trimmedName = editName.trim();
    if (!trimmedName) return;

    setSavingId(editingId);
    const success = await updateLog(editingId, { name: trimmedName, emotion: editEmotion });
    setSavingId(null);

    if (success) {
      setEditingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Hapus log ini?');
    if (!confirmed) return;

    setDeletingId(id);
    const success = await deleteLog(id);
    setDeletingId(null);

    if (success && editingId === id) {
      setEditingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Emotion Dashboard</h1>
              <p className="text-slate-500 mt-2">Real-time emotion monitoring system</p>
            </div>

            {/* Connection Status */}
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2">
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 text-blue-500 animate-spin" />
                    <span className="text-sm font-medium text-blue-600">Loading...</span>
                  </>
                ) : isConnected ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium text-green-600">Connected</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="text-sm font-medium text-red-600">Disconnected</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center bg-slate-50 gap-4">
            <h2 className="font-bold text-lg">Emotion Logs</h2>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={exportToCSV}
                className="text-sm px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Export Excel (CSV)
              </button>
              
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="text-sm px-3 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />

              <span className="text-xs font-medium px-2 py-1 bg-green-50 text-green-600 rounded whitespace-nowrap">
                {filteredLogs.length} entries
              </span>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            {filteredLogs.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-slate-500">
                  <p className="text-sm">No emotion logs yet</p>
                  <p className="text-xs text-slate-400 mt-1">Waiting for data from MQTT broker...</p>
                </div>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">
                      User Name
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">
                      Card ID
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider text-center">
                      Emotion
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredLogs.map((log) => {
                    const isEditing = editingId === log.id;
                    const displayName = isEditing ? editName : log.name;
                    const displayInitial = displayName?.trim().charAt(0)?.toUpperCase() || '?';
                    const isSaving = savingId === log.id;
                    const isDeleting = deletingId === log.id;
                    const emotionConfig = getEmotionConfig(log.emotion); // ← pakai helper aman

                    return (
                      <tr
                        key={`${log.id}-${log.timestamp}`}
                        className="hover:bg-slate-50 transition-colors group"
                      >
                        {/* User Name */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-600 group-hover:bg-green-200 transition-colors">
                              {displayInitial}
                            </div>
                            <div className="flex flex-col gap-1">
                              {isEditing ? (
                                <input
                                  value={editName}
                                  onChange={(event) => setEditName(event.target.value)}
                                  className="text-sm font-semibold text-slate-900 border border-slate-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-slate-200"
                                  placeholder="Nama pengguna"
                                />
                              ) : (
                                <span className="text-sm font-semibold text-slate-900">{log.name}</span>
                              )}
                              <span className="text-xs text-slate-400">{log.id}</span>
                            </div>
                          </div>
                        </td>

                        {/* Card ID */}
                        <td className="px-6 py-4">
                          <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">
                            {log.card_uid}
                          </span>
                        </td>

                        {/* Emotion */}
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            {isEditing ? (
                              <select
                                value={editEmotion}
                                onChange={(event) => setEditEmotion(event.target.value as EmotionType)}
                                className="text-xs font-bold border border-slate-200 rounded-full px-3 py-1.5 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                              >
                                {Object.keys(EMOTION_CONFIG).map((key) => (
                                  <option key={key} value={key}>
                                    {EMOTION_CONFIG[key as EmotionType].label}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              // ← pakai emotionConfig yang sudah aman, tidak akan crash
                              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${emotionConfig.bgColor} ${emotionConfig.textColor}`}>
                                <span className="text-base">{emotionConfig.emoji}</span>
                                {emotionConfig.label}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Timestamp */}
                        <td className="px-6 py-4 text-slate-600 text-sm">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-slate-300" />
                            <span>
                              {new Date(log.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              })}
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {isEditing ? (
                              <>
                                <button
                                  type="button"
                                  onClick={saveEdit}
                                  disabled={isSaving || !editName.trim()}
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 hover:text-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  <Save className="w-4 h-4" />
                                  {isSaving ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEdit}
                                  disabled={isSaving}
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  <X className="w-4 h-4" />
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => startEdit(log)}
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                                >
                                  <PencilLine className="w-4 h-4" />
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(log.id)}
                                  disabled={isDeleting}
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  {isDeleting ? 'Deleting...' : 'Delete'}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Table Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-center">
            <p className="text-xs text-slate-500 font-medium flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}
              ></span>
              {isConnected ? 'Connected to HiveMQ Broker' : 'Disconnected from broker'}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Logs</p>
            <h3 className="text-2xl font-bold mt-2">{logs.length}</h3>
          </div>
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</p>
            <h3 className="text-2xl font-bold mt-2 flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
              ></span>
              {isConnected ? 'Active' : 'Inactive'}
            </h3>
          </div>
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Latest</p>
            <h3 className="text-2xl font-bold mt-2">
              {logs.length > 0
                ? new Date(logs[0].timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '-'}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}