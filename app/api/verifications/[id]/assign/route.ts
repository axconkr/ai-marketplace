/**
 * PATCH /api/verifications/[id]/assign - Assign verification to verifier (admin)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { assignLevel1Verification } from '@/lib/services/verification/level1';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const verificationId = params.id;

    // Only admins can assign verifications
    const user = await requireRole(request, ['admin']);

    const body = await request.json();
    const { verifierId } = body;

    if (!verifierId) {
      return NextResponse.json(
        { error: 'Verifier ID is required' },
        { status: 400 }
      );
    }

    const verification = await assignLevel1Verification(verificationId, verifierId);

    return NextResponse.json({
      verification,
      message: 'Verification assigned successfully',
    });
  } catch (error: any) {
    console.error('Error assigning verification:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to assign verification' },
      { status: 500 }
    );
  }
}
