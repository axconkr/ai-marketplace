import { NextRequest, NextResponse } from 'next/server';
import { getCurrentMonthEarnings, getPendingPayouts } from '@/lib/services/verifier-earnings';

export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication
    // const user = await requireAuth(request);
    // if (user.role !== 'verifier') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    // }

    // For now, get verifier ID from query params
    const { searchParams } = new URL(request.url);
    const verifierId = searchParams.get('verifierId');

    if (!verifierId) {
      return NextResponse.json(
        { error: 'Verifier ID required' },
        { status: 400 }
      );
    }

    // Get current month earnings
    const earnings = await getCurrentMonthEarnings(verifierId);

    // Get pending payouts
    const pending = await getPendingPayouts(verifierId);

    return NextResponse.json({
      currentMonth: {
        totalEarnings: earnings.totalEarnings,
        verificationCount: earnings.verificationCount,
        periodStart: earnings.periodStart,
        periodEnd: earnings.periodEnd,
        averagePerVerification:
          earnings.verificationCount > 0
            ? Math.round(earnings.totalEarnings / earnings.verificationCount)
            : 0,
      },
      pending: {
        totalAmount: pending.totalPending,
        count: pending.count,
      },
    });
  } catch (error) {
    console.error('Error fetching current earnings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch earnings' },
      { status: 500 }
    );
  }
}
