import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth';
import {
  handleError,
  successResponse,
  notFoundResponse,
  badRequestResponse,
} from '@/lib/api/response';
import {
  listFlaggedReviews,
  resolveReviewFlag,
} from '@/lib/services/admin/issue';
import { UserRole } from '@/src/lib/auth/types';

/**
 * GET /api/admin/issues/reviews/[id] - Get flagged review details
 * Auth: Requires admin role
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole(request, [UserRole.ADMIN]);

    const result = await listFlaggedReviews({
      page: 1,
      limit: 1,
    });

    const review = result.items.find((r) => r.id === params.id);

    if (!review) {
      return notFoundResponse('Review');
    }

    return successResponse(review);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/admin/issues/reviews/[id] - Resolve review flag
 * Body:
 *   - action: 'approve' | 'delete' | 'warn_user'
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

    const { action } = body;

    if (!action || !['approve', 'delete', 'warn_user'].includes(action)) {
      return badRequestResponse(
        'Invalid action. Must be "approve", "delete", or "warn_user"'
      );
    }

    const result = await resolveReviewFlag(
      params.id,
      action as 'approve' | 'delete' | 'warn_user',
      user.userId
    );

    if (!result.success) {
      return badRequestResponse(result.message);
    }

    return successResponse(result.data);
  } catch (error) {
    return handleError(error);
  }
}
