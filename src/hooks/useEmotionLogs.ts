import { useState, useEffect } from 'react';
import mqtt from 'mqtt';
import { createClient } from '@supabase/supabase-js';
import { EmotionLog, EmotionType } from '@/types/emotion';
import { saveEmotionLog } from '@/lib/emotion-logger';

interface EmotionLogRow {
  id: string;
  card_uid: string;
  emotion: EmotionType | string;
  timestamp: number | string;
  user_name?: string | null;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const normalizeTimestamp = (value: number | string): number => {
  const numeric = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(numeric)) {
    return Date.now();
  }
  return numeric < 1_000_000_000_000 ? numeric * 1000 : numeric;
};

// Normalisasi emotion dari format lama (senang/sedih/marah) ke format baru (Bersemangat/Sedih/Marah)
const normalizeEmotion = (emotion: string): EmotionType => {
  const map: Record<string, EmotionType> = {
    senang: 'Bersemangat',
    bersemangat: 'Bersemangat',
    sedih: 'Sedih',
    marah: 'Marah',
    cemas: 'Cemas',
    malas: 'Malas',
    tenang: 'Tenang',
  };
  return map[emotion.trim().toLowerCase()] ?? (emotion as EmotionType);
};

export function useEmotionLogs() {
  const [logs, setLogs] = useState<EmotionLog[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let client: mqtt.MqttClient | null = null;

    const fetchLogs = async (showLoading = true) => {
      if (showLoading) {
        setLoading(true);
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('emotion_logs')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(100);

        if (!isMounted) return;

        if (fetchError) {
          setError(fetchError.message);
          return;
        }

        const { data: allowedUsers } = await supabase
          .from('allowed_users')
          .select('uid, nama');

        const uidToName: Record<string, string> = {};
        allowedUsers?.forEach((u: { uid: string; nama: string }) => {
          uidToName[u.uid] = u.nama;
        });

        const mappedLogs =
          data?.map((log: EmotionLogRow) => ({
            id: log.id,
            name: log.user_name?.trim() ? log.user_name : log.card_uid,
            card_uid: log.card_uid,
            owner_name: uidToName[log.card_uid],
            emotion: normalizeEmotion(log.emotion as string), // ← fix data lama & baru
            timestamp: normalizeTimestamp(log.timestamp),
          })) ?? [];

        setLogs(mappedLogs);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch emotion logs:', err);
        if (isMounted) {
          setError('Failed to fetch emotion logs.');
        }
      } finally {
        if (isMounted && showLoading) {
          setLoading(false);
        }
      }
    };

    const connectMqtt = () => {
      const brokerUrl =
        'wss://5e5be1b7ba1b4958a3f9bb8ada1424eb.s1.eu.hivemq.cloud:8884/mqtt';
      const options = {
        username: 'esp32_client',
        password: 'gZiyEM81b3CBaxk2',
        clientId: 'nextjs_dashboard_' + Math.random().toString(16).substring(2, 8),
      };

      client = mqtt.connect(brokerUrl, options);

      client.on('connect', () => {
        setIsConnected(true);

        // ✅ HAPUS publish empty string - ini penyebab emoji tidak muncul
        // client?.publish('v1/emotion/logs', '', { retain: true, qos: 1 });

        client?.subscribe('v1/emotion/logs', (err) => {
          if (err) console.error(err);
        });
      });

      client.on('message', async (topic, payload) => {
        if (topic === 'v1/emotion/logs') {
          const payloadStr = payload.toString();

          if (!payloadStr) return;

          try {
            const parsed = JSON.parse(payloadStr);
            const { card_uid, emotion, timestamp } = parsed;

            if (!card_uid || !emotion || !timestamp) return;

            await saveEmotionLog({ card_uid, emotion, timestamp });
            await fetchLogs(false);
          } catch (err) {
            console.error(err);
          }
        }
      });

      client.on('error', (err) => {
        setError(err.message);
        setIsConnected(false);
      });

      client.on('close', () => {
        setIsConnected(false);
      });
    };

    const initialize = async () => {
      await fetchLogs(true);
      if (!isMounted) return;
      connectMqtt();
    };

    initialize();

    return () => {
      isMounted = false;
      client?.end();
    };
  }, []);

  const deleteLog = async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('emotion_logs')
        .delete()
        .eq('id', id);

      if (deleteError) {
        setError(deleteError.message);
        return false;
      }

      setLogs((prevLogs) => prevLogs.filter((log) => log.id !== id));
      return true;
    } catch (err) {
      console.error('Failed to delete emotion log:', err);
      setError('Failed to delete emotion log.');
      return false;
    }
  };

  const updateLog = async (
    id: string,
    updates: { name: string; emotion: EmotionType }
  ): Promise<boolean> => {
    const normalizedName = updates.name.trim();

    try {
      const { error: updateError } = await supabase
        .from('emotion_logs')
        .update({
          user_name: normalizedName || null,
          emotion: updates.emotion,
        })
        .eq('id', id);

      if (updateError) {
        setError(updateError.message);
        return false;
      }

      setLogs((prevLogs) =>
        prevLogs.map((log) =>
          log.id === id
            ? {
                ...log,
                name: normalizedName || log.card_uid,
                emotion: updates.emotion,
              }
            : log
        )
      );
      return true;
    } catch (err) {
      console.error('Failed to update emotion log:', err);
      setError('Failed to update emotion log.');
      return false;
    }
  };

  const stats = logs.reduce((acc, curr) => {
    acc[curr.emotion] = (acc[curr.emotion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    logs,
    isConnected,
    loading,
    error,
    stats,
    deleteLog,
    updateLog,
  };
}