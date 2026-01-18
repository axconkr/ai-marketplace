import { NextRequest, NextResponse } from 'next/server';
import { getSettlementSummary } from '@/lib/services/settlement';

/**
 * GET /api/settlements/summary - Get settlement summary statistics
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Admins see all, sellers see only their own
    const sellerId = userRole === 'admin' ? undefined : userId;

    const summary = await getSettlementSummary(sellerId);

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error fetching settlement summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settlement summary' },
      { status: 500 }
    );
  }
}
