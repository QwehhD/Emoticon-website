import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import mqtt, { MqttClient } from 'mqtt';
import { EmotionLog } from '@/types/emotion';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const mqttBrokerUrl = process.env.NEXT_PUBLIC_MQTT_BROKER_URL || 'wss://broker.hivemq.cloud:8884/mqtt';
const mqttUsername = process.env.NEXT_PUBLIC_MQTT_USERNAME || '';
const mqttPassword = process.env.NEXT_PUBLIC_MQTT_PASSWORD || '';

const supabase = createClient(supabaseUrl, supabaseKey);

export function useEmotionLogs() {
  const [logs, setLogs] = useState<EmotionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mqttClient: MqttClient | null = null;

    const initializeData = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: supabaseError } = await supabase
          .from('emotion_logs')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(20);

        if (supabaseError) {
          console.warn('Supabase fetch warning:', supabaseError.message);
        }

        if (data) {
          const validatedLogs = data.filter((log) => isValidEmotionLog(log)) as EmotionLog[];
          setLogs(validatedLogs);
        }

        connectToMQTT();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        console.error('Error initializing data:', err);
      } finally {
        setLoading(false);
      }
    };

    const isValidEmotionLog = (log: unknown): log is EmotionLog => {
      if (typeof log !== 'object' || log === null) return false;

      const obj = log as Record<string, unknown>;
      return (
        typeof obj.name === 'string' &&
        typeof obj.cardUid === 'string' &&
        typeof obj.emotion === 'string' &&
        ['senang', 'sedih', 'marah'].includes(obj.emotion) &&
        typeof obj.timestamp === 'string' &&
        (!obj.id || typeof obj.id === 'string')
      );
    };

    const connectToMQTT = () => {
      if (!mqttBrokerUrl) {
        console.warn('MQTT broker URL not configured');
        return;
      }

      mqttClient = mqtt.connect(mqttBrokerUrl, {
        username: mqttUsername || undefined,
        password: mqttPassword || undefined,
        clientId: `emoticon-client-${Date.now()}`,
        clean: true,
        reconnectPeriod: 5000,
        connectTimeout: 10000,
      });

      mqttClient.on('connect', () => {
        console.log('Connected to MQTT broker');
        mqttClient?.subscribe('v1/emotion/logs', (err) => {
          if (err) {
            console.error('Failed to subscribe to topic:', err);
            setError('Failed to subscribe to MQTT topic');
          }
        });
      });

      mqttClient.on('message', (topic, message) => {
        if (topic === 'v1/emotion/logs') {
          try {
            const payload = JSON.parse(message.toString());

            if (isValidEmotionLog(payload)) {
              const newLog: EmotionLog = {
                id: payload.id,
                name: payload.name,
                cardUid: payload.cardUid,
                emotion: payload.emotion,
                timestamp: payload.timestamp,
              };

              setLogs((prevLogs) => [newLog, ...prevLogs].slice(0, 20));
            } else {
              console.warn('Invalid emotion log format:', payload);
            }
          } catch (parseErr) {
            console.error('Error parsing MQTT message:', parseErr);
          }
        }
      });

      mqttClient.on('error', (err) => {
        console.error('MQTT error:', err);
        setError('Failed to connect to MQTT broker');
      });

      mqttClient.on('disconnect', () => {
        console.log('Disconnected from MQTT broker');
      });
    };

    initializeData();

    return () => {
      if (mqttClient) {
        mqttClient.unsubscribe('v1/emotion/logs');
        mqttClient.end(true, () => {
          console.log('MQTT connection closed');
        });
      }
    };
  }, []);

  return { logs, loading, error };
}
