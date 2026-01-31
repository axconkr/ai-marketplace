import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

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
    const { startDate, endDate } = getPeriodDates(period);

    const orders = await prisma.order.findMany({
      where: {
        product: { seller_id: user.userId },
        createdAt: { gte: startDate, lte: endDate }
      },
      select: {
        status: true,
        createdAt: true
      }
    });

    const statusCounts = orders.reduce((acc, order) => {
      const status = order.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const data = [
      { name: 'PENDING', value: statusCounts['PENDING'] || 0, color: '#FCD34D' },
      { name: 'PAID', value: statusCounts['PAID'] || 0, color: '#60A5FA' },
      { name: 'COMPLETED', value: statusCounts['COMPLETED'] || 0, color: '#34D399' },
      { name: 'REFUNDED', value: statusCounts['REFUNDED'] || 0, color: '#F87171' },
      { name: 'CANCELLED', value: statusCounts['CANCELLED'] || 0, color: '#9CA3AF' },
      { name: 'FAILED', value: statusCounts['FAILED'] || 0, color: '#EF4444' },
    ].filter(item => item.value > 0);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Order status analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order status analytics' },
      { status: 500 }
    );
  }
}
