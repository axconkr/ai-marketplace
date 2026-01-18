/**
 * Seller Products API Route
 * GET /api/products/seller/[sellerId] - Get all products by seller
 */

import { NextRequest } from 'next/server';
import { optionalAuth, canAccess } from '@/lib/auth';
import {
  handleError,
  successResponse,
} from '@/lib/api/response';
import { SellerIdSchema } from '@/lib/validations/product';
import { getSellerProducts } from '@/lib/services/product';

interface RouteContext {
  params: { sellerId: string };
}

/**
 * GET /api/products/seller/[sellerId]
 * Get all products by seller
 *
 * @auth Optional - Required to view draft/pending products
 * @param sellerId - Seller UUID
 * @returns List of seller's products
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    // Validate seller ID
    const { sellerId } = SellerIdSchema.parse(params);

    // Check authentication (optional)
    const user = await optionalAuth(request);

    // Determine if user can view inactive products
    const includeInactive = user ? canAccess(user, sellerId) : false;

    // Get seller's products
    const products = await getSellerProducts(sellerId, includeInactive);

    return successResponse({
      sellerId,
      products,
      total: products.length,
    });
  } catch (error) {
    return handleError(error);
  }
}
