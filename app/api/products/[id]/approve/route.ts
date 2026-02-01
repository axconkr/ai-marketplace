/**
 * Product Approval API Route
 * PATCH /api/products/[id]/approve - Approve product (pending -> active)
 */

import { NextRequest } from 'next/server';
import { requireRole, isAdmin } from '@/lib/auth';
import { UserRole } from '@/src/lib/auth/types';
import {
  handleError,
  successResponse,
  notFoundResponse,
  badRequestResponse,
} from '@/lib/api/response';
import { ProductIdSchema } from '@/lib/validations/product';
import { getProductById, approveProduct } from '@/lib/services/product';
import { notifyProductApproved } from '@/lib/services/notification-service';

interface RouteContext {
  params: { id: string };
}

/**
 * PATCH /api/products/[id]/approve
 * Approve product (pending -> active)
 *
 * @auth Required - Admin only
 * @param id - Product UUID
 * @returns Updated product with status 'active'
 */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    // Validate product ID
    const { id } = ProductIdSchema.parse(params);

    // Require admin role
    const user = await requireRole(request, [UserRole.ADMIN]);

    // Get existing product
    const existingProduct = await getProductById(id, true);

    if (!existingProduct) {
      return notFoundResponse('Product');
    }

    try {
      const product = await approveProduct(id);

      await notifyProductApproved(id).catch((err) =>
        console.error('Failed to notify seller:', err)
      );

      return successResponse({
        message: 'Product approved successfully',
        product,
      });
    } catch (error) {
      if (error instanceof Error) {
        return badRequestResponse(error.message);
      }
      throw error;
    }
  } catch (error) {
    return handleError(error);
  }
}
