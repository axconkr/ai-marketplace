/**
 * Product Approval API Route
 * PATCH /api/products/[id]/approve - Approve product (pending -> active)
 */

import { NextRequest } from 'next/server';
import { requireRole, isAdmin } from '@/lib/auth';
import {
  handleError,
  successResponse,
  notFoundResponse,
  badRequestResponse,
} from '@/lib/api/response';
import { ProductIdSchema } from '@/lib/validations/product';
import { getProductById, approveProduct } from '@/lib/services/product';

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
    const user = await requireRole(request, ['admin']);

    // Get existing product
    const existingProduct = await getProductById(id, true);

    if (!existingProduct) {
      return notFoundResponse('Product');
    }

    // Approve product (pending -> active)
    try {
      const product = await approveProduct(id);

      // TODO: Send notification to seller
      // await notifySeller('product_approved', product);

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
