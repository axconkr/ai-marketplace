/**
 * Product Service Layer
 * Business logic for product operations
 */

import { prisma } from '../prisma';
import { Prisma } from '@prisma/client';
import type { ProductCreateInput, ProductUpdateInput, ProductSearchParams } from '../validations/product';
import { advancedProductSearch } from './product-search';

// ============================================================================
// PRODUCT CRUD OPERATIONS
// ============================================================================

/**
 * Create a new product
 */
export async function createProduct(sellerId: string, data: ProductCreateInput) {
  return await prisma.product.create({
    data: {
      ...data,
      seller_id: sellerId,
      status: 'draft' as ProductStatus,
    },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  });
}

/**
 * Get product by ID with seller info
 */
export async function getProductById(productId: string, includeInactive: boolean = false) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
      reviews: {
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          buyer: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      },
      verifications: {
        where: {
          status: 'approved',
        },
        orderBy: {
          level: 'desc',
        },
        take: 1,
      },
    },
  });

  if (!product) {
    return null;
  }

  // Filter inactive products unless explicitly requested
  if (!includeInactive && product.status !== 'ACTIVE') {
    return null;
  }

  return product;
}

/**
 * Update product
 */
export async function updateProduct(productId: string, data: ProductUpdateInput) {
  return await prisma.product.update({
    where: { id: productId },
    data: {
      ...data,
      updatedAt: new Date(), // Product uses updatedAt (camelCase)
    },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  });
}

/**
 * Soft delete product (set status to suspended)
 */
export async function deleteProduct(productId: string) {
  return await prisma.product.update({
    where: { id: productId },
    data: {
      status: 'suspended' as ProductStatus,
      updatedAt: new Date(), // Product uses updatedAt (camelCase)
    },
  });
}

/**
 * Search and filter products with pagination
 * Uses optimized advanced search with proper indexing
 */
export async function searchProducts(params: ProductSearchParams) {
  return advancedProductSearch(params);
}

/**
 * Get seller's products
 */
export async function getSellerProducts(sellerId: string, includeInactive: boolean = false) {
  const where: Prisma.ProductWhereInput = {
    seller_id: sellerId,
  };

  if (!includeInactive) {
    where.status = 'ACTIVE' as ProductStatus;
  }

  return await prisma.product.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  });
}

// ============================================================================
// PRODUCT STATE TRANSITIONS
// ============================================================================

/**
 * Publish product (draft  pending)
 */
export async function publishProduct(productId: string) {
  // Verify product has required fields
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  if (product.status !== 'draft') {
    throw new Error('Only draft products can be published');
  }

  // Validate required fields
  if (!product.name || !product.description || !product.category) {
    throw new Error('Product missing required fields');
  }

  // Update status
  return await prisma.product.update({
    where: { id: productId },
    data: {
      status: 'pending' as ProductStatus,
      updatedAt: new Date(), // Product uses updatedAt (camelCase)
    },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

/**
 * Approve product (pending  active)
 */
export async function approveProduct(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  if (product.status !== 'pending') {
    throw new Error('Only pending products can be approved');
  }

  // Update status
  return await prisma.product.update({
    where: { id: productId },
    data: {
      status: 'ACTIVE' as ProductStatus,
      updatedAt: new Date(), // Product uses updatedAt (camelCase)
    },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

/**
 * Reject product (pending  draft)
 */
export async function rejectProduct(productId: string, reason?: string) {
  return await prisma.product.update({
    where: { id: productId },
    data: {
      status: 'draft' as ProductStatus,
      updatedAt: new Date(), // Product uses updatedAt (camelCase)
    },
  });
}

// ============================================================================
// PRODUCT STATISTICS
// ============================================================================

/**
 * Increment view count
 * Note: view_count field doesn't exist in schema - consider adding it or removing this function
 */
export async function incrementViewCount(productId: string) {
  // TODO: Add view_count field to Product model in schema
  console.warn('incrementViewCount: view_count field does not exist in Product schema');
  return null;
}

/**
 * Increment download count
 */
export async function incrementDownloadCount(productId: string) {
  return await prisma.product.update({
    where: { id: productId },
    data: {
      download_count: { increment: 1 },
    },
  });
}

/**
 * Update product rating
 */
export async function updateProductRating(productId: string) {
  // Calculate average rating from reviews
  const result = await prisma.review.aggregate({
    where: { product_id: productId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  return await prisma.product.update({
    where: { id: productId },
    data: {
      rating_average: result._avg.rating, // Correct field name
      rating_count: result._count.rating, // Correct field name
    },
  });
}
