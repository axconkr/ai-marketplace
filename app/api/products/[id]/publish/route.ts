/**
 * Product Publish API Route
 * PATCH /api/products/[id]/publish - Publish product (draft -> pending)
 */

import { NextRequest } from 'next/server';
import { requireAuth, isOwner } from '@/lib/auth';
import {
  handleError,
  successResponse,
  notFoundResponse,
  forbiddenResponse,
  badRequestResponse,
} from '@/lib/api/response';
import { ProductIdSchema } from '@/lib/validations/product';
import { getProductById, publishProduct } from '@/lib/services/product';

interface RouteContext {
  params: { id: string };
}

/**
 * PATCH /api/products/[id]/publish
 * Publish product (draft -> pending)
 *
 * @auth Required - Seller (owner only)
 * @param id - Product UUID
 * @returns Updated product with status 'pending'
 */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    // Validate product ID
    const { id } = ProductIdSchema.parse(params);

    // Require authentication
    const user = await requireAuth(request);

    // Get existing product
    const existingProduct = await getProductById(id, true);

    if (!existingProduct) {
      return notFoundResponse('Product');
    }

    // Check ownership (only owner can publish)
    if (!isOwner(user, existingProduct.seller_id)) {
      return forbiddenResponse('You can only publish your own products');
    }

    // Publish product (draft -> pending)
    try {
      const product = await publishProduct(id);

      // TODO: Send notification to admin for approval
      // await notifyAdmin('product_pending_approval', product);

      return successResponse({
        message: 'Product submitted for approval',
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
