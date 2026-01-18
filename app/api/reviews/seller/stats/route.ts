import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/reviews/seller/stats - Get review statistics for seller
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);

    // Get all reviews for seller's products
    const reviews = await prisma.review.findMany({
      where: {
        product: {
          seller_id: user.userId,
        },
        status: 'PUBLISHED',
      },
      select: {
        id: true,
        rating: true,
        seller_reply: true,
        seller_replied_at: true,
        created_at: true,
      },
    });

    const totalReviews = reviews.length;

    // Calculate average rating
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    // Calculate rating distribution
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      distribution[r.rating] = (distribution[r.rating] || 0) + 1;
    });

    // Calculate recent reviews count (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentReviewsCount = reviews.filter(
      (r) => new Date(r.created_at) >= thirtyDaysAgo
    ).length;

    // Calculate response rate
    const repliedReviews = reviews.filter((r) => r.seller_reply !== null);
    const responseRate = totalReviews > 0 ? (repliedReviews.length / totalReviews) * 100 : 0;

    // Calculate average response time (in hours)
    let totalResponseTime = 0;
    let responseTimeCount = 0;

    repliedReviews.forEach((r) => {
      if (r.seller_replied_at) {
        const createdAt = new Date(r.created_at).getTime();
        const repliedAt = new Date(r.seller_replied_at).getTime();
        const diffHours = (repliedAt - createdAt) / (1000 * 60 * 60);
        totalResponseTime += diffHours;
        responseTimeCount++;
      }
    });

    const averageResponseTime =
      responseTimeCount > 0 ? totalResponseTime / responseTimeCount : 0;

    return NextResponse.json({
      averageRating,
      totalReviews,
      distribution,
      recentReviewsCount,
      responseRate,
      averageResponseTime,
      unansweredCount: totalReviews - repliedReviews.length,
    });
  } catch (error: any) {
    console.error('Error fetching seller review stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
