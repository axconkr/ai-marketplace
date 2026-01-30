/**
 * PATCH /api/verifications/[id]/start - Start verification review (verifier)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { UserRole } from '@/src/lib/auth/types';
import { startVerificationReview } from '@/lib/services/verification/review';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const verificationId = params.id;

    // Only verifiers and admins can start reviews
    const user = await requireRole(request, [UserRole.VERIFIER, UserRole.ADMIN]);

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
