import { NextRequest, NextResponse } from 'next/server';
import { getEarningsBreakdown } from '@/lib/services/verifier-earnings';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const verifierId = searchParams.get('verifierId');
    const period = searchParams.get('period'); // 'current', 'last', 'all'

    if (!verifierId) {
      return NextResponse.json(
        { error: 'Verifier ID required' },
        { status: 400 }
      );
    }

    let periodStart: Date | undefined;
    let periodEnd: Date | undefined;

    if (period === 'current') {
      periodStart = startOfMonth(new Date());
      periodEnd = endOfMonth(new Date());
    } else if (period === 'last') {
      periodStart = startOfMonth(subMonths(new Date(), 1));
      periodEnd = endOfMonth(subMonths(new Date(), 1));
    }
    // 'all' means no period filter

    const breakdown = await getEarningsBreakdown(
      verifierId,
      periodStart,
      periodEnd
    );

    return NextResponse.json({
      breakdown,
      period: period || 'all',
      periodStart,
      periodEnd,
    });
  } catch (error) {
    console.error('Error fetching earnings breakdown:', error);
    return NextResponse.json(
      { error: 'Failed to fetch breakdown' },
      { status: 500 }
    );
  }
}
