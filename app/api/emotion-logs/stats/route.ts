import { getEmotionStats } from '@/lib/emotion-logger';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/emotion-logs/stats
 * Get emotion statistics for a UID
 * Query params:
 *   - uid: card_uid (required)
 *   - days: lookback period in days (default 30)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');
    const days = parseInt(searchParams.get('days') || '30', 10);

    if (!uid) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Missing uid parameter',
        },
        { status: 400 }
      );
    }

    const stats = await getEmotionStats(uid, days);

    return NextResponse.json(
      {
        status: 'success',
        data: stats,
        uid,
        days,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to fetch emotion stats',
      },
      { status: 500 }
    );
  }
}
