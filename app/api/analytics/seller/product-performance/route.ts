import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { subDays, startOfDay, endOfDay } from 'date-fns';

type Period = '7d' | '30d' | '90d' | '1y';

function getPeriodDates(period: Period) {
  const endDate = endOfDay(new Date());
  let startDate: Date;

  switch (period) {
    case '7d':
      startDate = startOfDay(subDays(endDate, 7));
      break;
    case '30d':
      startDate = startOfDay(subDays(endDate, 30));
      break;
    case '90d':
      startDate = startOfDay(subDays(endDate, 90));
      break;
    case '1y':
      startDate = startOfDay(subDays(endDate, 365));
      break;
    default:
      startDate = startOfDay(subDays(endDate, 30));
  }

  return { startDate, endDate };
}

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
    const period = (searchParams.get('period') || '30d') as Period;
    const limit = parseInt(searchParams.get('limit') || '5');
    const { startDate, endDate } = getPeriodDates(period);

    const products = await prisma.product.findMany({
      where: { seller_id: user.userId },
      include: {
        orders: {
          where: {
            paid_at: { gte: startDate, lte: endDate },
            status: { in: ['PAID', 'COMPLETED'] }
          }
        },
        reviews: {
          select: { rating: true }
        }
      }
    });

    const productPerformance = products.map(product => {
      const revenue = product.orders.reduce((sum, o) => sum + o.seller_amount, 0);
      const orderCount = product.orders.length;
      const views = product.download_count || 0;
      const conversionRate = views > 0 ? (orderCount / views) * 100 : 0;
      const avgRating = product.reviews.length > 0
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
        : 0;

      return {
        id: product.id,
        name: product.name,
        revenue,
        orders: orderCount,
        views,
        conversionRate: Math.round(conversionRate * 100) / 100,
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: product.reviews.length,
        status: product.status
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);

    return NextResponse.json(productPerformance);
  } catch (error) {
    console.error('Product performance analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product performance' },
      { status: 500 }
    );
  }
}
