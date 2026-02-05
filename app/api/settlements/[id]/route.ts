import { NextRequest, NextResponse } from 'next/server';
import { getSettlementDetails } from '@/lib/services/settlement';
import { verifyToken } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('accessToken')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let userId: string;
    let userRole: string;
    
    try {
      const payload = await verifyToken(token);
      userId = payload.userId;
      userRole = payload.role;
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
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
