/**
 * PATCH /api/verifications/[id]/start - Start verification review (verifier)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { startVerificationReview } from '@/lib/services/verification/review';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const verificationId = params.id;

    // Only verifiers and admins can start reviews
    const user = await requireRole(request, ['verifier', 'admin']);

    const verification = await startVerificationReview(verificationId, user.userId);

    return NextResponse.json({
      verification,
      message: 'Verification review started',
    });
  } catch (error: any) {
    console.error('Error starting verification review:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to start verification review' },
      { status: 500 }
    );
  }
}
