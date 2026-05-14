import { useState, useEffect } from 'react';
import mqtt, { MqttClient, IClientOptions } from 'mqtt';
import { supabase } from '@/lib/supabase';
import { EmotionLog } from '@/types/emotion';

const MQTT_BROKER_URL = process.env.NEXT_PUBLIC_MQTT_BROKER_URL || 'wss://broker.hivemq.com:8884/mqtt';
const MQTT_TOPIC = 'v1/emotion/logs';
const MQTT_USERNAME = process.env.NEXT_PUBLIC_MQTT_USERNAME || '';
const MQTT_PASSWORD = process.env.NEXT_PUBLIC_MQTT_PASSWORD || '';

interface MQTTMessage {
  card_uid: string;
  emotion: string;
  name: string;
  timestamp?: string;
}

export function useEmotionLogs() {
  const [logs, setLogs] = useState<EmotionLog[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mqttClient: MqttClient | null = null;

    const initializeData = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: supabaseError } = await supabase
          .from('view_emotion_logs')
          .select('*')
          .order('timestamp', { ascending: false });

        if (supabaseError) {
          console.warn('Supabase fetch warning:', supabaseError.message);
          setError(`Failed to fetch initial data: ${supabaseError.message}`);
        }

        if (data && Array.isArray(data)) {
          const validatedLogs = data.filter(isValidEmotionLog) as EmotionLog[];
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
        typeof obj.card_uid === 'string' &&
        typeof obj.emotion === 'string' &&
        ['senang', 'sedih', 'marah'].includes(obj.emotion) &&
        typeof obj.timestamp === 'string'
      );
    };

    const isValidMQTTMessage = (payload: unknown): payload is MQTTMessage => {
      if (typeof payload !== 'object' || payload === null) return false;

      const obj = payload as Record<string, unknown>;
      return (
        typeof obj.card_uid === 'string' &&
        typeof obj.emotion === 'string' &&
        typeof obj.name === 'string' &&
        ['senang', 'sedih', 'marah'].includes(obj.emotion)
      );
    };

    const connectToMQTT = () => {
      if (!MQTT_BROKER_URL) {
        console.warn('MQTT broker URL not configured');
        setError('MQTT broker URL not configured');
        return;
      }

      const mqttOptions: IClientOptions = {
        clientId: `emoticon-client-${Date.now()}`,
        clean: true,
        reconnectPeriod: 5000,
        connectTimeout: 10000,
        protocol: 'wss',
        rejectUnauthorized: false,
      };

      if (MQTT_USERNAME && MQTT_PASSWORD) {
        mqttOptions.username = MQTT_USERNAME;
        mqttOptions.password = MQTT_PASSWORD;
      } else {
        console.warn('MQTT credentials not provided - attempting anonymous connection');
      }

      console.log('Connecting to MQTT broker:', MQTT_BROKER_URL);

      mqttClient = mqtt.connect(MQTT_BROKER_URL, mqttOptions);

      mqttClient.on('connect', () => {
        console.log('✓ Connected to MQTT broker');
        setIsConnected(true);
        setError(null);

        mqttClient?.subscribe(MQTT_TOPIC, (err) => {
          if (err) {
            console.error('✗ Failed to subscribe to topic:', err);
            setError(`Failed to subscribe to ${MQTT_TOPIC}: ${err.message}`);
          } else {
            console.log(`✓ Successfully subscribed to ${MQTT_TOPIC}`);
          }
        });
      });

      mqttClient.on('message', (topic, message) => {
        if (topic === MQTT_TOPIC) {
          try {
            const payload = JSON.parse(message.toString());
            console.log('📨 Received MQTT message:', payload);

            if (isValidMQTTMessage(payload)) {
              const newLog: EmotionLog = {
                id: `${payload.card_uid}-${Date.now()}`,
                name: payload.name,
                card_uid: payload.card_uid,
                emotion: payload.emotion as 'senang' | 'sedih' | 'marah',
                timestamp: payload.timestamp || new Date().toISOString(),
              };

              console.log('✓ Adding new log entry:', newLog);
              setLogs((prevLogs) => [newLog, ...prevLogs].slice(0, 50));
            } else {
              console.warn('⚠ Invalid MQTT message format:', payload);
            }
          } catch (parseErr) {
            console.error('✗ Error parsing MQTT message:', parseErr);
          }
        }
      });

      mqttClient.on('error', (err) => {
        console.error('✗ MQTT connection error:', err);
        setIsConnected(false);
        setError(`Connection failed: ${err.message}`);
      });

      mqttClient.on('disconnect', () => {
        console.log('⊘ Disconnected from MQTT broker');
        setIsConnected(false);
      });

      mqttClient.on('offline', () => {
        console.log('⊘ MQTT client went offline');
        setIsConnected(false);
      });
    };

    initializeData();

    return () => {
      if (mqttClient && mqttClient.connected) {
        mqttClient.unsubscribe(MQTT_TOPIC);
        mqttClient.end(true, () => {
          console.log('MQTT connection closed');
        });
      }
    };
  }, []);

  return {
    logs,
    isConnected,
    loading,
    error,
  };
}

