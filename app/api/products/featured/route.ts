/**
 * Featured Products API
 * GET /api/products/featured - Get featured/highlighted products
 */

import { NextRequest } from 'next/server';
import { handleError, successResponse } from '@/lib/api/response';
import { getFeaturedProducts } from '@/lib/services/product-search';

/**
 * GET /api/products/featured
 * Get featured products (high verification + high ratings)
 *
 * @auth Optional
 * @query limit (optional, default: 6)
 * @returns List of featured products
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '6', 10);

    const products = await getFeaturedProducts(limit);

    return successResponse({
      products,
      count: products.length,
    });
  } catch (error) {
    return handleError(error);
  }
}
