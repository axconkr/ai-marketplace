import { NextRequest, NextResponse } from 'next/server';
import { getSettlementDetails } from '@/lib/services/settlement';

/**
 * GET /api/settlements/[id] - Get settlement details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settlement = await getSettlementDetails(params.id);

    if (!settlement) {
      return NextResponse.json({ error: 'Settlement not found' }, { status: 404 });
    }

    // Check authorization - seller can only see own settlements
    if (userRole !== 'admin' && settlement.seller_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(settlement);
  } catch (error) {
    console.error('Error fetching settlement:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settlement' },
      { status: 500 }
    );
  }
}
