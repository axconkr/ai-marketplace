import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth';
import { UserRole } from '@/src/lib/auth/types';
import { handleError, successResponse, badRequestResponse, notFoundResponse, conflictResponse } from '@/lib/api/response';
import { updateCategory, deleteCategory } from '@/lib/services/admin/settings';

/**
 * GET /api/admin/settings/categories/[id] - Get single category
 *
 * Auth: Requires admin role
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(request, [UserRole.ADMIN]);
    const { id } = params;

    return successResponse({ id });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * PATCH /api/admin/settings/categories/[id] - Update category
 * Body: Partial<{ name, slug, description, parent_id, sort_order, is_active }>
 *
 * Auth: Requires admin role
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(request, [UserRole.ADMIN]);
    const { id } = params;
    const body = await request.json();

    const result = await updateCategory(id, {
      name: body.name,
      slug: body.slug,
      description: body.description,
      parent_id: body.parent_id,
      sort_order: body.sort_order,
      is_active: body.is_active,
    });

    if (!result.success) {
      if (result.message.includes('not found')) {
        return notFoundResponse('Category');
      }
      return badRequestResponse(result.message);
    }

    return successResponse({
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/admin/settings/categories/[id] - Soft delete category
 *
 * Auth: Requires admin role
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(request, [UserRole.ADMIN]);
    const { id } = params;

    const result = await deleteCategory(id);

    if (!result.success) {
      if (result.message.includes('not found')) {
        return notFoundResponse('Category');
      }
      if (result.message.includes('Cannot delete')) {
        return conflictResponse(result.message);
      }
      return badRequestResponse(result.message);
    }

    return successResponse({
      message: result.message,
    });
  } catch (error) {
    return handleError(error);
  }
}
