/**
 * POST /api/verifications/[id]/cancel - Cancel verification
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { cancelVerification } from '@/lib/services/verification/review';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const verificationId = params.id;

    // Authenticate user - owners and admins can cancel
    const user = await requireAuth(request);

    const isAdmin = user.role === 'admin';

    const verification = await cancelVerification(verificationId, user.userId, isAdmin);

    return NextResponse.json({
      verification,
      message: 'Verification cancelled successfully',
    });
  } catch (error: any) {
    console.error('Error cancelling verification:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel verification' },
      { status: 500 }
    );
  }
}
