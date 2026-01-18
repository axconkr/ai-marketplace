import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/reviews/seller - Get reviews for seller's products
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const { searchParams } = new URL(req.url);

    // Query parameters
    const rating = searchParams.get('rating');
    const productId = searchParams.get('productId');
    const responseStatus = searchParams.get('responseStatus');
    const sortBy = searchParams.get('sortBy') || 'date';
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build where clause
    const where: any = {
      product: {
        seller_id: user.userId,
      },
      status: 'PUBLISHED',
    };

    // Filter by rating
    if (rating && rating !== 'all') {
      where.rating = parseInt(rating);
    }

    // Filter by product
    if (productId && productId !== 'all') {
      where.product_id = productId;
    }

    // Filter by response status
    if (responseStatus === 'answered') {
      where.seller_reply = { not: null };
    } else if (responseStatus === 'unanswered') {
      where.seller_reply = null;
    }

    // Search by customer name or review content
    if (search) {
      where.OR = [
        { comment: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Determine sorting
    let orderBy: any = { created_at: 'desc' }; // Default: date
    if (sortBy === 'rating') {
      orderBy = { rating: 'desc' };
    } else if (sortBy === 'helpful') {
      orderBy = { helpful_count: 'desc' };
    }

    // Fetch reviews with pagination
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.review.count({ where }),
    ]);

    return NextResponse.json({
      reviews,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    });
  } catch (error: any) {
    console.error('Error fetching seller reviews:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
