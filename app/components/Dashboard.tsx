'use client';

import { Header } from './Header';
import { StatsCards } from './StatsCards';
import { ActivityTable } from './ActivityTable';
import { useEmotionLogs } from '@/hooks/useEmotionLogs';

export function Dashboard() {
  const { logs } = useEmotionLogs();

  return (
    <div className="min-h-screen bg-white p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        <Header />
        <StatsCards />
        <ActivityTable logs={logs} />
      </div>
    </div>
  );
}
