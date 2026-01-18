/**
 * Advanced Product Search API
 * GET /api/products/search - Advanced search with aggregations
 * Phase 3: Enhanced with min_rating filter and rating range aggregation
 */

import { NextRequest } from 'next/server';
import {
  handleError,
  successResponse,
  parseSearchParams,
} from '@/lib/api/response';
import {
  ProductSearchSchema,
  type ProductSearchParams,
} from '@/lib/validations/product';
import {
  advancedProductSearch,
  getProductCategoryAggregation,
  getProductPriceRange,
  getProductRatingRange,
  getVerificationLevelAggregation,
} from '@/lib/services/product-search';

/**
 * GET /api/products/search
 * Advanced product search with aggregations and filters
 *
 * Phase 3 Features:
 * - Price range filter (min_price, max_price)
 * - Rating filter (min_rating)
 * - Category filter
 * - Verification level filter
 * - Multiple sort options
 * - Pagination
 * - Filter metadata (aggregations)
 *
 * @auth Optional
 * @query ProductSearchParams + include_aggregations flag
 * @returns Products with optional aggregation data
 */
export async function GET(request: NextRequest) {
  try {
    // Parse and validate search params
    const searchParams = request.nextUrl.searchParams;
    const params = parseSearchParams<ProductSearchParams>(
      searchParams,
      ProductSearchSchema
    );

    // Check if aggregations are requested
    const includeAggregations = searchParams.get('include_aggregations') === 'true';

    // Execute search
    const searchResult = await advancedProductSearch(params);

    // If aggregations not requested, return search results only
    if (!includeAggregations) {
      return successResponse({
        products: searchResult.products,
        pagination: searchResult.pagination,
      });
    }

    // Execute aggregations in parallel for better performance
    const [categories, priceRange, ratingRange, verificationLevels] = await Promise.all([
      getProductCategoryAggregation(params),
      getProductPriceRange(params),
      getProductRatingRange(params), // Phase 3: New rating range aggregation
      getVerificationLevelAggregation(params),
    ]);

    // Return search results with aggregations
    return successResponse({
      products: searchResult.products,
      pagination: searchResult.pagination,
      aggregations: {
        categories,
        price_range: priceRange,
        rating_range: ratingRange, // Phase 3: Include rating range
        verification_levels: verificationLevels,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
