import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth';
import { handleError, paginatedResponse } from '@/lib/api/response';
import { listRefundsForAdmin } from '@/lib/services/admin/issue';
import { parseAdminListParams } from '../../_lib/middleware';
import { UserRole } from '@/src/lib/auth/types';

/**
 * GET /api/admin/issues/refunds - List refund requests with filters
 * Query params:
 *   - page: number (default: 1)
 *   - limit: number (default: 20)
 *   - status: string (PENDING, PROCESSING, SUCCEEDED, FAILED)
 *   - from: ISO date string (filter by createdAt >= from)
 *   - to: ISO date string (filter by createdAt <= to)
 *   - sortBy: string (not used, defaults to createdAt)
 *   - sortOrder: 'asc' | 'desc' (not used, defaults to desc)
 *
 * Auth: Requires admin role
 */
export async function GET(request: NextRequest) {
  try {
    await requireRole(request, [UserRole.ADMIN]);
    const searchParams = request.nextUrl.searchParams;
    const params = parseAdminListParams(searchParams);

    const from = searchParams.get('from')
      ? new Date(searchParams.get('from')!)
      : undefined;
    const to = searchParams.get('to')
      ? new Date(searchParams.get('to')!)
      : undefined;

    const result = await listRefundsForAdmin({
      ...params,
      status: searchParams.get('status') || undefined,
      from,
      to,
    });

    return paginatedResponse(result.items, result.pagination);
  } catch (error) {
    return handleError(error);
  }
}
