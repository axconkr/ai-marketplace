import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { UserRole } from '@/src/lib/auth/types';
import { handleError, successResponse } from '@/lib/api/response';
import { assignExpert } from '@/lib/services/admin/verification';

/**
 * POST /api/admin/verifications/experts/[id] - Assign expert to expert review
 * Note: [id] is the expertReviewId, not verificationId
 * Body: { expert_id: string }
 * Auth: Requires admin role
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(request, [UserRole.ADMIN]);
    const body = await request.json();
    const { expert_id } = body;

    if (!expert_id) {
      return NextResponse.json(
        { error: 'expert_id is required' },
        { status: 400 }
      );
    }

    const result = await assignExpert(params.id, expert_id);

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
