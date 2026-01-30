/**
 * Advanced Product Search Service
 * Optimized database queries with full-text search, filtering, and sorting
 * Phase 3: Enhanced with min_rating filter and composite indexes
 */

import { prisma } from '../prisma';
import { Prisma } from '@prisma/client';
import type { ProductSearchParams } from '../validations/product';

export async function searchProductsFullText(
  query: string,
  filters: Partial<ProductSearchParams> = {},
  limit: number = 20,
  offset: number = 0
) {
  if (!query || query.trim().length === 0) {
    return { products: [], total: 0 };
  }

  const searchQuery = query.trim().split(/\s+/).join(' & ');
  
  const results = await prisma.$queryRaw<Array<{
    id: string;
    name: string;
    description: string | null;
    category: string;
    price: number;
    currency: string;
    status: string;
    verification_level: number;
    rating_average: number | null;
    rating_count: number;
    download_count: number;
    rank: number;
  }>>`
    SELECT 
      id, name, description, category, price, currency, status,
      verification_level, rating_average, rating_count, download_count,
      ts_rank(
        to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(description, '')),
        plainto_tsquery('simple', ${query})
      ) as rank
    FROM "Product"
    WHERE 
      status = 'ACTIVE'
      AND to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(description, ''))
        @@ plainto_tsquery('simple', ${query})
    ORDER BY rank DESC, download_count DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `;

  const countResult = await prisma.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(*) as count
    FROM "Product"
    WHERE 
      status = 'ACTIVE'
      AND to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(description, ''))
        @@ plainto_tsquery('simple', ${query})
  `;

  return {
    products: results,
    total: Number(countResult[0]?.count || 0),
  };
}

// ============================================================================
// SEARCH QUERY BUILDER
// ============================================================================

/**
 * Build optimized WHERE clause for product search
 * Phase 3: Added min_rating filter support
 */
export function buildProductWhereClause(
  params: ProductSearchParams
): Prisma.ProductWhereInput {
  const {
    search,
    category,
    status,
    min_price,
    max_price,
    min_rating,
    verification_level,
    seller_id,
  } = params;

  const where: Prisma.ProductWhereInput = {};

  // Full-text search across name and description
  if (search) {
    where.OR = [
      {
        name: {
          contains: search,
          mode: 'insensitive',
        },
      },
      {
        description: {
          contains: search,
          mode: 'insensitive',
        },
      },
    ];
  }

  // Category filter
  if (category) {
    where.category = category;
  }

  // Status filter - default to active products
  where.status = status || 'ACTIVE';

  // Price range filter
  if (min_price !== undefined || max_price !== undefined) {
    where.price = {};
    if (min_price !== undefined) {
      where.price.gte = min_price;
    }
    if (max_price !== undefined) {
      where.price.lte = max_price;
    }
  }

  // Phase 3: Rating filter (minimum rating)
  if (min_rating !== undefined) {
    where.rating_average = {
      gte: min_rating,
    };
  }

  // Verification level filter (products with level >= specified)
  if (verification_level !== undefined) {
    where.verification_level = {
      gte: verification_level,
    };
  }

  // Seller filter
  if (seller_id) {
    where.seller_id = seller_id;
  }

  return where;
}

/**
 * Build optimized ORDER BY clause for product sorting
 */
export function buildProductOrderBy(
  sort_by: string = 'newest'
): Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[] {
  switch (sort_by) {
    case 'newest':
      return { createdAt: 'desc' };

    case 'popular':
      return { download_count: 'desc' };

    case 'price_asc':
      return { price: 'asc' };

    case 'price_desc':
      return { price: 'desc' };

    case 'rating':
      // Sort by rating (nulls last), then by rating count
      return [
        { rating_average: { sort: 'desc', nulls: 'last' } },
        { rating_count: 'desc' },
      ];

    default:
      return { createdAt: 'desc' };
  }
}

// ============================================================================
// OPTIMIZED PRODUCT SELECTION
// ============================================================================

/**
 * Optimized product select for list views
 * Only includes necessary fields to reduce payload size
 */
export const productListSelect = {
  id: true,
  name: true,
  description: true,
  category: true,
  price: true,
  currency: true,
  verification_level: true,
  verification_badges: true,
  verification_score: true,
  status: true,
  download_count: true,
  rating_average: true,
  rating_count: true,
  createdAt: true,
  seller: {
    select: {
      id: true,
      name: true,
      avatar: true,
      role: true,
    },
  },
} as const;

/**
 * Full product select for detail views
 */
export const productDetailSelect = {
  id: true,
  name: true,
  description: true,
  category: true,
  price: true,
  currency: true,
  verification_level: true,
  verification_badges: true,
  verification_score: true,
  rating_distribution: true,
  status: true,
  download_count: true,
  rating_average: true,
  rating_count: true,
  createdAt: true,
  updatedAt: true,
  seller: {
    select: {
      id: true,
      name: true,
      avatar: true,
      role: true,
    },
  },
  files: {
    select: {
      id: true,
      filename: true,
      original_name: true,
      mime_type: true,
      size: true,
      url: true,
    },
  },
  verifications: {
    where: {
      status: 'APPROVED',
    },
    orderBy: {
      completed_at: 'desc',
    },
    take: 1,
    select: {
      id: true,
      level: true,
      score: true,
      badges: true,
      completed_at: true,
    },
  },
} as const;

// ============================================================================
// ADVANCED SEARCH FUNCTION
// ============================================================================

/**
 * Advanced product search with optimized queries
 * Features:
 * - Full-text search
 * - Multi-field filtering (price, rating, verification, category)
 * - Efficient pagination
 * - Optimized field selection
 * - Proper indexing utilization
 *
 * Phase 3 Enhancements:
 * - min_rating filter support
 * - Composite index optimization
 * - Performance target: <500ms total response time
 */
export async function advancedProductSearch(params: ProductSearchParams) {
  const { page = 1, limit = 20, sort_by = 'newest' } = params;

  // Build query components
  const where = buildProductWhereClause(params);
  const orderBy = buildProductOrderBy(sort_by);

  // Execute parallel queries for products and total count
  // Performance: Uses composite indexes for optimal query planning
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      select: productListSelect,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit),
      has_next: page * limit < total,
      has_prev: page > 1,
    },
  };
}

// ============================================================================
// CATEGORY AGGREGATION
// ============================================================================

/**
 * Get product counts by category
 * Useful for category filters with counts
 */
export async function getProductCategoryAggregation(
  params: Partial<ProductSearchParams> = {}
) {
  const where = buildProductWhereClause(params as ProductSearchParams);

  const categories = await prisma.product.groupBy({
    by: ['category'],
    where,
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: 'desc',
      },
    },
  });

  return categories.map((cat) => ({
    category: cat.category,
    count: cat._count.id,
  }));
}

// ============================================================================
// PRICE RANGE AGGREGATION
// ============================================================================

/**
 * Get min/max price range for current filters
 * Useful for price range sliders
 */
export async function getProductPriceRange(
  params: Partial<ProductSearchParams> = {}
) {
  const where = buildProductWhereClause(params as ProductSearchParams);

  const priceRange = await prisma.product.aggregate({
    where,
    _min: {
      price: true,
    },
    _max: {
      price: true,
    },
  });

  return {
    min_price: priceRange._min.price || 0,
    max_price: priceRange._max.price || 0,
  };
}

// ============================================================================
// RATING RANGE AGGREGATION
// ============================================================================

/**
 * Get min/max rating range for current filters
 * Phase 3: New aggregation for rating filter
 */
export async function getProductRatingRange(
  params: Partial<ProductSearchParams> = {}
) {
  const where = buildProductWhereClause(params as ProductSearchParams);

  const ratingRange = await prisma.product.aggregate({
    where,
    _min: {
      rating_average: true,
    },
    _max: {
      rating_average: true,
    },
  });

  return {
    min_rating: ratingRange._min.rating_average || 0,
    max_rating: ratingRange._max.rating_average || 5,
  };
}

// ============================================================================
// VERIFICATION LEVEL AGGREGATION
// ============================================================================

/**
 * Get product counts by verification level
 */
export async function getVerificationLevelAggregation(
  params: Partial<ProductSearchParams> = {}
) {
  const where = buildProductWhereClause(params as ProductSearchParams);

  const levels = await prisma.product.groupBy({
    by: ['verification_level'],
    where,
    _count: {
      id: true,
    },
    orderBy: {
      verification_level: 'asc',
    },
  });

  return levels.map((level) => ({
    verification_level: level.verification_level,
    count: level._count.id,
  }));
}

// ============================================================================
// RELATED PRODUCTS
// ============================================================================

/**
 * Get related products based on category and price similarity
 */
export async function getRelatedProducts(
  productId: string,
  limit: number = 4
) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      category: true,
      price: true,
    },
  });

  if (!product) {
    return [];
  }

  // Find products in same category with similar price
  const priceRange = Number(product.price) * 0.5; // 50% price range

  return await prisma.product.findMany({
    where: {
      id: { not: productId },
      category: product.category,
      status: 'active',
      price: {
        gte: Number(product.price) - priceRange,
        lte: Number(product.price) + priceRange,
      },
    },
    take: limit,
    orderBy: [
      { rating_average: { sort: 'desc', nulls: 'last' } },
      { download_count: 'desc' },
    ],
    select: productListSelect,
  });
}

// ============================================================================
// TRENDING PRODUCTS
// ============================================================================

/**
 * Get trending products based on recent download activity
 * Uses download count and recency to calculate trend score
 */
export async function getTrendingProducts(limit: number = 10) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return await prisma.product.findMany({
    where: {
      status: 'active',
      createdAt: {
        gte: thirtyDaysAgo,
      },
    },
    take: limit,
    orderBy: [
      { download_count: 'desc' },
      { rating_average: { sort: 'desc', nulls: 'last' } },
    ],
    select: productListSelect,
  });
}

// ============================================================================
// FEATURED PRODUCTS
// ============================================================================

/**
 * Get featured products (high verification level + high ratings)
 */
export async function getFeaturedProducts(limit: number = 6) {
  return await prisma.product.findMany({
    where: {
      status: 'active',
      verification_level: {
        gte: 2, // Level 2 or higher
      },
      rating_average: {
        gte: 4.0, // 4 stars or higher
      },
    },
    take: limit,
    orderBy: [
      { verification_level: 'desc' },
      { rating_average: { sort: 'desc', nulls: 'last' } },
      { download_count: 'desc' },
    ],
    select: productListSelect,
  });
}
