import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { UserRole } from '@/src/lib/auth/types';
import { handleError, successResponse } from '@/lib/api/response';
import {
  getVerificationDetailsForAdmin,
  assignVerifier,
  approveVerification,
  rejectVerification,
} from '@/lib/services/admin/verification';

/**
 * GET /api/admin/verifications/[id] - Get verification details
 * Auth: Requires admin role
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(request, [UserRole.ADMIN]);
    const verification = await getVerificationDetailsForAdmin(params.id);

    if (!verification) {
      return NextResponse.json(
        { error: 'Verification not found' },
        { status: 404 }
      );
    }

    return successResponse(verification);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/admin/verifications/[id] - Assign verifier
 * Body: { verifier_id: string }
 * Auth: Requires admin role
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(request, [UserRole.ADMIN]);
    const body = await request.json();
    const { verifier_id } = body;

    if (!verifier_id) {
      return NextResponse.json(
        { error: 'verifier_id is required' },
        { status: 400 }
      );
    }

    const result = await assignVerifier(params.id, verifier_id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return successResponse(result.data);
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(request, [UserRole.ADMIN]);
    const body = await request.json();
    const { action, comment, reason } = body;

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'action must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    let result;
    if (action === 'approve') {
      result = await approveVerification(params.id, comment);
    } else {
      if (!reason) {
        return NextResponse.json(
          { error: 'reason is required for rejection' },
          { status: 400 }
        );
      }
      result = await rejectVerification(params.id, reason);
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return successResponse({ message: result.message });
  } catch (error) {
    return handleError(error);
  }
}
