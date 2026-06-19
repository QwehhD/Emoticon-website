import { initializeMqttValidator, getMqttValidator } from '@/lib/mqtt-validator.server';
import { NextResponse } from 'next/server';

/**
 * GET /api/mqtt/health
 * Check if MQTT validator is connected and get allowed users
 */
export async function GET() {
  try {
    let validator = getMqttValidator();

    if (!validator) {
      console.log('[API] Initializing MQTT validator...');
      validator = await initializeMqttValidator();
    }

    const isConnected = validator.isConnected();
    const users = await validator.getAllowedUsers();

    return NextResponse.json(
      {
        status: isConnected ? 'healthy' : 'disconnected',
        connected: isConnected,
        message: isConnected
          ? 'MQTT Validator is running and connected'
          : 'MQTT Validator initialized but not connected',
        allowedUsers: users,
        userCount: users.length,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] MQTT Health Check Error:', error);
    return NextResponse.json(
      {
        status: 'error',
        connected: false,
        message: error instanceof Error ? error.message : 'Failed to initialize MQTT Validator',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/mqtt/init
 * Manually initialize or reinitialize MQTT validator
 */
export async function POST() {
  try {
    console.log('[API] Manually initializing MQTT validator...');
    const validator = await initializeMqttValidator();

    const isConnected = validator.isConnected();
    const users = await validator.getAllowedUsers();

    return NextResponse.json(
      {
        status: 'initialized',
        connected: isConnected,
        message: 'MQTT Validator initialized successfully',
        allowedUsers: users,
        userCount: users.length,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] MQTT Initialization Error:', error);
    return NextResponse.json(
      {
        status: 'error',
        connected: false,
        message: error instanceof Error ? error.message : 'Failed to initialize MQTT Validator',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
