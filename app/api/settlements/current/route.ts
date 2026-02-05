import { NextRequest, NextResponse } from 'next/server';
import { getCurrentMonthEstimate } from '@/lib/services/settlement';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('accessToken')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let userId: string;
    try {
      const payload = await verifyToken(token);
      userId = payload.userId;
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
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
