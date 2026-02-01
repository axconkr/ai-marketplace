import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { UserRole } from '@/src/lib/auth/types';
import { handleError, paginatedResponse } from '@/lib/api/response';
import { listVerificationsForAdmin } from '@/lib/services/admin/verification';
import { parseAdminListParams } from '../_lib/middleware';

/**
 * GET /api/admin/verifications - List all verifications with filters
 * Query params:
 *   - page: number (default: 1)
 *   - limit: number (default: 20)
 *   - status: string (PENDING, ASSIGNED, REVIEWED, COMPLETED, REJECTED)
 *   - level: number (verification level)
 *   - search: string (search in product name)
 *   - sortBy: string
 *   - sortOrder: 'asc' | 'desc'
 *
 * Auth: Requires admin role
 */
export async function GET(request: NextRequest) {
  try {
    await requireRole(request, [UserRole.ADMIN]);
    const searchParams = request.nextUrl.searchParams;
    const params = parseAdminListParams(searchParams);

    const level = searchParams.get('level');

    const result = await listVerificationsForAdmin({
      ...params,
      level: level ? parseInt(level) : undefined,
    });

    return paginatedResponse(result.items, result.pagination);
  } catch (error) {
    return handleError(error);
  }
}
