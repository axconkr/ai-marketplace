/**
 * My Products API Route
 * GET /api/products/me - Get current user's products
 */

import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { handleError, paginatedResponse } from '@/lib/api/response';
import { getSellerProducts } from '@/lib/services/product';

/**
 * GET /api/products/me
 * Get products created by the current user
 *
 * @auth Required
 * @returns List of user's products
 */
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth(request);

    // Get user's products (include all statuses for owner)
    const products = await getSellerProducts(user.userId, true);

    return paginatedResponse(products, {
      page: 1,
      limit: products.length,
      total: products.length,
    });
  } catch (error) {
    return handleError(error);
  }
}
