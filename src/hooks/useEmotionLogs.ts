import { useState, useEffect } from 'react';
import mqtt from 'mqtt';
import { createClient } from '@supabase/supabase-js';
import { EmotionLog, EmotionType } from '@/types/emotion';

interface MqttRawPayload {
  card_uid: string;
  emotion: EmotionType;
  timestamp: number;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function useEmotionLogs() {
  const [logs, setLogs] = useState<EmotionLog[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const brokerUrl = 'wss://5e5be1b7ba1b4958a3f9bb8ada1424eb.s1.eu.hivemq.cloud:8884/mqtt'; 
    const options = {
      username: 'esp32_client',
      password: 'gZiyEM81b3CBaxk2',
      clientId: 'nextjs_dashboard_' + Math.random().toString(16).substring(2, 8),
    };

    setLoading(true);
    const client = mqtt.connect(brokerUrl, options);

    client.on('connect', () => {
      setIsConnected(true);
      setError(null);
      setLoading(false);
      client.subscribe('v1/emotion/logs', (err) => {
        if (err) console.error(err);
      });
    });

    client.on('message', async (topic, payload) => {
      if (topic === 'v1/emotion/logs') {
        try {
          const rawData = JSON.parse(payload.toString()) as MqttRawPayload;
          
          let studentName = 'Siswa SMK Telkom';
          
          try {
            const { data, error: supabaseError } = await supabase
              .from('allowed_users')
              .select('nama')
              .eq('uid', rawData.card_uid)
              .single();
              
            if (data && data.name) {
              studentName = data.name;
            } else if (supabaseError) {
              console.error('Supabase fetch error:', supabaseError.message);
            }
          } catch (dbErr) {
            console.error('Failed to query Supabase:', dbErr);
          }

          const incomingLog: EmotionLog = {
            id: rawData.card_uid.substring(0, 5),
            name: studentName, 
            card_uid: rawData.card_uid,
            emotion: rawData.emotion,
            timestamp: new Date(rawData.timestamp * 1000).toLocaleString('id-ID'),
          };

          setLogs((prevLogs) => [incomingLog, ...prevLogs].slice(0, 50));
        } catch (err) {
          console.error(err);
        }
      }
    });

    client.on('error', (err) => {
      setError(err.message);
      setIsConnected(false);
      setLoading(false);
    });

    client.on('close', () => {
      setIsConnected(false);
    });

    return () => {
      if (client) {
        client.end();
      }
    };
  }, []);

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
  };
}
