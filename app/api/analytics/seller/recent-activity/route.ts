import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type ActivityType = 'order' | 'review' | 'verification' | 'settlement' | 'product';

interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
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
    const limit = parseInt(searchParams.get('limit') || '10');

    const [recentOrders, recentReviews, recentVerifications, recentSettlements] = await Promise.all([
      prisma.order.findMany({
        where: { product: { seller_id: user.userId } },
        include: {
          product: { select: { name: true } },
          buyer: { select: { name: true, email: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      }),

      prisma.review.findMany({
        where: { product: { seller_id: user.userId } },
        include: {
          product: { select: { name: true } },
          user: { select: { name: true } }
        },
        orderBy: { created_at: 'desc' },
        take: limit
      }),

      prisma.verification.findMany({
        where: { product: { seller_id: user.userId } },
        include: {
          product: { select: { name: true } }
        },
        orderBy: { requested_at: 'desc' },
        take: limit
      }),

      prisma.settlement.findMany({
        where: { seller_id: user.userId },
        orderBy: { createdAt: 'desc' },
        take: limit
      })
    ]);

    const activities: Activity[] = [];

    recentOrders.forEach(order => {
      activities.push({
        id: order.id,
        type: 'order',
        title: `새 주문: ${order.product.name}`,
        description: `${order.buyer.name || order.buyer.email}님이 주문 (${order.status})`,
        timestamp: order.createdAt,
        metadata: { amount: order.amount, status: order.status }
      });
    });

    recentReviews.forEach(review => {
      activities.push({
        id: review.id,
        type: 'review',
        title: `새 리뷰: ${review.product.name}`,
        description: `${review.user.name || '익명'}님이 ${review.rating}점 평가`,
        timestamp: review.created_at,
        metadata: { rating: review.rating }
      });
    });

    recentVerifications.forEach(verification => {
      activities.push({
        id: verification.id,
        type: 'verification',
        title: `검증 ${verification.status}: ${verification.product.name}`,
        description: `레벨 ${verification.level} 검증`,
        timestamp: verification.requested_at,
        metadata: { level: verification.level, status: verification.status }
      });
    });

    recentSettlements.forEach(settlement => {
      activities.push({
        id: settlement.id,
        type: 'settlement',
        title: `정산 ${settlement.status}`,
        description: `₩${settlement.payout_amount.toLocaleString()} 정산`,
        timestamp: settlement.createdAt,
        metadata: { amount: settlement.payout_amount, status: settlement.status }
      });
    });

    const sortedActivities = activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);

    return NextResponse.json(sortedActivities);
  } catch (error) {
    console.error('Recent activity error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent activity' },
      { status: 500 }
    );
  }
}
