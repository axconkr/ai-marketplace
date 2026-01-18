import { NextRequest, NextResponse } from 'next/server';
import { getReview, updateReview, deleteReview } from '@/lib/services/review';
import { requireAuth } from '@/lib/auth';

/**
 * GET /api/reviews/[id] - Get review details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const review = await getReview(params.id);

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json(review);
  } catch (error: any) {
    console.error('Error fetching review:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch review' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/reviews/[id] - Update review (owner only)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const user = await requireAuth(req);

    const body = await req.json();
    const { rating, title, comment, images } = body;

    const updated = await updateReview({
      reviewId: params.id,
      userId: user.userId,
      rating,
      title,
      comment,
      images,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update review' },
      { status: 400 }
    );
  }
}

/**
 * DELETE /api/reviews/[id] - Delete review (owner or admin)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const user = await requireAuth(req);

    const isAdmin = user.role === 'admin';

    const deleted = await deleteReview(params.id, user.userId, isAdmin);

    return NextResponse.json(deleted);
  } catch (error: any) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete review' },
      { status: 400 }
    );
  }
}
