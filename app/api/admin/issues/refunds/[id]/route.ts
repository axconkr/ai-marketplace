import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth';
import {
  handleError,
  successResponse,
  notFoundResponse,
  badRequestResponse,
} from '@/lib/api/response';
import {
  listRefundsForAdmin,
  approveRefund,
  rejectRefund,
} from '@/lib/services/admin/issue';
import { UserRole } from '@/src/lib/auth/types';

/**
 * GET /api/admin/issues/refunds/[id] - Get refund details
 * Auth: Requires admin role
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole(request, [UserRole.ADMIN]);

    const result = await listRefundsForAdmin({
      page: 1,
      limit: 1,
    });

    const refund = result.items.find((r) => r.id === params.id);

    if (!refund) {
      return notFoundResponse('Refund');
    }

    return successResponse(refund);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/admin/issues/refunds/[id] - Approve or reject refund
 * Body:
 *   - action: 'approve' | 'reject'
 *   - reason?: string (required if action='reject')
 *
 * Auth: Requires admin role
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole(request, [UserRole.ADMIN]);
    const body = await request.json();

    const { action, reason } = body;

    if (!action || !['approve', 'reject'].includes(action)) {
      return badRequestResponse('Invalid action. Must be "approve" or "reject"');
    }

    if (action === 'reject' && !reason) {
      return badRequestResponse('Reason is required when rejecting a refund');
    }

    let result;

    if (action === 'approve') {
      result = await approveRefund(params.id, user.userId);
    } else {
      result = await rejectRefund(params.id, user.userId, reason);
    }

    if (!result.success) {
      return badRequestResponse(result.message);
    }

    return successResponse(result.data);
  } catch (error) {
    return handleError(error);
  }
}
