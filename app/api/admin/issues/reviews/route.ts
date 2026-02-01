import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth';
import { handleError, paginatedResponse } from '@/lib/api/response';
import { listFlaggedReviews } from '@/lib/services/admin/issue';
import { parseAdminListParams } from '../../_lib/middleware';
import { UserRole } from '@/src/lib/auth/types';

/**
 * GET /api/admin/issues/reviews - List flagged reviews
 * Query params:
 *   - page: number (default: 1)
 *   - limit: number (default: 20)
 *   - status: string (not used)
 *   - sortBy: string (not used, defaults to created_at)
 *   - sortOrder: 'asc' | 'desc' (not used, defaults to desc)
 *
 * Auth: Requires admin role
 */
export async function GET(request: NextRequest) {
  try {
    await requireRole(request, [UserRole.ADMIN]);
    const searchParams = request.nextUrl.searchParams;
    const params = parseAdminListParams(searchParams);

    const result = await listFlaggedReviews(params);

    return paginatedResponse(result.items, result.pagination);
  } catch (error) {
    return handleError(error);
  }
}
