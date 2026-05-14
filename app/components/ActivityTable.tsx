import { Clock, MoreVertical } from 'lucide-react';
import { EmotionLog, EMOTION_CONFIG } from '@/app/types/emotion';

interface ActivityTableProps {
  logs: EmotionLog[];
}

export function ActivityTable({ logs }: ActivityTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
        <h2 className="font-bold text-lg">Log Aktivitas Terbaru</h2>
        <span className="text-xs font-medium px-2 py-1 bg-green-50 text-green-600 rounded">Live Update On</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 text-slate-400 text-[11px] uppercase tracking-widest font-bold">
              <th className="px-6 py-4">User Details</th>
              <th className="px-6 py-4">Card UID</th>
              <th className="px-6 py-4 text-center">Emotion Status</th>
              <th className="px-6 py-4">Time</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {logs.map((log) => (
              <tr
                key={`${log.id}-${log.timestamp}`}
                className="hover:bg-slate-50/80 transition-colors group"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center font-bold text-green-600 group-hover:bg-green-100 group-hover:text-green-700 transition-colors">
                      {log.name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800">{log.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">{log.id}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">
                    {log.card_uid}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    <div
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${EMOTION_CONFIG[log.emotion].bgColor} ${EMOTION_CONFIG[log.emotion].textColor}`}
                    >
                      <span className="text-lg">{EMOTION_CONFIG[log.emotion].emoji}</span>
                      {EMOTION_CONFIG[log.emotion].label}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-500 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-300" />
                    {log.timestamp}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-slate-300 hover:text-green-600 transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
