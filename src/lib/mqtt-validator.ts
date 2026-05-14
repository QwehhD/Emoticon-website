import mqtt, { MqttClient } from 'mqtt';
import { supabase } from './supabase';

// Allowed users interface (maps to Supabase allowed_users table)
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
  private readonly CACHE_DURATION_MS = 60000; // 60 second cache

  constructor(config: MqttValidatorConfig) {
    this.config = config;
  }

  /**
   * Connect to HiveMQ Cloud with TLS
   */
  public async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const options: mqtt.IClientOptions = {
        host: this.extractHost(this.config.brokerUrl),
        port: this.extractPort(this.config.brokerUrl),
        protocol: 'mqtts',
        username: this.config.username,
        password: this.config.password,
        clientId: `emoticon-validator-${Date.now()}`,
        clean: true,
        reconnectPeriod: 1000,
        connectTimeout: 30000,
        rejectUnauthorized: false, // For self-signed certs, set to false
      };

      this.client = mqtt.connect(options);

      this.client.on('connect', () => {
        console.log('✓ Connected to HiveMQ Cloud');
        this.subscribe();
        resolve();
      });

      this.client.on('message', (topic, message) => {
        this.handleMessage(topic, message.toString()).catch((error) => {
          console.error('Error handling message:', error);
        });
        if (this.config.onMessage) {
          this.config.onMessage(topic, message.toString());
        }
      });

      this.client.on('error', (error) => {
        console.error('✗ MQTT Connection Error:', error);
        if (this.config.onError) {
          this.config.onError(error);
        }
        reject(error);
      });

      this.client.on('reconnect', () => {
        console.log('⟳ Reconnecting to HiveMQ Cloud...');
      });

      this.client.on('offline', () => {
        console.log('✗ MQTT Client went offline');
      });
    });
  }

  /**
   * Subscribe to validation topic
   */
  private subscribe(): void {
    if (!this.client) return;

    this.client.subscribe('v1/emotion/check_uid', (err) => {
      if (err) {
        console.error('Failed to subscribe to v1/emotion/check_uid:', err);
      } else {
        console.log('✓ Subscribed to v1/emotion/check_uid');
      }
    });
  }

  /**
   * Handle incoming messages
   */
  private async handleMessage(topic: string, message: string): Promise<void> {
    if (topic === 'v1/emotion/check_uid') {
      try {
        const payload = JSON.parse(message);
        const { uid } = payload;

        if (!uid) {
          this.publishAuthStatus(false, 'Missing UID in payload');
          return;
        }

        const isValid = await this.validateUID(uid);
        const userData = await this.getUserByUID(uid);

        console.log(`[${new Date().toISOString()}] UID Check: ${uid} -> ${isValid}`);
        this.publishAuthStatus(isValid, isValid ? userData?.nama : 'UID not found');
      } catch (error) {
        console.error('Error parsing message:', error);
        this.publishAuthStatus(false, 'Invalid JSON payload');
      }
    }
  }

  /**
   * Validate UID against Supabase allowed_users table
   */
  private async validateUID(uid: string): Promise<boolean> {
    try {
      const user = await this.getUserByUID(uid);
      return user !== null && user !== undefined;
    } catch (error) {
      console.error('Error validating UID:', error);
      return false;
    }
  }

  /**
   * Get user data by UID from Supabase (with caching)
   */
  private async getUserByUID(uid: string): Promise<AllowedUser | null> {
    // Check cache first
    const now = Date.now();
    if (this.userCache.has(uid)) {
      const expiry = this.cacheExpiry.get(uid) || 0;
      if (now < expiry) {
        return this.userCache.get(uid) || null;
      }
      // Cache expired, remove it
      this.userCache.delete(uid);
      this.cacheExpiry.delete(uid);
    }

    try {
      const { data, error } = await supabase
        .from('allowed_users')
        .select('*')
        .eq('uid', uid)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned - UID not found
          this.userCache.set(uid, null);
          this.cacheExpiry.set(uid, now + this.CACHE_DURATION_MS);
          return null;
        }
        console.error('Error querying user from Supabase:', error);
        return null;
      }

      // Cache the result
      this.userCache.set(uid, data);
      this.cacheExpiry.set(uid, now + this.CACHE_DURATION_MS);

      return data;
    } catch (error) {
      console.error('Exception querying user from Supabase:', error);
      return null;
    }
  }

  /**
   * Publish authentication status with BIGINT timestamp
   */
  private publishAuthStatus(valid: boolean, message?: string): void {
    if (!this.client) return;

    const payload = {
      valid,
      message: message || (valid ? 'UID is valid' : 'UID is invalid'),
      timestamp: Math.floor(Date.now()), // BIGINT timestamp in milliseconds
    };

    this.client.publish(
      'v1/emotion/auth_status',
      JSON.stringify(payload),
      { qos: 1, retain: false },
      (err) => {
        if (err) {
          console.error('Failed to publish auth_status:', err);
        } else {
          console.log(`✓ Published auth_status: ${JSON.stringify(payload)}`);
        }
      }
    );
  }

  /**
   * Disconnect from broker
   */
  public disconnect(): void {
    if (this.client) {
      this.client.end();
      console.log('Disconnected from MQTT broker');
    }
  }

  /**
   * Extract host from broker URL
   */
  private extractHost(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url.split('://')[1]?.split(':')[0] || url;
    }
  }

  /**
   * Extract port from broker URL
   */
  private extractPort(url: string): number {
    try {
      const urlObj = new URL(url);
      return parseInt(urlObj.port, 10) || 8883;
    } catch {
      const parts = url.split(':');
      return parseInt(parts[parts.length - 1], 10) || 8883;
    }
  }

  /**
   * Add a new allowed user to Supabase database
   */
  public async addAllowedUser(user: AllowedUser): Promise<void> {
    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('allowed_users')
        .select('id')
        .eq('uid', user.uid)
        .single();

      if (existingUser) {
        console.log(`⚠ User already exists: ${user.uid} (${user.nama})`);
        return;
      }

      // Insert new user
      const { error } = await supabase
        .from('allowed_users')
        .insert([{ uid: user.uid, nama: user.nama }]);

      if (error) {
        console.error(`✗ Failed to add user ${user.uid}:`, error);
        return;
      }

      // Invalidate cache for this user
      this.userCache.delete(user.uid);
      this.cacheExpiry.delete(user.uid);

      console.log(`✓ Added user: ${user.uid} (${user.nama})`);
    } catch (error) {
      console.error('Error adding user to Supabase:', error);
    }
  }

  /**
   * Get all allowed users from Supabase
   */
  public async getAllowedUsers(): Promise<AllowedUser[]> {
    try {
      const { data, error } = await supabase
        .from('allowed_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching allowed users from Supabase:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Exception fetching allowed users from Supabase:', error);
      return [];
    }
  }
}

export default MqttValidator;
