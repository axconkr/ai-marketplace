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
    const limit = parseInt(searchParams.get('limit') || '10');

    const analytics = await getSellerAnalytics(user.userId, period);

    return NextResponse.json({
      products: analytics.products.slice(0, limit)
    });
  } catch (error) {
    console.error('Top products error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch top products' },
      { status: 500 }
    );
  }
}
