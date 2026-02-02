import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getCurrentMonthEarnings, getPendingPayouts } from '@/lib/services/verifier-earnings';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    
    if (user.role !== 'verifier' && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only verifiers can access earnings' },
        { status: 403 }
      );
    }

    const verifierId = user.userId;
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
