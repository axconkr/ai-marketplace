import { NextRequest, NextResponse } from 'next/server';
import { getCurrentMonthEstimate } from '@/lib/services/settlement';

/**
 * GET /api/settlements/current - Get current month estimated settlement
 * Sellers can see their estimated earnings for the current month
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const estimate = await getCurrentMonthEstimate(userId);

    return NextResponse.json(estimate);
  } catch (error) {
    console.error('Error fetching current settlement:', error);
    return NextResponse.json(
      { error: 'Failed to fetch current settlement' },
      { status: 500 }
    );
  }
}
