import { NextRequest, NextResponse } from 'next/server';
import { flagReview } from '@/lib/services/review';
import { requireAuth } from '@/lib/auth';

/**
 * POST /api/reviews/[id]/report - Report review as inappropriate
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const user = await requireAuth(req);

    const body = await req.json();
    const { reason } = body;

    if (!reason) {
      return NextResponse.json(
        { error: 'Missing required field: reason' },
        { status: 400 }
      );
    }

    const flagged = await flagReview({
      reviewId: params.id,
      userId: user.userId,
      reason,
    });

    return NextResponse.json(flagged);
  } catch (error: any) {
    console.error('Error reporting review:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to report review' },
      { status: 400 }
    );
  }
}
