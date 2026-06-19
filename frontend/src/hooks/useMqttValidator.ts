'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import mqtt, { MqttClient } from 'mqtt';
import { createClient } from '@supabase/supabase-js';

interface AllowedUser {
  id?: string;
  uid: string;
  nama: string;
  created_at?: string;
  updated_at?: string;
}

interface UseMqttValidatorReturn {
  isConnected: boolean;
  error: string | null;
  lastMessage: { topic: string; message: string } | null;
}

export function useMqttValidator(): UseMqttValidatorReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<{ topic: string; message: string } | null>(null);
  
  const clientRef = useRef<MqttClient | null>(null);
  const userCacheRef = useRef<Map<string, AllowedUser | null>>(new Map());
  const cacheExpiryRef = useRef<Map<string, number>>(new Map());
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  
  const CACHE_DURATION_MS = 60000;

  const getUserByUID = useCallback(async (uid: string): Promise<AllowedUser | null> => {
    const now = Date.now();
    
    if (userCacheRef.current.has(uid)) {
      const expiry = cacheExpiryRef.current.get(uid) || 0;
      if (now < expiry) {
        return userCacheRef.current.get(uid) || null;
      }
      userCacheRef.current.delete(uid);
      cacheExpiryRef.current.delete(uid);
    }

    try {
      if (!supabaseRef.current) return null;
      
      const { data, error } = await supabaseRef.current
        .from('allowed_users')
        .select('*')
        .eq('uid', uid)
        .maybeSingle();

      if (error) throw error;

      userCacheRef.current.set(uid, data);
      cacheExpiryRef.current.set(uid, now + CACHE_DURATION_MS);

      return data;
    } catch (error) {
      console.error('Database Error:', error);
      return null;
    }
  }, []);

  const publishAuthStatus = useCallback((valid: boolean) => {
    if (!clientRef.current?.connected) {
      console.error('[MQTT] Cannot publish: client not connected');
      return;
    }

    const payload = { valid };

    clientRef.current.publish(
      'v1/emotion/auth_status',
      JSON.stringify(payload),
      { qos: 1 },
      (err) => {
        if (err) {
          console.error('[MQTT] Failed to publish auth_status:', err);
        } else {
          console.log(`[MQTT] ✓ Published auth_status: ${JSON.stringify(payload)}`);
        }
      }
    );
  }, []);

  const handleMessage = useCallback(async (topic: string, message: Buffer) => {
    const messageStr = message.toString();
    console.log(`\n[${new Date().toISOString()}] Message received on ${topic}`);
    console.log('Payload:', messageStr);

    setLastMessage({ topic, message: messageStr });

    try {
      const payload = JSON.parse(messageStr);

      if (topic === 'v1/emotion/check_uid') {
        const uid = payload.uid?.trim().toUpperCase();

        if (!uid) {
          console.error('[MQTT] UID is empty');
          publishAuthStatus(false);
          return;
        }

        const userData = await getUserByUID(uid);
        const isValid = !!userData;

        console.log(`[MQTT] UID Check: ${uid} | Status: ${isValid ? '✓ VALID' : '✗ INVALID'} | User: ${userData?.nama || 'Unknown'}`);
        
        publishAuthStatus(isValid);
      }

      if (topic === 'v1/emotion/logs') {
        const { card_uid, emotion, timestamp } = payload;
        
        if (!card_uid || !emotion || !timestamp) {
          console.error('[MQTT] Invalid emotion log format. Missing required fields:', payload);
          return;
        }

        console.log('[MQTT] Emotion log received:');
        console.log(`  UID: ${card_uid}`);
        console.log(`  Emotion: ${emotion}`);
        console.log(`  Timestamp: ${timestamp}`);
      }
    } catch (error) {
      console.error('[MQTT] JSON Parse Error:', error);
      if (topic === 'v1/emotion/check_uid') {
        publishAuthStatus(false);
      }
    }
  }, [getUserByUID, publishAuthStatus]);

  useEffect(() => {
    const brokerUrl = process.env.NEXT_PUBLIC_MQTT_BROKER_URL;
    const username = process.env.NEXT_PUBLIC_MQTT_USERNAME;
    const password = process.env.NEXT_PUBLIC_MQTT_PASSWORD;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!brokerUrl || !username || !password || !supabaseUrl || !supabaseKey) {
      setError('Missing MQTT or Supabase configuration');
      return;
    }

    supabaseRef.current = createClient(supabaseUrl, supabaseKey);

    const extractHost = (url: string): string => {
      try {
        const urlWithProtocol = url.includes('://') ? url : `wss://${url}`;
        return new URL(urlWithProtocol).hostname;
      } catch {
        return url.split(':')[0];
      }
    };

    const host = extractHost(brokerUrl);
    const wsUrl = `wss://${host}:8884/mqtt`;

    console.log(`[MQTT] Connecting to ${wsUrl}...`);

    const client = mqtt.connect(wsUrl, {
      username,
      password,
      clientId: `nextjs-client-${Math.random().toString(16).substring(2, 10)}`,
      clean: true,
      reconnectPeriod: 5000,
      connectTimeout: 30000,
      keepalive: 60,
      protocol: 'wss',
    });

    clientRef.current = client;

    client.on('connect', () => {
      console.log('[MQTT] ✓ Connected to HiveMQ Cloud via WebSocket');
      setIsConnected(true);
      setError(null);

      client.subscribe('v1/emotion/check_uid', { qos: 1 }, (err) => {
        if (err) {
          console.error('[MQTT] Failed to subscribe to v1/emotion/check_uid:', err);
        } else {
          console.log('[MQTT] ✓ Subscribed to v1/emotion/check_uid');
        }
      });

      client.subscribe('v1/emotion/logs', { qos: 1 }, (err) => {
        if (err) {
          console.error('[MQTT] Failed to subscribe to v1/emotion/logs:', err);
        } else {
          console.log('[MQTT] ✓ Subscribed to v1/emotion/logs');
        }
      });
    });

    client.on('message', (topic, message) => {
      handleMessage(topic, message).catch(console.error);
    });

    client.on('error', (err) => {
      console.error('[MQTT] Connection Error:', err.message);
      setError(err.message);
      setIsConnected(false);
    });

    client.on('reconnect', () => {
      console.log('[MQTT] ⟳ Reconnecting...');
    });

    client.on('offline', () => {
      console.warn('[MQTT] ⚠ Client went offline');
      setIsConnected(false);
    });

    client.on('close', () => {
      console.log('[MQTT] Connection closed');
      setIsConnected(false);
    });

    return () => {
      if (clientRef.current) {
        clientRef.current.end();
        console.log('[MQTT] Disconnected');
      }
    };
  }, [handleMessage]);

  return { isConnected, error, lastMessage };
}
