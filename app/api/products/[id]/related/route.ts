/**
 * Related Products API
 * GET /api/products/[id]/related - Get related products
 */

import { NextRequest } from 'next/server';
import { handleError, successResponse, notFoundResponse } from '@/lib/api/response';
import { getRelatedProducts } from '@/lib/services/product-search';

/**
 * GET /api/products/[id]/related
 * Get products related to a specific product
 *
 * @auth Optional
 * @param id - Product ID
 * @query limit (optional, default: 4)
 * @returns List of related products
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '4', 10);

    const products = await getRelatedProducts(params.id, limit);

    if (!products) {
      return notFoundResponse('Product not found');
    }

    return successResponse({
      products,
      count: products.length,
    });
  } catch (error) {
    return handleError(error);
  }
}
