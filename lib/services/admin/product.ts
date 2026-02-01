import { prisma } from '@/lib/prisma';
import { AdminListParams, AdminListResult, AdminActionResult } from './types';
import { buildPaginationQuery, buildPaginationInfo, buildSearchWhere } from './utils';

export interface AdminProduct {
  id: string;
  name: string;
  price: number;
  status: string;
  category: string | null;
  seller: { id: string; name: string | null; email: string };
  createdAt: Date;
  download_count: number;
  rating_average: number | null;
}

export async function listProductsForAdmin(
  params: AdminListParams & { seller_id?: string; category?: string }
): Promise<AdminListResult<AdminProduct>> {
  const where: any = {};
  if (params.status) {
    where.status = params.status;
  }

  if (params.category) {
    where.category = params.category;
  }

  if (params.seller_id) {
    where.seller_id = params.seller_id;
  }

  const searchWhere = buildSearchWhere(params.search, ['name', 'description']);
  if (Object.keys(searchWhere).length > 0) {
    where.OR = searchWhere.OR;
  }

  const { skip, take } = buildPaginationQuery(params);
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        price: true,
        status: true,
        category: true,
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdAt: true,
        download_count: true,
        rating_average: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items: products,
    pagination: buildPaginationInfo(total, params),
  };
}

export async function getProductDetailsForAdmin(productId: string): Promise<{
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  status: string;
  category: string | null;
  download_count: number;
  verification_level: number;
  verification_badges: string[];
  verification_score: number | null;
  rating_average: number | null;
  rating_count: number;
  createdAt: Date;
  updatedAt: Date;
  seller: { id: string; name: string | null; email: string };
  orders_count: number;
  reviews_count: number;
  reviews_average: number | null;
} | null> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      currency: true,
      status: true,
      category: true,
      download_count: true,
      verification_level: true,
      verification_badges: true,
      verification_score: true,
      rating_average: true,
      rating_count: true,
      createdAt: true,
      updatedAt: true,
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      orders: {
        select: { id: true },
      },
      reviews: {
        select: {
          id: true,
          rating: true,
        },
      },
    },
  });

  if (!product) {
    return null;
  }

  const reviews_count = product.reviews.length;
  const reviews_average = reviews_count > 0
    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / reviews_count
    : null;

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    currency: product.currency,
    status: product.status,
    category: product.category,
    download_count: product.download_count,
    verification_level: product.verification_level,
    verification_badges: product.verification_badges,
    verification_score: product.verification_score,
    rating_average: product.rating_average,
    rating_count: product.rating_count,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    seller: product.seller,
    orders_count: product.orders.length,
    reviews_count,
    reviews_average,
  };
}

export async function updateProductStatus(
  productId: string,
  status: string,
  reason?: string
): Promise<AdminActionResult> {
  try {
    const validStatuses = ['draft', 'pending', 'approved', 'rejected', 'suspended'];
    if (!validStatuses.includes(status)) {
      return {
        success: false,
        message: `Invalid status. Allowed values: ${validStatuses.join(', ')}`,
      };
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        status,
        ...(reason && { description: `${reason}` }),
      },
      select: {
        id: true,
        status: true,
        name: true,
      },
    });

    return {
      success: true,
      message: `Product status updated to "${status}"`,
      data: updatedProduct,
    };
  } catch (error: any) {
    if (error.code === 'P2025') {
      return {
        success: false,
        message: 'Product not found',
      };
    }
    return {
      success: false,
      message: `Failed to update product status: ${error.message}`,
    };
  }
}

export async function getProductStatistics(): Promise<{
  total: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
}> {
  const total = await prisma.product.count();

  const statusCounts = await prisma.product.groupBy({
    by: ['status'],
    _count: true,
  });

  const byStatus: Record<string, number> = {};
  statusCounts.forEach((item) => {
    byStatus[item.status] = item._count;
  });

  const categoryCounts = await prisma.product.groupBy({
    by: ['category'],
    _count: true,
    where: {
      category: {
        not: null,
      },
    },
  });

  const byCategory: Record<string, number> = {};
  categoryCounts.forEach((item) => {
    if (item.category) {
      byCategory[item.category] = item._count;
    }
  });

  return {
    total,
    byStatus,
    byCategory,
  };
}
