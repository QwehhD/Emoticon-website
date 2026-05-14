import {
  getAllEmotionLogs,
  getEmotionLogsByUID,
  deleteEmotionLog,
} from '@/lib/emotion-logger';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/emotion-logs
 * Get emotion logs (all or filtered by UID)
 * Query params:
 *   - uid: filter by card_uid
 *   - limit: max results (default 100)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    let logs;

    if (uid) {
      logs = await getEmotionLogsByUID(uid);
    } else {
      logs = await getAllEmotionLogs(limit);
    }

    return NextResponse.json(
      {
        status: 'success',
        data: logs,
        count: logs.length,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to fetch emotion logs',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/emotion-logs
 * Delete an emotion log by ID
 * Query params:
 *   - id: emotion log ID to delete
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Missing id parameter',
        },
        { status: 400 }
      );
    }

    const success = await deleteEmotionLog(id);

    if (success) {
      return NextResponse.json(
        {
          status: 'success',
          message: 'Emotion log deleted',
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Failed to delete emotion log',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to delete emotion log',
      },
      { status: 500 }
    );
  }
}
