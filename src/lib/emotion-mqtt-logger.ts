import mqtt, { MqttClient } from 'mqtt';
import { saveEmotionLog, EmotionLog } from './emotion-logger';

interface EmotionLoggerConfig {
  brokerUrl: string;
  username: string;
  password: string;
  onEmotionReceived?: (log: EmotionLog) => void;
  onError?: (error: Error) => void;
}

class EmotionMqttLogger {
  private client: MqttClient | null = null;
  private config: EmotionLoggerConfig;

  constructor(config: EmotionLoggerConfig) {
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
        clientId: `emoticon-logger-${Date.now()}`,
        clean: true,
        reconnectPeriod: 1000,
        connectTimeout: 30000,
        rejectUnauthorized: false,
      };

      this.client = mqtt.connect(options);

      this.client.on('connect', () => {
        console.log('✓ Connected to HiveMQ Cloud (Emotion Logger)');
        this.subscribe();
        resolve();
      });

      this.client.on('message', (topic, message) => {
        this.handleMessage(topic, message.toString());
      });

      this.client.on('error', (error) => {
        console.error('✗ MQTT Connection Error (Emotion Logger):', error);
        if (this.config.onError) {
          this.config.onError(error);
        }
        reject(error);
      });

      this.client.on('reconnect', () => {
        console.log('⟳ Reconnecting to HiveMQ Cloud (Emotion Logger)...');
      });

      this.client.on('offline', () => {
        console.log('✗ MQTT Client went offline (Emotion Logger)');
      });
    });
  }

  /**
   * Subscribe to emotion logs topic
   */
  private subscribe(): void {
    if (!this.client) return;

    this.client.subscribe('v1/emotion/logs', (err) => {
      if (err) {
        console.error('Failed to subscribe to v1/emotion/logs:', err);
      } else {
        console.log('✓ Subscribed to v1/emotion/logs');
      }
    });
  }

  /**
   * Handle incoming emotion log messages
   * Expected format: {"card_uid": "xxx", "emotion": "xxx", "timestamp": 123}
   */
  private async handleMessage(topic: string, message: string): Promise<void> {
    if (topic === 'v1/emotion/logs') {
      try {
        const payload = JSON.parse(message);
        const { card_uid, emotion, timestamp } = payload;

        if (!card_uid || !emotion || !timestamp) {
          console.error('Invalid emotion log format. Missing required fields:', payload);
          return;
        }

        const emotionLog: EmotionLog = {
          card_uid,
          emotion,
          timestamp,
        };

        console.log(
          `[${new Date().toISOString()}] Emotion Log: ${card_uid} - ${emotion}`
        );

        // Save to database
        const saved = await saveEmotionLog(emotionLog);

        if (saved && this.config.onEmotionReceived) {
          this.config.onEmotionReceived(saved);
        }
      } catch (error) {
        console.error('Error parsing emotion log message:', error);
      }
    }
  }

  /**
   * Disconnect from broker
   */
  public disconnect(): void {
    if (this.client) {
      this.client.end();
      console.log('Disconnected from MQTT broker (Emotion Logger)');
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
   * Get connection status
   */
  public isConnected(): boolean {
    return this.client?.connected || false;
  }
}

export default EmotionMqttLogger;
