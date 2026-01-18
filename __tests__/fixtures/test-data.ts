/**
 * Test Fixtures
 * Sample data for testing
 */

// ============================================================================
// User Fixtures
// ============================================================================

export const mockUsers = {
  buyer: {
    id: 'buyer-test-id',
    email: 'buyer@test.com',
    name: 'Test Buyer',
    role: 'BUYER' as const,
    emailVerified: new Date('2024-01-01'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  seller: {
    id: 'seller-test-id',
    email: 'seller@test.com',
    name: 'Test Seller',
    role: 'SELLER' as const,
    emailVerified: new Date('2024-01-01'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  admin: {
    id: 'admin-test-id',
    email: 'admin@test.com',
    name: 'Test Admin',
    role: 'ADMIN' as const,
    emailVerified: new Date('2024-01-01'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
}

// ============================================================================
// Seller Profile Fixtures
// ============================================================================

export const mockSellerProfiles = {
  verified: {
    id: 'verified-seller-profile',
    userId: 'seller-test-id',
    businessName: 'Verified Business Inc.',
    businessNumber: '123-45-67890',
    businessEmail: 'business@verified.com',
    phoneNumber: '010-1234-5678',
    bankName: 'Test Bank',
    accountNumber: '1234567890',
    accountHolder: 'Business Owner',
    isVerified: true,
    verifiedAt: new Date('2024-01-15'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  },
  pending: {
    id: 'pending-seller-profile',
    userId: 'pending-seller-id',
    businessName: 'Pending Business LLC',
    businessNumber: '987-65-43210',
    businessEmail: 'business@pending.com',
    phoneNumber: '010-9876-5432',
    bankName: 'Test Bank',
    accountNumber: '0987654321',
    accountHolder: 'Pending Owner',
    isVerified: false,
    verifiedAt: null,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
}

// ============================================================================
// Product Fixtures
// ============================================================================

export const mockProducts = {
  n8nTemplate: {
    id: 'n8n-product-id',
    sellerId: 'seller-test-id',
    title: 'Advanced CRM Automation Template',
    description: 'Complete n8n template for CRM automation with 20+ nodes',
    category: 'N8N_TEMPLATE' as const,
    price: 50000,
    status: 'ACTIVE' as const,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
  makeScenario: {
    id: 'make-product-id',
    sellerId: 'seller-test-id',
    title: 'Email Marketing Automation',
    description: 'Make.com scenario for automated email campaigns',
    category: 'MAKE_SCENARIO' as const,
    price: 30000,
    status: 'ACTIVE' as const,
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12'),
  },
  aiAgent: {
    id: 'ai-agent-product-id',
    sellerId: 'seller-test-id',
    title: 'Customer Support AI Agent',
    description: 'AI-powered customer support agent with GPT-4',
    category: 'AI_AGENT' as const,
    price: 100000,
    status: 'ACTIVE' as const,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  pendingProduct: {
    id: 'pending-product-id',
    sellerId: 'seller-test-id',
    title: 'Pending Product',
    description: 'This product is pending approval',
    category: 'N8N_TEMPLATE' as const,
    price: 25000,
    status: 'PENDING' as const,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
}

// ============================================================================
// Order Fixtures
// ============================================================================

export const mockOrders = {
  completed: {
    id: 'completed-order-id',
    buyerId: 'buyer-test-id',
    sellerId: 'seller-test-id',
    productId: 'n8n-product-id',
    amount: 50000,
    status: 'COMPLETED' as const,
    paymentMethod: 'CREDIT_CARD' as const,
    paymentId: 'payment-123',
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16'),
    completedAt: new Date('2024-01-16'),
  },
  pending: {
    id: 'pending-order-id',
    buyerId: 'buyer-test-id',
    sellerId: 'seller-test-id',
    productId: 'make-product-id',
    amount: 30000,
    status: 'PENDING' as const,
    paymentMethod: 'BANK_TRANSFER' as const,
    paymentId: null,
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18'),
    completedAt: null,
  },
  refunded: {
    id: 'refunded-order-id',
    buyerId: 'buyer-test-id',
    sellerId: 'seller-test-id',
    productId: 'ai-agent-product-id',
    amount: 100000,
    status: 'REFUNDED' as const,
    paymentMethod: 'CREDIT_CARD' as const,
    paymentId: 'payment-456',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-17'),
    completedAt: new Date('2024-01-10'),
    refundedAt: new Date('2024-01-17'),
  },
}

// ============================================================================
// Settlement Fixtures
// ============================================================================

export const mockSettlements = {
  pending: {
    id: 'pending-settlement-id',
    orderId: 'completed-order-id',
    sellerId: 'seller-test-id',
    amount: 45000, // 90% of 50000 (10% platform fee)
    status: 'PENDING' as const,
    scheduledAt: new Date('2024-02-01'),
    completedAt: null,
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16'),
  },
  completed: {
    id: 'completed-settlement-id',
    orderId: 'completed-order-id',
    sellerId: 'seller-test-id',
    amount: 45000,
    status: 'COMPLETED' as const,
    scheduledAt: new Date('2024-02-01'),
    completedAt: new Date('2024-02-01'),
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-02-01'),
  },
}

// ============================================================================
// Verification Fixtures
// ============================================================================

export const mockVerifications = {
  level0Pending: {
    id: 'level0-pending-id',
    productId: 'n8n-product-id',
    level: 'LEVEL_0' as const,
    status: 'PENDING' as const,
    verifierId: null,
    assignedAt: null,
    completedAt: null,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
  level0Completed: {
    id: 'level0-completed-id',
    productId: 'n8n-product-id',
    level: 'LEVEL_0' as const,
    status: 'COMPLETED' as const,
    verifierId: 'verifier-test-id',
    assignedAt: new Date('2024-01-11'),
    completedAt: new Date('2024-01-12'),
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-12'),
  },
  level1InProgress: {
    id: 'level1-progress-id',
    productId: 'ai-agent-product-id',
    level: 'LEVEL_1' as const,
    status: 'IN_PROGRESS' as const,
    verifierId: 'verifier-test-id',
    assignedAt: new Date('2024-01-15'),
    completedAt: null,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-16'),
  },
}

// ============================================================================
// Payment Fixtures
// ============================================================================

export const mockPaymentData = {
  stripe: {
    paymentIntent: {
      id: 'pi_test_123456789',
      amount: 50000,
      currency: 'krw',
      status: 'succeeded',
      customer: 'cus_test_123',
    },
    paymentMethod: {
      id: 'pm_test_card',
      type: 'card',
      card: {
        brand: 'visa',
        last4: '4242',
      },
    },
  },
  toss: {
    payment: {
      paymentKey: 'toss_test_key_123',
      orderId: 'order_test_123',
      amount: 50000,
      status: 'DONE',
      method: 'CARD',
    },
  },
}

// ============================================================================
// Error Fixtures
// ============================================================================

export const mockErrors = {
  unauthorized: {
    code: 'UNAUTHORIZED',
    message: 'Authentication required',
    status: 401,
  },
  forbidden: {
    code: 'FORBIDDEN',
    message: 'Insufficient permissions',
    status: 403,
  },
  notFound: {
    code: 'NOT_FOUND',
    message: 'Resource not found',
    status: 404,
  },
  validationError: {
    code: 'VALIDATION_ERROR',
    message: 'Invalid input data',
    status: 400,
    errors: [
      { field: 'email', message: 'Invalid email format' },
      { field: 'password', message: 'Password too short' },
    ],
  },
  serverError: {
    code: 'INTERNAL_ERROR',
    message: 'Internal server error',
    status: 500,
  },
}

// ============================================================================
// API Response Fixtures
// ============================================================================

export const mockApiResponses = {
  success: {
    success: true,
    data: { id: 'test-id', message: 'Operation successful' },
  },
  error: {
    success: false,
    error: 'Operation failed',
  },
  paginatedProducts: {
    success: true,
    data: {
      products: [mockProducts.n8nTemplate, mockProducts.makeScenario],
      pagination: {
        total: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      },
    },
  },
}
