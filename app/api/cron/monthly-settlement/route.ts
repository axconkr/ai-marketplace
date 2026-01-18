import { NextRequest, NextResponse } from 'next/server';
import { runMonthlySettlement } from '@/scripts/monthly-settlement';

/**
 * GET /api/cron/monthly-settlement - Run monthly settlement cron job
 * This should be called by a cron service (Vercel Cron, AWS EventBridge, etc.)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting monthly settlement cron job...');

    const results = await runMonthlySettlement();

    return NextResponse.json({
      success: true,
      message: 'Monthly settlement completed',
      results,
    });
  } catch (error) {
    console.error('Cron job failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
