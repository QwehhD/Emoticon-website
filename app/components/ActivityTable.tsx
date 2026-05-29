'use client';

import { useState } from 'react';
import { Clock, PencilLine, Trash2, Save, X } from 'lucide-react';
import { EmotionLog, EmotionType, EMOTION_CONFIG } from '@/types/emotion';

interface ActivityTableProps {
  logs: EmotionLog[];
  deleteLog: (id: string) => Promise<boolean>;
  updateLog: (id: string, updates: { name: string; emotion: EmotionType }) => Promise<boolean>;
}

export function ActivityTable({ logs, deleteLog, updateLog }: ActivityTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmotion, setEditEmotion] = useState<EmotionType>('senang');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const startEdit = (log: EmotionLog) => {
    setEditingId(log.id);
    setEditName(log.name);
    setEditEmotion(log.emotion);
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async () => {
    if (!editingId || !editName.trim()) return;
    setSavingId(editingId);
    const success = await updateLog(editingId, { name: editName.trim(), emotion: editEmotion });
    setSavingId(null);
    if (success) setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus log ini?')) return;
    setDeletingId(id);
    const success = await deleteLog(id);
    setDeletingId(null);
    if (success && editingId === id) setEditingId(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
        <h2 className="font-bold text-lg">Log Aktivitas Terbaru</h2>
        <span className="text-xs font-medium px-2 py-1 bg-green-50 text-green-600 rounded">Live Update On</span>
      </div>

      <div className="overflow-x-auto">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">Belum ada data emotion log.</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[11px] uppercase tracking-widest font-bold">
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Card UID</th>
                <th className="px-6 py-4 text-center">Emotion Status</th>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {logs.map((log) => {
                const isEditing = editingId === log.id;
                const isSaving = savingId === log.id;
                const isDeleting = deletingId === log.id;
                const displayName = isEditing ? editName : log.name;
                const displayInitial = displayName?.trim().charAt(0)?.toUpperCase() || '?';

                return (
                  <tr
                    key={`${log.owner_name}-${log.timestamp}`}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center font-bold text-green-600 group-hover:bg-green-100 transition-colors">
                          {displayInitial}
                        </div>
                        <div className="flex flex-col gap-1">
                          {isEditing ? (
                            <input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="text-sm font-semibold text-slate-900 border border-slate-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-slate-200"
                              placeholder="Nama pengguna"
                            />
                          ) : (
                            <span className="text-sm font-bold text-slate-800">{log.name}</span>
                          )}
                          <span className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">{log.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200 w-fit">
                          {log.card_uid}
                        </span>
                        {log.owner_name && (
                          <span className="text-xs text-slate-500 font-medium">{log.owner_name}</span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        {isEditing ? (
                          <select
                            value={editEmotion}
                            onChange={(e) => setEditEmotion(e.target.value as EmotionType)}
                            className="text-xs font-bold border border-slate-200 rounded-full px-3 py-1.5 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                          >
                            {Object.keys(EMOTION_CONFIG).map((key) => (
                              <option key={key} value={key}>
                                {EMOTION_CONFIG[key as EmotionType].label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${EMOTION_CONFIG[log.emotion]?.bgColor} ${EMOTION_CONFIG[log.emotion]?.textColor}`}
                          >
                            <span className="text-lg">{EMOTION_CONFIG[log.emotion]?.emoji}</span>
                            {EMOTION_CONFIG[log.emotion]?.label}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-500 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-300" />
                        {new Date(log.timestamp).toLocaleString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </div>
                    </td>

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

      <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-center">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
          Connected to HiveMQ
        </p>
      </div>
    </div>
  );
}
