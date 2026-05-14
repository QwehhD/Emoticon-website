import { initializeMqttValidator, getMqttValidator } from '@/lib/mqtt-validator.server';
import { NextResponse } from 'next/server';

/**
 * GET /api/mqtt/health
 * Check if MQTT validator is connected
 */
export async function GET() {
  try {
    let validator = getMqttValidator();

    if (!validator) {
      validator = await initializeMqttValidator();
    }

    const users = await validator.getAllowedUsers();

    return NextResponse.json(
      {
        status: 'healthy',
        message: 'MQTT Validator is running',
        users,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to initialize MQTT Validator',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/mqtt/init
 * Manually initialize MQTT validator
 */
export async function POST() {
  try {
    const validator = await initializeMqttValidator();

    const users = await validator.getAllowedUsers();

    return NextResponse.json(
      {
        status: 'initialized',
        message: 'MQTT Validator initialized successfully',
        users,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to initialize MQTT Validator',
      },
      { status: 500 }
    );
  }
}
