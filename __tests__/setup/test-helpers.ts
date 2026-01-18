/**
 * Test Helpers and Utilities
 * Shared utilities for all tests
 */

import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

export const mockUser = (overrides = {}) => ({
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  role: 'buyer',
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides,
});

export const mockProduct = (overrides = {}) => ({
  id: 'product-123',
  name: 'Test Product',
  description: 'This is a detailed test product description with at least 50 characters to pass validation',
  price: 9900,
  currency: 'USD',
  seller_id: 'seller-123',
  category: 'n8n-templates',
  status: 'active',
  verification_level: 0,
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides,
});

export const mockOrder = (overrides = {}) => ({
  id: 'order-123',
  product_id: 'product-123',
  buyer_id: 'buyer-123',
  seller_id: 'seller-123',
  amount: 9900,
  platform_fee: 990,
  seller_amount: 8910,
  currency: 'USD',
  status: 'PAID',
  payment_method: 'stripe',
  payment_id: 'pi_123',
  created_at: new Date(),
  paid_at: new Date(),
  ...overrides,
});

export const mockVerification = (overrides = {}) => ({
  id: 'verification-123',
  product_id: 'product-123',
  level: 1,
  fee: 5000,
  platform_share: 1500,
  verifier_share: 3500,
  status: 'PENDING',
  score: null,
  created_at: new Date(),
  ...overrides,
});

export const mockReview = (overrides = {}) => ({
  id: 'review-123',
  product_id: 'product-123',
  order_id: 'order-123',
  user_id: 'buyer-123',
  rating: 5,
  title: 'Great product!',
  comment: 'This product is amazing and really helped my workflow.',
  verified_purchase: true,
  status: 'PUBLISHED',
  helpful_count: 0,
  not_helpful_count: 0,
  created_at: new Date(),
  ...overrides,
});

export const mockFile = (overrides = {}) => ({
  id: 'file-123',
  product_id: 'product-123',
  filename: 'test-file.zip',
  size: 1024000,
  path: '/uploads/test-file.zip',
  mime_type: 'application/zip',
  upload_status: 'completed',
  created_at: new Date(),
  ...overrides,
});

// ============================================================================
// JWT HELPERS
// ============================================================================

export const generateTestToken = (payload = {}) => {
  const secret = process.env.JWT_SECRET || 'test-secret';
  return jwt.sign(
    {
      userId: 'user-123',
      email: 'test@example.com',
      role: 'buyer',
      ...payload,
    },
    secret,
    { expiresIn: '1h' }
  );
};

export const createAuthHeader = (token?: string) => {
  const authToken = token || generateTestToken();
  return `Bearer ${authToken}`;
};

// ============================================================================
// MOCK PRISMA CLIENT
// ============================================================================

export const createMockPrismaClient = () => {
  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    order: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    verification: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    review: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    reviewVote: {
      upsert: jest.fn(),
      groupBy: jest.fn(),
    },
    notification: {
      findMany: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
    },
    settlement: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      aggregate: jest.fn(),
      count: jest.fn(),
    },
    file: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  return mockPrisma as unknown as PrismaClient;
};

// ============================================================================
// MOCK EXTERNAL SERVICES
// ============================================================================

export const mockStripe = {
  paymentIntents: {
    create: jest.fn(),
    retrieve: jest.fn(),
    confirm: jest.fn(),
  },
  refunds: {
    create: jest.fn(),
  },
  customers: {
    list: jest.fn(),
    create: jest.fn(),
  },
  webhooks: {
    constructEvent: jest.fn(),
  },
};

export const mockTossPayments = {
  confirmPayment: jest.fn(),
  refundPayment: jest.fn(),
  getPayment: jest.fn(),
};

// ============================================================================
// DATE HELPERS
// ============================================================================

export const createDateRange = (daysAgo: number) => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - daysAgo);
  return { start, end };
};

// ============================================================================
// ASSERTION HELPERS
// ============================================================================

export const expectValidationError = (error: any, field?: string) => {
  expect(error).toBeDefined();
  if (field) {
    expect(error.message).toContain(field);
  }
};

export const expectSuccessResponse = (response: any) => {
  expect(response.status).toBeGreaterThanOrEqual(200);
  expect(response.status).toBeLessThan(300);
};

export const expectErrorResponse = (response: any, statusCode: number) => {
  expect(response.status).toBe(statusCode);
};
