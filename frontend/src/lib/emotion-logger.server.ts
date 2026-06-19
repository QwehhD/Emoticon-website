import EmotionMqttLogger from './emotion-mqtt-logger';
import { EmotionLog } from './emotion-logger';

let emotionLoggerInstance: EmotionMqttLogger | null = null;

/**
 * Initialize and start the MQTT emotion logger
 * Should be called once on backend startup
 */
export async function initializeEmotionLogger(): Promise<EmotionMqttLogger> {
  if (emotionLoggerInstance) {
    console.log('Emotion Logger already initialized');
    return emotionLoggerInstance;
  }

  const brokerUrl = process.env.NEXT_PUBLIC_MQTT_BROKER_URL;
  const username = process.env.NEXT_PUBLIC_MQTT_USERNAME;
  const password = process.env.NEXT_PUBLIC_MQTT_PASSWORD;

  if (!brokerUrl || !username || !password) {
    throw new Error(
      'Missing MQTT configuration. Please set NEXT_PUBLIC_MQTT_BROKER_URL, NEXT_PUBLIC_MQTT_USERNAME, and NEXT_PUBLIC_MQTT_PASSWORD in .env.local'
    );
  }

  const logger = new EmotionMqttLogger({
    brokerUrl,
    username,
    password,
    onEmotionReceived: (log: EmotionLog) => {
      console.log(`📊 Emotion logged: ${log.card_uid} - ${log.emotion}`);
    },
    onError: (error) => {
      console.error('Emotion Logger Error:', error);
    },
  });

  try {
    await logger.connect();
    emotionLoggerInstance = logger;
    console.log('Emotion Logger initialized successfully');
    return logger;
  } catch (error) {
    console.error('Failed to initialize Emotion Logger:', error);
    throw error;
  }
}

/**
 * Get the emotion logger instance
 */
export function getEmotionLogger(): EmotionMqttLogger | null {
  return emotionLoggerInstance;
}

/**
 * Shutdown emotion logger
 */
export function shutdownEmotionLogger(): void {
  if (emotionLoggerInstance) {
    emotionLoggerInstance.disconnect();
    emotionLoggerInstance = null;
  }
}
