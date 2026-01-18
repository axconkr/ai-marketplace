import { NextRequest, NextResponse } from 'next/server';
import { createReview, getProductReviews } from '@/lib/services/review';
import { requireAuth } from '@/lib/auth';

/**
 * POST /api/reviews - Create a new review
 */
export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const user = await requireAuth(req);

    const body = await req.json();
    const { orderId, rating, title, comment, images } = body;

    // Validate required fields
    if (!orderId || !rating || !comment) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, rating, comment' },
        { status: 400 }
      );
    }

    const review = await createReview({
      orderId,
      userId: user.userId,
      rating,
      title,
      comment,
      images: images || [],
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error: any) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create review' },
      { status: 400 }
    );
  }
}

/**
 * GET /api/reviews?productId=xxx&sortBy=recent&filterRating=5&page=1
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const sortBy = searchParams.get('sortBy') as 'recent' | 'helpful' | 'rating' | undefined;
    const filterRating = searchParams.get('filterRating');
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');

    if (!productId) {
      return NextResponse.json(
        { error: 'Missing required parameter: productId' },
        { status: 400 }
      );
    }

    const result = await getProductReviews({
      productId,
      sortBy,
      filterRating: filterRating ? parseInt(filterRating) : undefined,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
