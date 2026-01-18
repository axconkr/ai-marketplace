import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { getPendingActions } from '@/lib/services/analytics';

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const actions = await getPendingActions(user.id);

    return NextResponse.json(actions);
  } catch (error) {
    console.error('Pending actions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending actions' },
      { status: 500 }
    );
  }
}
