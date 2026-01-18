import { NextRequest, NextResponse } from 'next/server';
import { voteReview } from '@/lib/services/review';
import { requireAuth } from '@/lib/auth';

/**
 * POST /api/reviews/[id]/vote - Vote on review helpfulness
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const user = await requireAuth(req);

    const body = await req.json();
    const { helpful } = body;

    if (typeof helpful !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing or invalid field: helpful (must be boolean)' },
        { status: 400 }
      );
    }

    const vote = await voteReview({
      reviewId: params.id,
      userId: user.userId,
      helpful,
    });

    return NextResponse.json(vote);
  } catch (error: any) {
    console.error('Error voting on review:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to vote on review' },
      { status: 400 }
    );
  }
}
