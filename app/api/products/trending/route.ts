/**
 * Trending Products API
 * GET /api/products/trending - Get trending products based on recent activity
 */

import { NextRequest } from 'next/server';
import { handleError, successResponse } from '@/lib/api/response';
import { getTrendingProducts } from '@/lib/services/product-search';

/**
 * GET /api/products/trending
 * Get trending products (recent + popular)
 *
 * @auth Optional
 * @query limit (optional, default: 10)
 * @returns List of trending products
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const products = await getTrendingProducts(limit);

    return successResponse({
      products,
      count: products.length,
    });
  } catch (error) {
    return handleError(error);
  }
}
