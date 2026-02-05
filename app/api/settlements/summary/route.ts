import { NextRequest, NextResponse } from 'next/server';
import { getSettlementSummary } from '@/lib/services/settlement';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
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
