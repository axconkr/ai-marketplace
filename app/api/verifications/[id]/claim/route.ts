/**
 * POST /api/verifications/[id]/claim - Claim verification (verifier self-assign)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { claimVerification } from '@/lib/services/verification/claim';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const verificationId = params.id;

    // Only verifiers and admins can claim verifications
    const user = await requireRole(request, ['verifier', 'admin']);

    const verification = await claimVerification(verificationId, user.userId);

    return NextResponse.json({
      verification,
      message: 'Verification claimed successfully',
    });
  } catch (error: any) {
    console.error('Error claiming verification:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to claim verification' },
      { status: 500 }
    );
  }
}
