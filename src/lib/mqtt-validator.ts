import mqtt, { MqttClient } from 'mqtt';
import { supabase } from './supabase';

interface AllowedUser {
  id?: string;
  uid: string;
  nama: string;
  created_at?: string;
  updated_at?: string;
}

interface MqttValidatorConfig {
  brokerUrl: string;
  username: string;
  password: string;
  onMessage?: (topic: string, message: string) => void;
  onError?: (error: Error) => void;
}

class MqttValidator {
  private client: MqttClient | null = null;
  private config: MqttValidatorConfig;
  private userCache: Map<string, AllowedUser | null> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION_MS = 60000;

  constructor(config: MqttValidatorConfig) {
    this.config = config;
  }

  public async connect(): Promise<void> {
    if (this.client?.connected) return;

    return new Promise((resolve, reject) => {
      const host = this.extractHost(this.config.brokerUrl);
      const port = this.extractPort(this.config.brokerUrl);

      const options: mqtt.IClientOptions = {
        host,
        port,
        protocol: 'mqtts', // Memaksa TLS untuk HiveMQ Cloud
        username: this.config.username,
        password: this.config.password,
        // Gunakan ID yang lebih spesifik agar tidak bentrok dengan ESP32
        clientId: `nextjs-validator-${Math.random().toString(16).substring(2, 10)}`,
        clean: true,
        reconnectPeriod: 5000, // Beri jeda 5 detik agar tidak spam broker
        connectTimeout: 30000,
        keepalive: 60, // Sangat penting agar tidak "offline" saat idle
        rejectUnauthorized: false, 
      };

      console.log(`[MQTT] Connecting to ${host}:${port}...`);
      this.client = mqtt.connect(options);

      this.client.on('connect', () => {
        console.log('✓ Connected to HiveMQ Cloud');
        this.subscribe();
        resolve();
      });

      this.client.on('message', (topic, message) => {
        // Gunakan .catch untuk menghindari unhandled promise rejection
        this.handleMessage(topic, message.toString()).catch(console.error);
        if (this.config.onMessage) this.config.onMessage(topic, message.toString());
      });

      this.client.on('error', (error) => {
        console.error('✗ MQTT Connection Error:', error.message);
        if (this.config.onError) this.config.onError(error);
      });

      this.client.on('reconnect', () => {
        console.log('⟳ Reconnecting to HiveMQ Cloud...');
      });

      this.client.on('offline', () => {
        console.warn('⚠ MQTT Client went offline. Check your internet or broker status.');
      });
    });
  }

  private subscribe(): void {
    if (!this.client) return;
    
    // Subscribe to UID validation requests
    this.client.subscribe('v1/emotion/check_uid', { qos: 1 }, (err) => {
      if (err) {
        console.error('[MQTT] Failed to subscribe to v1/emotion/check_uid:', err);
      } else {
        console.log('[MQTT] ✓ Subscribed to v1/emotion/check_uid');
      }
    });

    // Subscribe to emotion logs
    this.client.subscribe('v1/emotion/logs', { qos: 1 }, (err) => {
      if (err) {
        console.error('[MQTT] Failed to subscribe to v1/emotion/logs:', err);
      } else {
        console.log('[MQTT] ✓ Subscribed to v1/emotion/logs');
      }
    });
  }

  private async handleMessage(topic: string, message: string): Promise<void> {
    console.log(`\n[${new Date().toISOString()}] Message received on ${topic}`);
    console.log('Payload:', message);

    try {
      const payload = JSON.parse(message);

      // Handle UID validation request
      if (topic === 'v1/emotion/check_uid') {
        const uid = payload.uid?.trim().toUpperCase();

        if (!uid) {
          console.error('[MQTT] UID is empty');
          this.publishAuthStatus(false);
          return;
        }

        const userData = await this.getUserByUID(uid);
        const isValid = !!userData;

        console.log(`[MQTT] UID Check: ${uid} | Status: ${isValid ? '✓ VALID' : '✗ INVALID'} | User: ${userData?.nama || 'Unknown'}`);
        
        this.publishAuthStatus(isValid);
      }

      // Handle emotion log
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
        
        // TODO: Save to database via emotion logger
        // For now, just log it
      }
    } catch (error) {
      console.error('[MQTT] JSON Parse Error:', error);
      if (topic === 'v1/emotion/check_uid') {
        this.publishAuthStatus(false);
      }
    }
  }

  private async getUserByUID(uid: string): Promise<AllowedUser | null> {
    const now = Date.now();
    
    // 1. Cek Cache
    if (this.userCache.has(uid)) {
      const expiry = this.cacheExpiry.get(uid) || 0;
      if (now < expiry) return this.userCache.get(uid) || null;
      this.userCache.delete(uid);
      this.cacheExpiry.delete(uid);
    }

    // 2. Query Supabase
    try {
      const { data, error } = await supabase
        .from('allowed_users')
        .select('*')
        .eq('uid', uid)
        .maybeSingle(); // Lebih aman daripada .single() jika data tidak ada

      if (error) throw error;

      // 3. Simpan ke Cache (Sekalipun null, agar tidak spam DB untuk kartu ilegal)
      this.userCache.set(uid, data);
      this.cacheExpiry.set(uid, now + this.CACHE_DURATION_MS);

      return data;
    } catch (error) {
      console.error('Database Error:', error);
      return null;
    }
  }

  private publishAuthStatus(valid: boolean): void {
    if (!this.client?.connected) {
      console.error('[MQTT] Cannot publish: client not connected');
      return;
    }

    // Match exact requirement format: {"valid": true} or {"valid": false}
    const payload = { valid };

    this.client.publish(
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
  }

  public async getAllowedUsers(): Promise<AllowedUser[]> {
    try {
      const { data, error } = await supabase
        .from('allowed_users')
        .select('*')
        .order('nama', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[MQTT] Error fetching allowed users:', error);
      return [];
    }
  }

  public isConnected(): boolean {
    return this.client?.connected || false;
  }

  public disconnect(): void {
    if (this.client) {
      this.client.end();
      console.log('[MQTT] Disconnected from MQTT broker');
    }
  }

  private extractHost(url: string): string {
    try {
      const urlWithProtocol = url.includes('://') ? url : `mqtts://${url}`;
      return new URL(urlWithProtocol).hostname;
    } catch {
      return url.split(':')[0];
    }
  }

  private extractPort(url: string): number {
    try {
      const urlWithProtocol = url.includes('://') ? url : `mqtts://${url}`;
      const port = new URL(urlWithProtocol).port;
      return port ? parseInt(port, 10) : 8883;
    } catch {
      return 8883;
    }
  }
}

export default MqttValidator;