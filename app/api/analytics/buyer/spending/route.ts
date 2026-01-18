/**
 * Buyer Spending History API
 * GET /api/analytics/buyer/spending
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';

    // Calculate date range
    const now = new Date();
    const startDate = new Date();

    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Get orders for the period
    const orders = await prisma.order.findMany({
      where: {
        buyer_id: authUser.userId,
        createdAt: {
          gte: startDate,
        },
        status: 'COMPLETED',
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by date
    const spendingByDate = orders.reduce((acc, order) => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += order.amount;
      return acc;
    }, {} as Record<string, number>);

    // Convert to array format
    const data = Object.entries(spendingByDate).map(([date, amount]) => ({
      date,
      amount,
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Buyer spending error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch spending data' },
      { status: 500 }
    );
  }
}
