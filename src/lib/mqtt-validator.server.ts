import MqttValidator from './mqtt-validator';

let mqttValidatorInstance: MqttValidator | null = null;

/**
 * Initialize and start the MQTT validator
 * Should be called once on backend startup
 */
export async function initializeMqttValidator(): Promise<MqttValidator> {
  if (mqttValidatorInstance) {
    console.log('MQTT Validator already initialized');
    return mqttValidatorInstance;
  }

  const brokerUrl = process.env.NEXT_PUBLIC_MQTT_BROKER_URL;
  const username = process.env.NEXT_PUBLIC_MQTT_USERNAME;
  const password = process.env.NEXT_PUBLIC_MQTT_PASSWORD;

  if (!brokerUrl || !username || !password) {
    throw new Error(
      'Missing MQTT configuration. Please set NEXT_PUBLIC_MQTT_BROKER_URL, NEXT_PUBLIC_MQTT_USERNAME, and NEXT_PUBLIC_MQTT_PASSWORD in .env.local'
    );
  }

  const validator = new MqttValidator({
    brokerUrl,
    username,
    password,
    onError: (error) => {
      console.error('MQTT Validator Error:', error);
    },
  });

  try {
    await validator.connect();
    mqttValidatorInstance = validator;
    console.log('MQTT Validator initialized successfully');
    return validator;
  } catch (error) {
    console.error('Failed to initialize MQTT Validator:', error);
    throw error;
  }
}

/**
 * Get the MQTT validator instance
 */
export function getMqttValidator(): MqttValidator | null {
  return mqttValidatorInstance;
}

/**
 * Shutdown MQTT validator
 */
export function shutdownMqttValidator(): void {
  if (mqttValidatorInstance) {
    mqttValidatorInstance.disconnect();
    mqttValidatorInstance = null;
  }
}
