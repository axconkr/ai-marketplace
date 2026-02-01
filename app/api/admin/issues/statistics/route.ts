import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth';
import { handleError, successResponse } from '@/lib/api/response';
import { getIssueStatistics } from '@/lib/services/admin/issue';
import { UserRole } from '@/src/lib/auth/types';

/**
 * GET /api/admin/issues/statistics - Get issue statistics
 * Returns:
 *   - pendingRefunds: count of PENDING refunds
 *   - flaggedReviews: count of flagged reviews
 *   - resolvedThisWeek: count of resolved refunds in last 7 days
 *
 * Auth: Requires admin role
 */
export async function GET(request: NextRequest) {
  try {
    await requireRole(request, [UserRole.ADMIN]);

    const stats = await getIssueStatistics();

    return successResponse(stats);
  } catch (error) {
    return handleError(error);
  }
}
