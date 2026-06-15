'use client';

import { useState, useEffect } from 'react';
import { Header } from './Header';
import { StatsCards } from './StatsCards';
import { ActivityTable } from './ActivityTable';
import { EmotionDashboard } from './EmotionDashboard';
import { useEmotionLogs } from '@/hooks/useEmotionLogs';
// ⚠ Sesuaikan path import @/lib/supabase ini dengan lokasi inisialisasi client Supabase di projectmu
import { supabase } from '@/lib/supabase'; 

interface AllowedUser {
  uid: string;
  nama: string;
}

export function Dashboard() {
  const { logs, stats, isConnected, loading, error, deleteLog, updateLog } = useEmotionLogs();
  const [allowedUsers, setAllowedUsers] = useState<AllowedUser[]>([]);

  // Ambil data user dari tabel allowed_users (Referensi: gambar.png)
  useEffect(() => {
    async function fetchAllowedUsers() {
      try {
        const { data, error } = await supabase
          .from('allowed_users')
          .select('uid, nama');

        if (error) {
          console.error('Error fetching allowed users:', error.message);
          return;
        }

        if (data) {
          setAllowedUsers(data);
        }
      } catch (err) {
        console.error('Unexpected error fetching users:', err);
      }
    }

    fetchAllowedUsers();

    // Setup Realtime Subscription supaya perubahan nama langsung sinkron ke UI tanpa refresh
    const channel = supabase
      .channel('realtime-allowed-users')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'allowed_users' },
        () => {
          fetchAllowedUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        <Header />
        <StatsCards logs={logs} />
        
        {/* Inject data allowedUsers ke ActivityTable untuk mencocokkan UID ke Nama */}
        <ActivityTable 
          logs={logs} 
          allowedUsers={allowedUsers} 
          deleteLog={deleteLog} 
          updateLog={updateLog} 
        />
        
        <div className="mt-8">
          <EmotionDashboard 
            logs={logs} 
            stats={stats} 
            isConnected={isConnected} 
            loading={loading} 
            error={error} 
          />
        </div>
      </div>
    </div>
  );
}