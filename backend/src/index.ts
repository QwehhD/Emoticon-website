#!/usr/bin/env ts-node
/**
 * Standalone MQTT Backend Validator
 * 
 * This script runs the MQTT validator independently from Next.js
 * Useful for testing and debugging MQTT connections
 * 
 * Usage:
 *   npm install -g ts-node
 *   ts-node scripts/mqtt-backend.ts
 * 
 * Or with tsx:
 *   npx tsx scripts/mqtt-backend.ts
 */

import * as dotenv from 'dotenv';
import mqtt, { MqttClient } from 'mqtt';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: '.env' });

interface AllowedUser {
  id?: string;
  uid: string;
  nama: string;
  created_at?: string;
  updated_at?: string;
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// MQTT Configuration
const MQTT_BROKER = process.env.NEXT_PUBLIC_MQTT_BROKER_URL || 'mqtts://5e5be1b7ba1b4958a3f9bb8ada1424eb.s1.eu.hivemq.cloud:8883';
const MQTT_USERNAME = process.env.NEXT_PUBLIC_MQTT_USERNAME || 'webbbb';
const MQTT_PASSWORD = process.env.NEXT_PUBLIC_MQTT_PASSWORD || 'gZiyEM81b3CBaxk2';

// Cache for user validation
const userCache = new Map<string, AllowedUser | null>();
const cacheExpiry = new Map<string, number>();
const CACHE_DURATION_MS = 60000; // 1 minute

let client: MqttClient | null = null;

/**
 * Extract host from broker URL
 */
function extractHost(url: string): string {
  try {
    const urlWithProtocol = url.includes('://') ? url : `mqtts://${url}`;
    return new URL(urlWithProtocol).hostname;
  } catch {
    return url.split(':')[0];
  }
}

/**
 * Extract port from broker URL
 */
function extractPort(url: string): number {
  try {
    const urlWithProtocol = url.includes('://') ? url : `mqtts://${url}`;
    const port = new URL(urlWithProtocol).port;
    return port ? parseInt(port, 10) : 8883;
  } catch {
    return 8883;
  }
}

/**
 * Get user by UID from database with caching
 */
async function getUserByUID(uid: string): Promise<AllowedUser | null> {
  const now = Date.now();
  
  // Check cache
  if (userCache.has(uid)) {
    const expiry = cacheExpiry.get(uid) || 0;
    if (now < expiry) {
      return userCache.get(uid) || null;
    }
    userCache.delete(uid);
    cacheExpiry.delete(uid);
  }

  // Query database
  try {
    const { data, error } = await supabase
      .from('allowed_users')
      .select('*')
      .eq('uid', uid)
      .maybeSingle();

    if (error) throw error;

    // Cache result (even if null)
    userCache.set(uid, data);
    cacheExpiry.set(uid, now + CACHE_DURATION_MS);

    return data;
  } catch (error) {
    console.error('❌ Database Error:', error);
    return null;
  }
}

/**
 * Publish authentication status
 */
function publishAuthStatus(valid: boolean): void {
  if (!client?.connected) {
    console.error('❌ Cannot publish: client not connected');
    return;
  }

  const payload = { valid };

  client.publish(
    'v1/emotion/auth_status',
    JSON.stringify(payload),
    { qos: 1 },
    (err) => {
      if (err) {
        console.error('❌ Failed to publish auth_status:', err);
      } else {
        console.log(`✓ Published auth_status: ${JSON.stringify(payload)}`);
      }
    }
  );
}

/**
 * Handle incoming MQTT messages
 */
async function handleMessage(topic: string, message: Buffer): Promise<void> {
  const messageStr = message.toString();
  console.log(`\n[${new Date().toISOString()}] Message received on ${topic}`);
  console.log('Payload:', messageStr);

  try {
    const payload = JSON.parse(messageStr);

    // Handle UID validation request
    if (topic === 'v1/emotion/check_uid') {
      const uid = payload.uid?.trim().toUpperCase();

      if (!uid) {
        console.error('❌ UID is empty');
        publishAuthStatus(false);
        return;
      }

      console.log(`🔍 Validating UID: ${uid}`);
      const userData = await getUserByUID(uid);
      const isValid = !!userData;

      console.log(`${isValid ? '✓' : '✗'} UID: ${uid} | Status: ${isValid ? 'VALID' : 'INVALID'} | User: ${userData?.nama || 'Unknown'}`);
      
      publishAuthStatus(isValid);
    }

    // Handle emotion log
    if (topic === 'v1/emotion/logs') {
      const { card_uid, emotion, timestamp } = payload;
      
      if (!card_uid || !emotion || !timestamp) {
        console.error('❌ Invalid emotion log format. Missing required fields:', payload);
        return;
      }

      console.log('📊 Emotion log received:');
      console.log(`  UID: ${card_uid}`);
      console.log(`  Emotion: ${emotion}`);
      console.log(`  Timestamp: ${timestamp}`);
      
      // ✅ LOOKUP USER NAME AND SAVE TO DATABASE
      try {
        // Get user name from allowed_users
        const userData = await getUserByUID(card_uid);
        const userName = userData?.nama || 'Unknown User';
        
        console.log(`  User: ${userName}`);
        
        const { data, error } = await supabase
          .from('emotion_logs')
          .insert([
            {
              card_uid: card_uid,
              emotion: emotion,
              timestamp: timestamp,
              user_name: userName,
            },
          ])
          .select();

        if (error) {
          console.error('❌ Failed to save to Supabase:', error);
          return;
        }

        console.log('✅ Emotion log saved to database:', data);
      } catch (error) {
        console.error('❌ Exception while saving to database:', error);
      }
    }
  } catch (error) {
    console.error('❌ JSON Parse Error:', error);
    if (topic === 'v1/emotion/check_uid') {
      publishAuthStatus(false);
    }
  }
}

/**
 * Connect to MQTT broker
 */
function connectMqtt(): void {
  const host = extractHost(MQTT_BROKER);
  const port = extractPort(MQTT_BROKER);

  console.log('\n🚀 Starting MQTT Backend Validator...');
  console.log(`📡 Connecting to ${host}:${port}...`);
  console.log(`👤 Username: ${MQTT_USERNAME}`);

  const options: mqtt.IClientOptions = {
    host,
    port,
    protocol: 'mqtts',
    username: MQTT_USERNAME,
    password: MQTT_PASSWORD,
    clientId: `backend-validator-${Math.random().toString(16).substring(2, 10)}`,
    clean: true,
    reconnectPeriod: 5000,
    connectTimeout: 30000,
    keepalive: 60,
    rejectUnauthorized: false,
  };

  client = mqtt.connect(options);

  client.on('connect', () => {
    console.log('✓ Connected to HiveMQ Cloud\n');

    // Subscribe to topics
    client!.subscribe('v1/emotion/check_uid', { qos: 1 }, (err) => {
      if (err) {
        console.error('❌ Failed to subscribe to v1/emotion/check_uid:', err);
      } else {
        console.log('✓ Subscribed to v1/emotion/check_uid');
      }
    });

    client!.subscribe('v1/emotion/logs', { qos: 1 }, (err) => {
      if (err) {
        console.error('❌ Failed to subscribe to v1/emotion/logs:', err);
      } else {
        console.log('✓ Subscribed to v1/emotion/logs');
      }
    });

    console.log('\n✅ MQTT Backend is ready and listening...\n');
  });

  client.on('message', (topic, message) => {
    handleMessage(topic, message).catch(console.error);
  });

  client.on('error', (error) => {
    console.error('❌ MQTT Connection Error:', error.message);
  });

  client.on('reconnect', () => {
    console.log('⟳ Reconnecting to HiveMQ Cloud...');
  });

  client.on('offline', () => {
    console.warn('⚠️  MQTT Client went offline');
  });

  client.on('close', () => {
    console.log('🔌 Connection closed');
  });
}

/**
 * Graceful shutdown
 */
function shutdown(): void {
  console.log('\n\n🛑 Shutting down...');
  if (client) {
    client.end();
  }
  process.exit(0);
}

// Handle shutdown signals
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Start the backend
connectMqtt();
