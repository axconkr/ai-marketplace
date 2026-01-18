import { NextRequest, NextResponse } from 'next/server';
import { getVerifierSettlementHistory } from '@/lib/services/verifier-earnings';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const verifierId = searchParams.get('verifierId');
    const limit = parseInt(searchParams.get('limit') || '12', 10);

    if (!verifierId) {
      return NextResponse.json(
        { error: 'Verifier ID required' },
        { status: 400 }
      );
    }

    const settlements = await getVerifierSettlementHistory(verifierId, limit);

    return NextResponse.json({
      settlements: settlements.map((settlement) => ({
        id: settlement.id,
        periodStart: settlement.period_start,
        periodEnd: settlement.period_end,
        totalEarnings: settlement.verification_earnings,
        verificationCount: settlement.verification_count,
        status: settlement.status,
        payoutDate: settlement.payout_date,
        payoutMethod: settlement.payout_method,
        currency: settlement.currency,
        verifications: settlement.verifierPayouts.map((payout) => ({
          id: payout.id,
          amount: payout.amount,
          level: payout.verification.level,
          completedAt: payout.verification.completed_at,
        })),
      })),
      total: settlements.length,
    });
  } catch (error) {
    console.error('Error fetching settlement history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settlements' },
      { status: 500 }
    );
  }
}
