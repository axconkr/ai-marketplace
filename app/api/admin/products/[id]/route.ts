import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth';
import { UserRole } from '@/src/lib/auth/types';
import { handleError, successResponse } from '@/lib/api/response';
import {
  getProductDetailsForAdmin,
  updateProductStatus,
} from '@/lib/services/admin/product';

/**
 * GET /api/admin/products/[id] - Get product details
 * Auth: Requires admin role
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(request, [UserRole.ADMIN]);
    const product = await getProductDetailsForAdmin(params.id);

    if (!product) {
      return handleError(new Error('Product not found'));
    }

    return successResponse(product);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * PATCH /api/admin/products/[id] - Update product status
 * Body:
 *   - status: string (draft, pending, approved, rejected, suspended)
 *   - reason?: string (optional reason for status change)
 * Auth: Requires admin role
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(request, [UserRole.ADMIN]);
    const body = await request.json();
    const { status, reason } = body;

    if (!status) {
      return handleError(new Error('Status is required'));
    }

    const result = await updateProductStatus(params.id, status, reason);

    if (!result.success) {
      return handleError(new Error(result.message));
    }

    return successResponse(result.data);
  } catch (error) {
    return handleError(error);
  }
}
