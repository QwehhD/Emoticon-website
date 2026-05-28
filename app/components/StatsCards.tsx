'use client';

import { CreditCard, User, Smile } from 'lucide-react';
import { EmotionLog } from '@/types/emotion';

interface StatsCardsProps {
  logs: EmotionLog[];
}

export function StatsCards({ logs }: StatsCardsProps) {

  const totalScans = logs.length;
  const activeUsers = new Set(logs.map((log) => log.card_uid)).size;

  const moodAverage = logs.length > 0
    ? logs.reduce((count, log) => {
        if (['senang', 'happy', 'happy'].includes(log.emotion.toLowerCase())) {
          return count + 1;
        }
        return count;
      }, 0) / logs.length > 0.5
      ? 'Positif'
      : 'Netral'
    : 'N/A';

  const STATS = [
    {
      icon: CreditCard,
      label: 'Total Scans',
      value: totalScans.toString(),
    },
    {
      icon: User,
      label: 'Active Users',
      value: activeUsers.toString(),
    },
    {
      icon: Smile,
      label: 'Mood Average',
      value: moodAverage,
      valueColor: moodAverage === 'Positif' ? 'text-green-600' : 'text-slate-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {STATS.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
              <Icon />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {stat.label}
              </p>
              <h3 className={`text-xl font-bold ${stat.valueColor || ''}`}>{stat.value}</h3>
            </div>
          </div>
        );
      })}
    </div>
  );
}
