#!/usr/bin/env node

/**
 * Standalone MQTT Validator Server
 * Run this file to start the MQTT validation service
 * 
 * Usage:
 *   node scripts/mqtt-validator.js
 *   or
 *   tsx scripts/mqtt-validator.ts (if using TypeScript)
 */

import MqttValidator from '../src/lib/mqtt-validator';

const brokerUrl = process.env.NEXT_PUBLIC_MQTT_BROKER_URL;
const username = process.env.NEXT_PUBLIC_MQTT_USERNAME;
const password = process.env.NEXT_PUBLIC_MQTT_PASSWORD;

if (!brokerUrl || !username || !password) {
  console.error('❌ Missing MQTT configuration:');
  console.error('   - NEXT_PUBLIC_MQTT_BROKER_URL');
  console.error('   - NEXT_PUBLIC_MQTT_USERNAME');
  console.error('   - NEXT_PUBLIC_MQTT_PASSWORD');
  process.exit(1);
}

const validator = new MqttValidator({
  brokerUrl,
  username,
  password,
  onMessage: (topic: string, message: string) => {
    console.log(`📨 Message received on ${topic}:`, message);
  },
  onError: (error: Error) => {
    console.error('❌ MQTT Error:', error);
  },
});

// Connect to broker
validator.connect().catch((error: Error) => {
  console.error('Failed to connect:', error);
  process.exit(1);
});

// Handle graceful shutdown
const gracefulShutdown = () => {
  console.log('\n🛑 Shutting down MQTT Validator...');
  validator.disconnect();
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

console.log('🚀 MQTT Validator is running. Press Ctrl+C to stop.');
