import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { UserRole } from '@/src/lib/auth/types';
import { handleError, paginatedResponse } from '@/lib/api/response';
import { listProductsForAdmin } from '@/lib/services/admin/product';
import { parseAdminListParams } from '../_lib/middleware';

/**
 * GET /api/admin/products - List all products with admin filters
 * Query params:
 *   - page: number (default: 1)
 *   - limit: number (default: 20)
 *   - status: string (draft, pending, approved, rejected, suspended)
 *   - category: string
 *   - seller_id: string
 *   - search: string (search in product name/description)
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

    const result = await listProductsForAdmin({
      ...params,
      seller_id: searchParams.get('seller_id') || undefined,
      category: searchParams.get('category') || undefined,
    });

    return paginatedResponse(result.items, result.pagination);
  } catch (error) {
    return handleError(error);
  }
}
