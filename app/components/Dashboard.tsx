'use client';

import { Header } from './Header';
import { StatsCards } from './StatsCards';
import { ActivityTable } from './ActivityTable';
import { EmotionDashboard } from './EmotionDashboard';
import { useEmotionLogs } from '@/hooks/useEmotionLogs';

export function Dashboard() {
  const { logs, stats, isConnected, loading, error, deleteLog, updateLog } = useEmotionLogs();

  return (
    <div className="min-h-screen bg-white p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        <Header />
        <StatsCards logs={logs} />
        <ActivityTable logs={logs} deleteLog={deleteLog} updateLog={updateLog} />
        <div className="mt-8">
          <EmotionDashboard logs={logs} stats={stats} isConnected={isConnected} loading={loading} error={error} />
        </div>
      </div>
    </div>
  );
}
