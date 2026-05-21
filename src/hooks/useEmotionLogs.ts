import { useState, useEffect } from 'react';
import mqtt from 'mqtt';
import { EmotionLog } from '@/types/emotion';

interface MqttRawPayload {
  card_uid: string;
  emotion: 'senang' | 'sedih' | 'marah';
  timestamp: number;
}

export function useEmotionLogs() {
  const [logs, setLogs] = useState<EmotionLog[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const brokerUrl = 'wss://YOUR_HIVEMQ_HOST:8884/mqtt'; 
    const options = {
      username: 'YOUR_MQTT_USERNAME',
      password: 'YOUR_MQTT_PASSWORD',
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

    client.on('message', (topic, payload) => {
      if (topic === 'v1/emotion/logs') {
        try {
          const rawData = JSON.parse(payload.toString()) as MqttRawPayload;
          const incomingLog: EmotionLog = {
            id: rawData.card_uid.substring(0, 5),
            name: rawData.card_uid === "E240B8C3" ? "Dika (Valid)" : "Siswa SMK Telkom", 
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

  return {
    logs,
    isConnected,
    loading,
    error,
   stats: logs.reduce((acc, curr) => {
      acc[curr.emotion] = (acc[curr.emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
}
