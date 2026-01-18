/**
 * Phase 3: Advanced Product Search Integration Tests
 * Tests for enhanced search filtering capabilities
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import {
  buildProductWhereClause,
  buildProductOrderBy,
  advancedProductSearch,
  getProductCategoryAggregation,
  getProductPriceRange,
  getProductRatingRange,
  getVerificationLevelAggregation,
} from '@/lib/services/product-search';
import type { ProductSearchParams } from '@/lib/validations/product';

// Mock Prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    product: {
      findMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
      aggregate: jest.fn(),
    },
  },
}));

import { prisma } from '@/lib/prisma';

describe('Phase 3: Advanced Product Search', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('buildProductWhereClause', () => {
    it('should build WHERE clause with price range filter', () => {
      const params: ProductSearchParams = {
        min_price: 1000,
        max_price: 5000,
        page: 1,
        limit: 20,
        sort_by: 'newest',
      };

      const where = buildProductWhereClause(params);

      expect(where.price).toEqual({
        gte: 1000,
        lte: 5000,
      });
      expect(where.status).toBe('ACTIVE');
    });

    it('should build WHERE clause with min_rating filter', () => {
      const params: ProductSearchParams = {
        min_rating: 4.0,
        page: 1,
        limit: 20,
        sort_by: 'newest',
      };

      const where = buildProductWhereClause(params);

      expect(where.rating_average).toEqual({
        gte: 4.0,
      });
    });

    it('should build WHERE clause with category filter', () => {
      const params: ProductSearchParams = {
        category: 'ai_agent',
        page: 1,
        limit: 20,
        sort_by: 'newest',
      };

      const where = buildProductWhereClause(params);

      expect(where.category).toBe('ai_agent');
    });

    it('should build WHERE clause with verification_level filter', () => {
      const params: ProductSearchParams = {
        verification_level: 2,
        page: 1,
        limit: 20,
        sort_by: 'newest',
      };

      const where = buildProductWhereClause(params);

      expect(where.verification_level).toEqual({
        gte: 2,
      });
    });

    it('should build WHERE clause with combined filters', () => {
      const params: ProductSearchParams = {
        category: 'n8n',
        min_price: 1000,
        max_price: 10000,
        min_rating: 3.5,
        verification_level: 1,
        page: 1,
        limit: 20,
        sort_by: 'newest',
      };

      const where = buildProductWhereClause(params);

      expect(where.category).toBe('n8n');
      expect(where.price).toEqual({
        gte: 1000,
        lte: 10000,
      });
      expect(where.rating_average).toEqual({
        gte: 3.5,
      });
      expect(where.verification_level).toEqual({
        gte: 1,
      });
      expect(where.status).toBe('ACTIVE');
    });

    it('should build WHERE clause with search query', () => {
      const params: ProductSearchParams = {
        search: 'automation',
        page: 1,
        limit: 20,
        sort_by: 'newest',
      };

      const where = buildProductWhereClause(params);

      expect(where.OR).toEqual([
        {
          name: {
            contains: 'automation',
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: 'automation',
            mode: 'insensitive',
          },
        },
      ]);
    });

    it('should handle min_price only', () => {
      const params: ProductSearchParams = {
        min_price: 5000,
        page: 1,
        limit: 20,
        sort_by: 'newest',
      };

      const where = buildProductWhereClause(params);

      expect(where.price).toEqual({
        gte: 5000,
      });
    });

    it('should handle max_price only', () => {
      const params: ProductSearchParams = {
        max_price: 10000,
        page: 1,
        limit: 20,
        sort_by: 'newest',
      };

      const where = buildProductWhereClause(params);

      expect(where.price).toEqual({
        lte: 10000,
      });
    });

    it('should handle seller_id filter', () => {
      const params: ProductSearchParams = {
        seller_id: 'seller123',
        page: 1,
        limit: 20,
        sort_by: 'newest',
      };

      const where = buildProductWhereClause(params);

      expect(where.seller_id).toBe('seller123');
    });
  });

  describe('buildProductOrderBy', () => {
    it('should build ORDER BY for newest', () => {
      const orderBy = buildProductOrderBy('newest');
      expect(orderBy).toEqual({ createdAt: 'desc' });
    });

    it('should build ORDER BY for popular', () => {
      const orderBy = buildProductOrderBy('popular');
      expect(orderBy).toEqual({ download_count: 'desc' });
    });

    it('should build ORDER BY for price_asc', () => {
      const orderBy = buildProductOrderBy('price_asc');
      expect(orderBy).toEqual({ price: 'asc' });
    });

    it('should build ORDER BY for price_desc', () => {
      const orderBy = buildProductOrderBy('price_desc');
      expect(orderBy).toEqual({ price: 'desc' });
    });

    it('should build ORDER BY for rating', () => {
      const orderBy = buildProductOrderBy('rating');
      expect(orderBy).toEqual([
        { rating_average: { sort: 'desc', nulls: 'last' } },
        { rating_count: 'desc' },
      ]);
    });

    it('should default to newest for unknown sort', () => {
      const orderBy = buildProductOrderBy('unknown');
      expect(orderBy).toEqual({ createdAt: 'desc' });
    });
  });

  describe('advancedProductSearch', () => {
    it('should execute search with pagination', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Product 1',
          price: 5000,
          rating_average: 4.5,
          verification_level: 2,
        },
        {
          id: '2',
          name: 'Product 2',
          price: 7000,
          rating_average: 4.0,
          verification_level: 1,
        },
      ];

      (prisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts);
      (prisma.product.count as jest.Mock).mockResolvedValue(25);

      const params: ProductSearchParams = {
        page: 2,
        limit: 10,
        sort_by: 'newest',
      };

      const result = await advancedProductSearch(params);

      expect(result.products).toEqual(mockProducts);
      expect(result.pagination).toEqual({
        page: 2,
        limit: 10,
        total: 25,
        total_pages: 3,
        has_next: true,
        has_prev: true,
      });

      expect(prisma.product.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          status: 'ACTIVE',
        }),
        orderBy: { createdAt: 'desc' },
        skip: 10,
        take: 10,
        select: expect.any(Object),
      });
    });

    it('should execute search with price filter', async () => {
      (prisma.product.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.product.count as jest.Mock).mockResolvedValue(0);

      const params: ProductSearchParams = {
        min_price: 2000,
        max_price: 8000,
        page: 1,
        limit: 20,
        sort_by: 'price_asc',
      };

      await advancedProductSearch(params);

      expect(prisma.product.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          price: {
            gte: 2000,
            lte: 8000,
          },
        }),
        orderBy: { price: 'asc' },
        skip: 0,
        take: 20,
        select: expect.any(Object),
      });
    });

    it('should execute search with rating filter', async () => {
      (prisma.product.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.product.count as jest.Mock).mockResolvedValue(0);

      const params: ProductSearchParams = {
        min_rating: 4.5,
        page: 1,
        limit: 20,
        sort_by: 'rating',
      };

      await advancedProductSearch(params);

      expect(prisma.product.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          rating_average: {
            gte: 4.5,
          },
        }),
        orderBy: [
          { rating_average: { sort: 'desc', nulls: 'last' } },
          { rating_count: 'desc' },
        ],
        skip: 0,
        take: 20,
        select: expect.any(Object),
      });
    });

    it('should execute search with multiple filters', async () => {
      (prisma.product.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.product.count as jest.Mock).mockResolvedValue(0);

      const params: ProductSearchParams = {
        category: 'ai_agent',
        min_price: 5000,
        max_price: 15000,
        min_rating: 4.0,
        verification_level: 2,
        page: 1,
        limit: 20,
        sort_by: 'newest',
      };

      await advancedProductSearch(params);

      expect(prisma.product.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          category: 'ai_agent',
          price: {
            gte: 5000,
            lte: 15000,
          },
          rating_average: {
            gte: 4.0,
          },
          verification_level: {
            gte: 2,
          },
          status: 'ACTIVE',
        }),
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 20,
        select: expect.any(Object),
      });
    });

    it('should calculate correct pagination', async () => {
      (prisma.product.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.product.count as jest.Mock).mockResolvedValue(47);

      const params: ProductSearchParams = {
        page: 1,
        limit: 20,
        sort_by: 'newest',
      };

      const result = await advancedProductSearch(params);

      expect(result.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 47,
        total_pages: 3,
        has_next: true,
        has_prev: false,
      });
    });
  });

  describe('getProductCategoryAggregation', () => {
    it('should return category counts', async () => {
      (prisma.product.groupBy as jest.Mock).mockResolvedValue([
        { category: 'ai_agent', _count: { id: 15 } },
        { category: 'n8n', _count: { id: 10 } },
        { category: 'make', _count: { id: 8 } },
      ]);

      const result = await getProductCategoryAggregation();

      expect(result).toEqual([
        { category: 'ai_agent', count: 15 },
        { category: 'n8n', count: 10 },
        { category: 'make', count: 8 },
      ]);
    });

    it('should filter by search params', async () => {
      (prisma.product.groupBy as jest.Mock).mockResolvedValue([]);

      const params: ProductSearchParams = {
        min_rating: 4.0,
        page: 1,
        limit: 20,
        sort_by: 'newest',
      };

      await getProductCategoryAggregation(params);

      expect(prisma.product.groupBy).toHaveBeenCalledWith({
        by: ['category'],
        where: expect.objectContaining({
          rating_average: {
            gte: 4.0,
          },
        }),
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
      });
    });
  });

  describe('getProductPriceRange', () => {
    it('should return price range', async () => {
      (prisma.product.aggregate as jest.Mock).mockResolvedValue({
        _min: { price: 1000 },
        _max: { price: 50000 },
      });

      const result = await getProductPriceRange();

      expect(result).toEqual({
        min_price: 1000,
        max_price: 50000,
      });
    });

    it('should handle null values', async () => {
      (prisma.product.aggregate as jest.Mock).mockResolvedValue({
        _min: { price: null },
        _max: { price: null },
      });

      const result = await getProductPriceRange();

      expect(result).toEqual({
        min_price: 0,
        max_price: 0,
      });
    });

    it('should filter by search params', async () => {
      (prisma.product.aggregate as jest.Mock).mockResolvedValue({
        _min: { price: 5000 },
        _max: { price: 20000 },
      });

      const params: ProductSearchParams = {
        category: 'n8n',
        page: 1,
        limit: 20,
        sort_by: 'newest',
      };

      await getProductPriceRange(params);

      expect(prisma.product.aggregate).toHaveBeenCalledWith({
        where: expect.objectContaining({
          category: 'n8n',
        }),
        _min: {
          price: true,
        },
        _max: {
          price: true,
        },
      });
    });
  });

  describe('getProductRatingRange', () => {
    it('should return rating range', async () => {
      (prisma.product.aggregate as jest.Mock).mockResolvedValue({
        _min: { rating_average: 3.0 },
        _max: { rating_average: 5.0 },
      });

      const result = await getProductRatingRange();

      expect(result).toEqual({
        min_rating: 3.0,
        max_rating: 5.0,
      });
    });

    it('should handle null values', async () => {
      (prisma.product.aggregate as jest.Mock).mockResolvedValue({
        _min: { rating_average: null },
        _max: { rating_average: null },
      });

      const result = await getProductRatingRange();

      expect(result).toEqual({
        min_rating: 0,
        max_rating: 5,
      });
    });

    it('should filter by search params', async () => {
      (prisma.product.aggregate as jest.Mock).mockResolvedValue({
        _min: { rating_average: 4.0 },
        _max: { rating_average: 5.0 },
      });

      const params: ProductSearchParams = {
        category: 'ai_agent',
        verification_level: 2,
        page: 1,
        limit: 20,
        sort_by: 'newest',
      };

      await getProductRatingRange(params);

      expect(prisma.product.aggregate).toHaveBeenCalledWith({
        where: expect.objectContaining({
          category: 'ai_agent',
          verification_level: {
            gte: 2,
          },
        }),
        _min: {
          rating_average: true,
        },
        _max: {
          rating_average: true,
        },
      });
    });
  });

  describe('getVerificationLevelAggregation', () => {
    it('should return verification level counts', async () => {
      (prisma.product.groupBy as jest.Mock).mockResolvedValue([
        { verification_level: 0, _count: { id: 20 } },
        { verification_level: 1, _count: { id: 15 } },
        { verification_level: 2, _count: { id: 10 } },
        { verification_level: 3, _count: { id: 5 } },
      ]);

      const result = await getVerificationLevelAggregation();

      expect(result).toEqual([
        { verification_level: 0, count: 20 },
        { verification_level: 1, count: 15 },
        { verification_level: 2, count: 10 },
        { verification_level: 3, count: 5 },
      ]);
    });

    it('should filter by search params', async () => {
      (prisma.product.groupBy as jest.Mock).mockResolvedValue([]);

      const params: ProductSearchParams = {
        min_rating: 4.0,
        min_price: 5000,
        page: 1,
        limit: 20,
        sort_by: 'newest',
      };

      await getVerificationLevelAggregation(params);

      expect(prisma.product.groupBy).toHaveBeenCalledWith({
        by: ['verification_level'],
        where: expect.objectContaining({
          rating_average: {
            gte: 4.0,
          },
          price: {
            gte: 5000,
          },
        }),
        _count: {
          id: true,
        },
        orderBy: {
          verification_level: 'asc',
        },
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty result sets', async () => {
      (prisma.product.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.product.count as jest.Mock).mockResolvedValue(0);

      const params: ProductSearchParams = {
        min_rating: 5.0,
        verification_level: 3,
        page: 1,
        limit: 20,
        sort_by: 'newest',
      };

      const result = await advancedProductSearch(params);

      expect(result.products).toEqual([]);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.total_pages).toBe(0);
    });

    it('should handle large page numbers', async () => {
      (prisma.product.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.product.count as jest.Mock).mockResolvedValue(100);

      const params: ProductSearchParams = {
        page: 10,
        limit: 20,
        sort_by: 'newest',
      };

      const result = await advancedProductSearch(params);

      expect(result.pagination.has_next).toBe(false);
      expect(result.pagination.has_prev).toBe(true);
    });

    it('should handle concurrent filter combinations', async () => {
      (prisma.product.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.product.count as jest.Mock).mockResolvedValue(0);

      const params: ProductSearchParams = {
        search: 'automation',
        category: 'n8n',
        min_price: 1000,
        max_price: 10000,
        min_rating: 4.0,
        verification_level: 1,
        seller_id: 'seller123',
        page: 1,
        limit: 20,
        sort_by: 'rating',
      };

      const result = await advancedProductSearch(params);

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
            category: 'n8n',
            price: {
              gte: 1000,
              lte: 10000,
            },
            rating_average: {
              gte: 4.0,
            },
            verification_level: {
              gte: 1,
            },
            seller_id: 'seller123',
            status: 'ACTIVE',
          }),
        })
      );
    });
  });

  describe('Performance Validation', () => {
    it('should execute search and count in parallel', async () => {
      const findManyPromise = Promise.resolve([]);
      const countPromise = Promise.resolve(0);

      (prisma.product.findMany as jest.Mock).mockReturnValue(findManyPromise);
      (prisma.product.count as jest.Mock).mockReturnValue(countPromise);

      const params: ProductSearchParams = {
        page: 1,
        limit: 20,
        sort_by: 'newest',
      };

      await advancedProductSearch(params);

      expect(prisma.product.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.product.count).toHaveBeenCalledTimes(1);
    });

    it('should use optimized field selection', async () => {
      (prisma.product.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.product.count as jest.Mock).mockResolvedValue(0);

      const params: ProductSearchParams = {
        page: 1,
        limit: 20,
        sort_by: 'newest',
      };

      await advancedProductSearch(params);

      const selectArg = (prisma.product.findMany as jest.Mock).mock.calls[0][0]
        .select;

      // Verify only necessary fields are selected
      expect(selectArg).toHaveProperty('id');
      expect(selectArg).toHaveProperty('name');
      expect(selectArg).toHaveProperty('price');
      expect(selectArg).toHaveProperty('rating_average');
      expect(selectArg).toHaveProperty('seller');

      // Verify unnecessary fields are not included
      expect(selectArg).not.toHaveProperty('rating_distribution');
      expect(selectArg).not.toHaveProperty('updatedAt');
    });
  });
});
