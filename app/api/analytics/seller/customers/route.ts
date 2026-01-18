import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { getCustomerAnalytics } from '@/lib/services/analytics';

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const period = (searchParams.get('period') || '30d') as '7d' | '30d' | '90d' | '1y';

    const customerStats = await getCustomerAnalytics(user.id, period);

    return NextResponse.json(customerStats);
  } catch (error) {
    console.error('Customer analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer analytics' },
      { status: 500 }
    );
  }
}
