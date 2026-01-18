/**
 * POST /api/verifications/[id]/submit - Submit verification review (verifier)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { submitVerificationReview } from '@/lib/services/verification/review';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const verificationId = params.id;

    // Only verifiers and admins can submit reviews
    const user = await requireRole(request, ['verifier', 'admin']);

    const body = await request.json();

    // Validate review data
    const { approved, score, comments, badges, improvements } = body;

    if (approved === undefined || score === undefined || !comments) {
      return NextResponse.json(
        { error: 'Review data incomplete (approved, score, comments required)' },
        { status: 400 }
      );
    }

    if (typeof score !== 'number' || score < 0 || score > 100) {
      return NextResponse.json(
        { error: 'Score must be a number between 0 and 100' },
        { status: 400 }
      );
    }

    const review = {
      approved,
      score,
      comments,
      badges: badges || [],
      improvements: improvements || [],
    };

    const verification = await submitVerificationReview({
      verificationId,
      verifierId: user.userId,
      review: review as any,
    });

    return NextResponse.json({
      verification,
      message: `Verification ${approved ? 'approved' : 'rejected'} successfully`,
    });
  } catch (error: any) {
    console.error('Error submitting verification review:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit verification review' },
      { status: 500 }
    );
  }
}
