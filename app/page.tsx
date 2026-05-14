"use client";

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  User, 
  CreditCard, 
  Smile, 
  Frown, 
  Angry, 
  Clock, 
  Search,
  Bell,
  MoreVertical
} from 'lucide-react';

interface EmotionLog {
  id: string;
  name: string;
  cardUid: string;
  emotion: 'senang' | 'sedih' | 'marah';
  timestamp: string;
}

const emotionConfig = {
  senang: { 
    icon: <Smile className="text-emerald-500" />, 
    label: 'Senang', 
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-700',
    emoji: '😊'
  },
  sedih: { 
    icon: <Frown className="text-blue-500" />, 
    label: 'Sedih', 
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    emoji: '😢'
  },
  marah: { 
    icon: <Angry className="text-red-500" />, 
    label: 'Marah', 
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    emoji: '😡'
  }
};

export default function EmotionDashboard() {
  const [logs, setLogs] = useState<EmotionLog[]>([
    { id: 'USR-992', name: 'Andi Pratama', cardUid: 'A1:B2:C3:D4', emotion: 'senang', timestamp: '14:20:01' },
    { id: 'USR-441', name: 'Budi Santoso', cardUid: 'E5:F6:G7:H8', emotion: 'sedih', timestamp: '14:15:22' },
    { id: 'USR-102', name: 'Citra Lestari', cardUid: 'I9:J0:K1:L2', emotion: 'marah', timestamp: '14:02:45' },
  ]);

  useEffect(() => {
    const names = ['Dika Rahardjo', 'Siska Amelia', 'Roni Wijaya'];
    const emotions: ('senang' | 'sedih' | 'marah')[] = ['senang', 'sedih', 'marah'];

    const interval = setInterval(() => {
      const newEntry: EmotionLog = {
        id: `USR-${Math.floor(Math.random() * 900) + 100}`,
        name: names[Math.floor(Math.random() * names.length)],
        cardUid: `${Math.random().toString(16).slice(2, 4).toUpperCase()}:X1:Y2:Z3`,
        emotion: emotions[Math.floor(Math.random() * emotions.length)],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };
      
      setLogs((prev) => [newEntry, ...prev].slice(0, 10));
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <div className="p-2 bg-green-600 rounded-lg">
                <Activity className="text-white w-5 h-5" />
              </div>
              Emotion Monitoring
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Cari ID kartu..." 
                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-full text-sm focus:ring-2 focus:ring-green-500 outline-none w-64"
              />
            </div>
            <button className="p-2 bg-white border border-slate-200 rounded-full hover:bg-slate-50 relative">
              <Bell className="w-5 h-5 text-green-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
              <CreditCard />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Scans</p>
              <h3 className="text-xl font-bold">1,284</h3>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
              <User />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Users</p>
              <h3 className="text-xl font-bold">42</h3>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
              <Smile />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mood Average</p>
              <h3 className="text-xl font-bold text-green-600">Positif</h3>
            </div>
          </div>
        </div>

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
                  <tr key={`${log.id}-${log.timestamp}`} className="hover:bg-slate-50/80 transition-colors group">
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
                        {log.cardUid}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${emotionConfig[log.emotion].bgColor} ${emotionConfig[log.emotion].textColor}`}>
                          <span className="text-lg">{emotionConfig[log.emotion].emoji}</span>
                          {emotionConfig[log.emotion].label}
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

      </div>
    </div>
  );
}