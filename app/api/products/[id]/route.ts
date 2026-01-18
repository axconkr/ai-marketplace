/**
 * Product Detail API Routes
 * GET /api/products/[id] - Get product details
 * PUT /api/products/[id] - Update product
 * DELETE /api/products/[id] - Delete product
 */

import { NextRequest } from 'next/server';
import { optionalAuth, requireAuth, canAccess, isAdmin } from '@/lib/auth';
import {
  handleError,
  successResponse,
  notFoundResponse,
  forbiddenResponse,
  parseBody,
} from '@/lib/api/response';
import {
  ProductIdSchema,
  ProductUpdateSchema,
  type ProductUpdateInput,
} from '@/lib/validations/product';
import {
  getProductById,
  updateProduct,
  deleteProduct,
  incrementViewCount,
} from '@/lib/services/product';

interface RouteContext {
  params: { id: string };
}

/**
 * GET /api/products/[id]
 * Get product details
 *
 * @auth Optional - Required for draft/pending products
 * @param id - Product UUID
 * @returns Product with seller info and reviews
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    // Validate product ID
    const { id } = ProductIdSchema.parse(params);

    // Check authentication (optional)
    const user = await optionalAuth(request);

    // Get product
    const product = await getProductById(id, false);

    if (!product) {
      return notFoundResponse('Product');
    }

    // Check access for non-active products
    if (product.status !== 'active') {
      if (!user) {
        return notFoundResponse('Product');
      }

      // Only owner or admin can view non-active products
      if (!canAccess(user, product.seller_id)) {
        return notFoundResponse('Product');
      }
    }

    // Increment view count (async, no await)
    if (product.status === 'active') {
      incrementViewCount(id).catch((err) =>
        console.error('Failed to increment view count:', err)
      );
    }

    return successResponse(product);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * PUT /api/products/[id]
 * Update product
 *
 * @auth Required - Seller (owner) or Admin
 * @param id - Product UUID
 * @body ProductUpdateInput
 * @returns Updated product
 */
export async function PUT(request: NextRequest, { params }: RouteContext) {
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

    // Check permissions (owner or admin)
    if (!canAccess(user, existingProduct.seller_id)) {
      return forbiddenResponse('You can only update your own products');
    }

    // Parse and validate request body
    const data = await parseBody<ProductUpdateInput>(request, ProductUpdateSchema);

    // Prevent changing seller_id
    if ('seller_id' in data) {
      delete (data as any).seller_id;
    }

    // Update product
    const product = await updateProduct(id, data);

    return successResponse(product);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/products/[id]
 * Soft delete product (set status to suspended)
 *
 * @auth Required - Seller (owner) or Admin
 * @param id - Product UUID
 * @returns Success message
 */
export async function DELETE(request: NextRequest, { params }: RouteContext) {
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

    // Check permissions (owner or admin)
    if (!canAccess(user, existingProduct.seller_id)) {
      return forbiddenResponse('You can only delete your own products');
    }

    // Soft delete product
    await deleteProduct(id);

    return successResponse({
      message: 'Product deleted successfully',
      id,
    });
  } catch (error) {
    return handleError(error);
  }
}
