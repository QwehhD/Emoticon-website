#!/usr/bin/env ts-node
/**
 * Test MQTT Flow
 * 
 * This script simulates ESP32 behavior to test the complete MQTT flow:
 * 1. Connect to HiveMQ Cloud
 * 2. Subscribe to auth_status topic
 * 3. Send UID validation request
 * 4. Wait for response
 * 5. Send emotion log
 * 
 * Usage:
 *   npx tsx scripts/test-mqtt-flow.ts
 */

import * as dotenv from 'dotenv';
import mqtt, { MqttClient } from 'mqtt';

dotenv.config({ path: '.env' });

const MQTT_BROKER = process.env.NEXT_PUBLIC_MQTT_BROKER_URL || 'mqtts://5e5be1b7ba1b4958a3f9bb8ada1424eb.s1.eu.hivemq.cloud:8883';
const MQTT_USERNAME = process.env.NEXT_PUBLIC_MQTT_USERNAME || 'webbbb';
const MQTT_PASSWORD = process.env.NEXT_PUBLIC_MQTT_PASSWORD || 'gZiyEM81b3CBaxk2';

// Test UIDs
const TEST_VALID_UID = 'E240B8C3';
const TEST_INVALID_UID = 'INVALID123';

let client: MqttClient | null = null;
let testStep = 0;

function extractHost(url: string): string {
  try {
    const urlWithProtocol = url.includes('://') ? url : `mqtts://${url}`;
    return new URL(urlWithProtocol).hostname;
  } catch {
    return url.split(':')[0];
  }
}

function extractPort(url: string): number {
  try {
    const urlWithProtocol = url.includes('://') ? url : `mqtts://${url}`;
    const port = new URL(urlWithProtocol).port;
    return port ? parseInt(port, 10) : 8883;
  } catch {
    return 8883;
  }
}

function testValidUID(): void {
  console.log('\n📝 Test 1: Valid UID');
  console.log('Sending UID validation request...');
  
  const payload = { uid: TEST_VALID_UID };
  client!.publish('v1/emotion/check_uid', JSON.stringify(payload), { qos: 1 }, (err) => {
    if (err) {
      console.error('❌ Failed to publish:', err);
    } else {
      console.log(`✓ Published: ${JSON.stringify(payload)}`);
    }
  });
}

function testInvalidUID(): void {
  console.log('\n📝 Test 2: Invalid UID');
  console.log('Sending UID validation request...');
  
  const payload = { uid: TEST_INVALID_UID };
  client!.publish('v1/emotion/check_uid', JSON.stringify(payload), { qos: 1 }, (err) => {
    if (err) {
      console.error('❌ Failed to publish:', err);
    } else {
      console.log(`✓ Published: ${JSON.stringify(payload)}`);
    }
  });
}

function testEmotionLog(): void {
  console.log('\n📝 Test 3: Emotion Log');
  console.log('Sending emotion log...');
  
  const payload = {
    card_uid: TEST_VALID_UID,
    emotion: 'senang',
    timestamp: Math.floor(Date.now() / 1000)
  };
  
  client!.publish('v1/emotion/logs', JSON.stringify(payload), { qos: 1 }, (err) => {
    if (err) {
      console.error('❌ Failed to publish:', err);
    } else {
      console.log(`✓ Published: ${JSON.stringify(payload)}`);
    }
  });
}

function runNextTest(): void {
  testStep++;
  
  setTimeout(() => {
    switch (testStep) {
      case 1:
        testValidUID();
        runNextTest();
        break;
      case 2:
        testInvalidUID();
        runNextTest();
        break;
      case 3:
        testEmotionLog();
        console.log('\n✅ All tests completed!');
        console.log('Press Ctrl+C to exit or wait for more messages...\n');
        break;
    }
  }, 2000);
}

function connectMqtt(): void {
  const host = extractHost(MQTT_BROKER);
  const port = extractPort(MQTT_BROKER);

  console.log('🧪 MQTT Flow Test Script');
  console.log('========================\n');
  console.log(`📡 Connecting to ${host}:${port}...`);

  const options: mqtt.IClientOptions = {
    host,
    port,
    protocol: 'mqtts',
    username: MQTT_USERNAME,
    password: MQTT_PASSWORD,
    clientId: `test-client-${Math.random().toString(16).substring(2, 10)}`,
    clean: true,
    reconnectPeriod: 5000,
    connectTimeout: 30000,
    keepalive: 60,
    rejectUnauthorized: false,
  };

  client = mqtt.connect(options);

  client.on('connect', () => {
    console.log('✓ Connected to HiveMQ Cloud\n');

    // Subscribe to auth_status to receive responses
    client!.subscribe('v1/emotion/auth_status', { qos: 1 }, (err) => {
      if (err) {
        console.error('❌ Failed to subscribe:', err);
      } else {
        console.log('✓ Subscribed to v1/emotion/auth_status\n');
        console.log('Starting tests in 2 seconds...\n');
        runNextTest();
      }
    });
  });

  client.on('message', (topic, message) => {
    const messageStr = message.toString();
    console.log(`\n📨 Response received on ${topic}:`);
    console.log(`   ${messageStr}`);
    
    try {
      const payload = JSON.parse(messageStr);
      if (payload.valid === true) {
        console.log('   ✅ UID is VALID');
      } else if (payload.valid === false) {
        console.log('   ❌ UID is INVALID');
      }
    } catch (e) {
      // Not JSON or different format
    }
  });

  client.on('error', (error) => {
    console.error('❌ MQTT Error:', error.message);
  });

  client.on('offline', () => {
    console.warn('⚠️  Client went offline');
  });
}

function shutdown(): void {
  console.log('\n\n🛑 Shutting down...');
  if (client) {
    client.end();
  }
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

connectMqtt();
