/**
 * Products API Routes
 * POST /api/products - Create product
 * GET /api/products - List/search products
 */

import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth';
import { UserRole } from '@/src/lib/auth/types';
import {
  handleError,
  createdResponse,
  paginatedResponse,
  parseBody,
  parseSearchParams,
} from '@/lib/api/response';
import {
  ProductCreateSchema,
  ProductSearchSchema,
  type ProductCreateInput,
  type ProductSearchParams,
} from '@/lib/validations/product';
import { createProduct, searchProducts } from '@/lib/services/product';

/**
 * POST /api/products
 * Create a new product
 *
 * @auth Required - Seller role
 * @body ProductCreateInput
 * @returns Created product with seller info
 */
export async function POST(request: NextRequest) {
  try {
    // Require seller, service_provider or admin role
    const user = await requireRole(request, [UserRole.SELLER, UserRole.ADMIN]);

    // Parse and validate request body
    const data = await parseBody<ProductCreateInput>(request, ProductCreateSchema);

    // Create product
    const product = await createProduct(user.userId, data);

    return createdResponse(product);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * GET /api/products
 * List/search products with pagination and filters
 *
 * @auth Optional
 * @query ProductSearchParams (page, limit, search, filters, sort_by)
 * @returns Paginated list of products
 */
export async function GET(request: NextRequest) {
  try {
    // Parse and validate search params
    const searchParams = request.nextUrl.searchParams;
    const params = parseSearchParams<ProductSearchParams>(searchParams, ProductSearchSchema);

    // Search products
    const { products, pagination } = await searchProducts(params);

    return paginatedResponse(products, pagination);
  } catch (error) {
    return handleError(error);
  }
}
