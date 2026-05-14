import { useState, useEffect } from 'react';
import { EmotionLog } from '@/types/emotion';

interface EmotionStats {
  [emotion: string]: number;
}

interface ApiEmotionLog {
  id: string;
  card_uid: string;
  emotion: string;
  created_at: string;
}

export function useEmotionLogs() {
  const [logs, setLogs] = useState<EmotionLog[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<EmotionStats>({});

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch('/api/emotion-logs');
        if (!response.ok) throw new Error('Failed to fetch logs');
        
        const data = await response.json() as { data: ApiEmotionLog[] };
        setIsConnected(true);
        setError(null);

        if (data.data && Array.isArray(data.data)) {
          const transformedLogs = data.data.map((log: ApiEmotionLog) => ({
            id: log.id,
            name: 'User', // You can enhance this by joining with user data
            card_uid: log.card_uid,
            emotion: log.emotion as 'senang' | 'sedih' | 'marah',
            timestamp: new Date(log.created_at).toLocaleString('id-ID'),
          }));
          setLogs(transformedLogs.slice(0, 50));
        }
      } catch (err) {
        setIsConnected(false);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    const fetchStats = async () => {
      try {
        // Get stats for a sample UID, or you can make this dynamic
        const uid = 'E240B8C3';
        const response = await fetch(`/api/emotion-logs/stats?uid=${uid}`);
        if (response.ok) {
          const data = await response.json() as { data: EmotionStats };
          setStats(data.data || {});
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
    };

    fetchLogs();
    fetchStats();

    // Poll for new logs every 5 seconds
    const pollInterval = setInterval(() => {
      fetchLogs();
    }, 5000);

    return () => {
      clearInterval(pollInterval);
    };
  }, []);

  return {
    logs,
    isConnected,
    loading,
    error,
    stats,
  };
}

