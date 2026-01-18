/**
 * Test Helper Utilities
 * Common utilities for testing across the application
 */

import { render, RenderOptions, RenderResult } from '@testing-library/react'
import { ReactElement, ReactNode } from 'react'
import { User, SellerProfile } from '@prisma/client'

// ============================================================================
// Type Definitions
// ============================================================================

export interface MockUser extends Partial<User> {
  id: string
  email: string
  name: string | null
  role: 'BUYER' | 'SELLER' | 'ADMIN'
}

export interface MockSellerProfile extends Partial<SellerProfile> {
  id: string
  userId: string
  businessName: string
  businessNumber: string | null
}

// ============================================================================
// Mock Data Factories
// ============================================================================

/**
 * Create a mock user for testing
 */
export function createMockUser(overrides?: Partial<MockUser>): MockUser {
  return {
    id: `user-${Math.random().toString(36).substr(2, 9)}`,
    email: `test-${Date.now()}@example.com`,
    name: 'Test User',
    role: 'BUYER',
    emailVerified: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

/**
 * Create a mock seller profile for testing
 */
export function createMockSellerProfile(
  userId: string,
  overrides?: Partial<MockSellerProfile>
): MockSellerProfile {
  return {
    id: `seller-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    businessName: 'Test Business',
    businessNumber: '123-45-67890',
    businessEmail: 'business@example.com',
    phoneNumber: '010-1234-5678',
    bankName: 'Test Bank',
    accountNumber: '1234567890',
    accountHolder: 'Test Holder',
    isVerified: false,
    verifiedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

/**
 * Create a mock product for testing
 */
export function createMockProduct(overrides?: any) {
  return {
    id: `product-${Math.random().toString(36).substr(2, 9)}`,
    title: 'Test Product',
    description: 'Test product description',
    price: 10000,
    category: 'N8N_TEMPLATE',
    status: 'ACTIVE',
    sellerId: 'test-seller-id',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

/**
 * Create a mock order for testing
 */
export function createMockOrder(overrides?: any) {
  return {
    id: `order-${Math.random().toString(36).substr(2, 9)}`,
    buyerId: 'test-buyer-id',
    productId: 'test-product-id',
    sellerId: 'test-seller-id',
    amount: 10000,
    status: 'PENDING',
    paymentMethod: 'CREDIT_CARD',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

// ============================================================================
// Mock Prisma Client
// ============================================================================

/**
 * Create a mock Prisma client for testing
 */
export function createMockPrismaClient() {
  return {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    sellerProfile: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    order: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    settlement: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    verification: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    session: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(createMockPrismaClient())),
  }
}

// ============================================================================
// Mock Next.js Request/Response
// ============================================================================

/**
 * Create a mock Next.js request
 */
export function createMockRequest(options: {
  method?: string
  url?: string
  headers?: Record<string, string>
  body?: any
  cookies?: Record<string, string>
} = {}) {
  const headers = new Headers(options.headers || {})

  return {
    method: options.method || 'GET',
    url: options.url || 'http://localhost:3000',
    headers,
    cookies: options.cookies || {},
    json: async () => options.body,
    text: async () => JSON.stringify(options.body),
  } as any
}

/**
 * Create a mock Next.js response
 */
export function createMockResponse() {
  const response = {
    status: 200,
    headers: new Headers(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    setHeader: jest.fn(),
  }

  return response as any
}

// ============================================================================
// Mock Authentication
// ============================================================================

/**
 * Create a mock authentication token
 */
export function createMockAuthToken(user: MockUser): string {
  // Simple base64 encoding for testing (not secure, only for tests)
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  }
  return Buffer.from(JSON.stringify(payload)).toString('base64')
}

/**
 * Create mock authenticated request
 */
export function createMockAuthRequest(user: MockUser, options: any = {}) {
  const token = createMockAuthToken(user)

  return createMockRequest({
    ...options,
    headers: {
      ...options.headers,
      authorization: `Bearer ${token}`,
    },
  })
}

// ============================================================================
// Mock Fetch
// ============================================================================

/**
 * Mock successful fetch response
 */
export function mockFetchSuccess(data: any, status = 200) {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      status,
      json: async () => data,
      text: async () => JSON.stringify(data),
      headers: new Headers(),
    } as Response)
  )
}

/**
 * Mock failed fetch response
 */
export function mockFetchError(message: string, status = 500) {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: false,
      status,
      json: async () => ({ error: message }),
      text: async () => JSON.stringify({ error: message }),
      headers: new Headers(),
    } as Response)
  )
}

// ============================================================================
// React Testing Library Utilities
// ============================================================================

/**
 * Custom render function with providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult {
  function Wrapper({ children }: { children: ReactNode }) {
    // Add your providers here (QueryClientProvider, etc.)
    return children as any
  }

  return render(ui, { wrapper: Wrapper, ...options })
}

/**
 * Wait for async operations to complete
 */
export async function waitForAsync() {
  await new Promise((resolve) => setTimeout(resolve, 0))
}

// ============================================================================
// Test Data Cleanup
// ============================================================================

/**
 * Clear all mocks between tests
 */
export function clearAllMocks() {
  jest.clearAllMocks()
}

/**
 * Reset all mocks to initial state
 */
export function resetAllMocks() {
  jest.resetAllMocks()
}

// ============================================================================
// Environment Variable Mocking
// ============================================================================

/**
 * Mock environment variables for testing
 */
export function mockEnv(variables: Record<string, string>) {
  const original = { ...process.env }

  Object.assign(process.env, variables)

  return () => {
    process.env = original
  }
}

// ============================================================================
// Date/Time Utilities
// ============================================================================

/**
 * Mock current date for testing
 */
export function mockCurrentDate(date: Date) {
  const original = Date.now
  Date.now = jest.fn(() => date.getTime())

  return () => {
    Date.now = original
  }
}

/**
 * Create a date in the past
 */
export function createPastDate(daysAgo: number): Date {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date
}

/**
 * Create a date in the future
 */
export function createFutureDate(daysFromNow: number): Date {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  return date
}

// ============================================================================
// Assertion Helpers
// ============================================================================

/**
 * Assert that an API response is successful
 */
export function expectSuccessResponse(response: any) {
  expect(response.ok).toBe(true)
  expect(response.status).toBe(200)
}

/**
 * Assert that an API response is an error
 */
export function expectErrorResponse(response: any, status = 500) {
  expect(response.ok).toBe(false)
  expect(response.status).toBe(status)
}

/**
 * Assert that a Prisma query was called with specific arguments
 */
export function expectPrismaCall(
  mockFn: jest.Mock,
  expectedArgs: any
) {
  expect(mockFn).toHaveBeenCalledWith(
    expect.objectContaining(expectedArgs)
  )
}
