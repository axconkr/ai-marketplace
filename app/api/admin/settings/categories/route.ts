import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth';
import { handleError, successResponse, badRequestResponse, createdResponse, paginatedResponse } from '@/lib/api/response';
import { listCategories, createCategory } from '@/lib/services/admin/settings';
import { parseAdminListParams } from '../../_lib/middleware';

/**
 * GET /api/admin/settings/categories - List categories
 *
 * Query params:
 *   - page: number (default: 1)
 *   - limit: number (default: 20)
 *   - search: string
 *   - parent_id: string | null
 *   - sortBy: string
 *   - sortOrder: 'asc' | 'desc'
 *
 * Auth: Requires admin role
 */
export async function GET(request: NextRequest) {
  try {
    await requireRole(request, ['admin']);
    const searchParams = request.nextUrl.searchParams;
    const params = parseAdminListParams(searchParams);

    const parentId = searchParams.get('parent_id');

    const result = await listCategories({
      ...params,
      parent_id: parentId !== null ? parentId : undefined,
    });

    return paginatedResponse(result.items, result.pagination);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/admin/settings/categories - Create category
 * Body: { name: string; slug: string; description?: string; parent_id?: string; sort_order?: number }
 *
 * Auth: Requires admin role
 */
export async function POST(request: NextRequest) {
  try {
    await requireRole(request, ['admin']);
    const body = await request.json();
    const { name, slug, description, parent_id, sort_order } = body;

    if (!name || !slug) {
      return badRequestResponse('Missing required fields: name, slug');
    }

    const result = await createCategory({
      name,
      slug,
      description,
      parent_id,
      sort_order,
    });

    if (!result.success) {
      return badRequestResponse(result.message);
    }

    return createdResponse(result.data);
  } catch (error) {
    return handleError(error);
  }
}
