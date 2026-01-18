import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { getSellerAnalytics } from '@/lib/services/analytics';

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

    const analytics = await getSellerAnalytics(user.id, period);

    const total = analytics.timeline.reduce((sum, item) => sum + item.revenue, 0);
    const average = analytics.timeline.length > 0
      ? total / analytics.timeline.length
      : 0;

    return NextResponse.json({
      data: analytics.timeline,
      total,
      average,
      growth: analytics.summary.revenueChange
    });
  } catch (error) {
    console.error('Revenue analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue data' },
      { status: 500 }
    );
  }
}
