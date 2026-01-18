/**
 * Database Test Helpers
 * Utilities for database seeding and cleanup in tests
 */

import { PrismaClient } from '@prisma/client'

// ============================================================================
// Database Connection
// ============================================================================

let testPrisma: PrismaClient | null = null

/**
 * Get or create test Prisma client
 */
export function getTestPrismaClient(): PrismaClient {
  if (!testPrisma) {
    testPrisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test',
        },
      },
    })
  }
  return testPrisma
}

/**
 * Close test database connection
 */
export async function closeTestDatabase() {
  if (testPrisma) {
    await testPrisma.$disconnect()
    testPrisma = null
  }
}

// ============================================================================
// Database Cleanup
// ============================================================================

/**
 * Clean all test data from database
 */
export async function cleanDatabase() {
  const prisma = getTestPrismaClient()

  // Delete in order to respect foreign key constraints
  await prisma.verification.deleteMany()
  await prisma.settlement.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.sellerProfile.deleteMany()
  await prisma.user.deleteMany()
}

/**
 * Clean specific table
 */
export async function cleanTable(tableName: string) {
  const prisma = getTestPrismaClient()
  await (prisma as any)[tableName].deleteMany()
}

// ============================================================================
// Database Seeding
// ============================================================================

/**
 * Seed test users
 */
export async function seedUsers(count: number = 5) {
  const prisma = getTestPrismaClient()
  const users = []

  for (let i = 0; i < count; i++) {
    const user = await prisma.user.create({
      data: {
        email: `test-user-${i}@example.com`,
        name: `Test User ${i}`,
        password: 'hashed-password', // Use bcrypt in real implementation
        role: i % 3 === 0 ? 'SELLER' : 'BUYER',
      },
    })
    users.push(user)
  }

  return users
}

/**
 * Seed test seller profiles
 */
export async function seedSellerProfiles(userIds: string[]) {
  const prisma = getTestPrismaClient()
  const profiles = []

  for (let i = 0; i < userIds.length; i++) {
    const profile = await prisma.sellerProfile.create({
      data: {
        userId: userIds[i],
        businessName: `Test Business ${i}`,
        businessNumber: `${100 + i}-45-67890`,
        businessEmail: `business-${i}@example.com`,
        phoneNumber: `010-1234-${5678 + i}`,
        bankName: 'Test Bank',
        accountNumber: `1234567890${i}`,
        accountHolder: `Test Holder ${i}`,
        isVerified: i % 2 === 0,
        verifiedAt: i % 2 === 0 ? new Date() : null,
      },
    })
    profiles.push(profile)
  }

  return profiles
}

/**
 * Seed test products
 */
export async function seedProducts(sellerIds: string[], count: number = 10) {
  const prisma = getTestPrismaClient()
  const products = []

  const categories = ['N8N_TEMPLATE', 'MAKE_SCENARIO', 'ZAPIER_ZAP', 'AI_AGENT', 'CUSTOM_SOLUTION']

  for (let i = 0; i < count; i++) {
    const product = await prisma.product.create({
      data: {
        sellerId: sellerIds[i % sellerIds.length],
        title: `Test Product ${i}`,
        description: `This is a test product description ${i}`,
        category: categories[i % categories.length],
        price: (i + 1) * 10000,
        status: i % 5 === 0 ? 'PENDING' : 'ACTIVE',
      },
    })
    products.push(product)
  }

  return products
}

/**
 * Seed test orders
 */
export async function seedOrders(
  buyerIds: string[],
  sellerIds: string[],
  productIds: string[],
  count: number = 10
) {
  const prisma = getTestPrismaClient()
  const orders = []

  const statuses = ['PENDING', 'COMPLETED', 'CANCELLED', 'REFUNDED']
  const paymentMethods = ['CREDIT_CARD', 'BANK_TRANSFER', 'PAYPAL']

  for (let i = 0; i < count; i++) {
    const order = await prisma.order.create({
      data: {
        buyerId: buyerIds[i % buyerIds.length],
        sellerId: sellerIds[i % sellerIds.length],
        productId: productIds[i % productIds.length],
        amount: (i + 1) * 10000,
        status: statuses[i % statuses.length],
        paymentMethod: paymentMethods[i % paymentMethods.length],
      },
    })
    orders.push(order)
  }

  return orders
}

/**
 * Seed test settlements
 */
export async function seedSettlements(orderIds: string[], sellerIds: string[]) {
  const prisma = getTestPrismaClient()
  const settlements = []

  for (let i = 0; i < orderIds.length; i++) {
    // Only create settlements for completed orders
    const settlement = await prisma.settlement.create({
      data: {
        orderId: orderIds[i],
        sellerId: sellerIds[i % sellerIds.length],
        amount: (i + 1) * 9000, // 90% of order amount (10% platform fee)
        status: i % 3 === 0 ? 'PENDING' : 'COMPLETED',
        scheduledAt: new Date(),
        completedAt: i % 3 === 0 ? null : new Date(),
      },
    })
    settlements.push(settlement)
  }

  return settlements
}

/**
 * Seed test verifications
 */
export async function seedVerifications(productIds: string[]) {
  const prisma = getTestPrismaClient()
  const verifications = []

  const levels = ['LEVEL_0', 'LEVEL_1']
  const statuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED']

  for (let i = 0; i < productIds.length; i++) {
    const verification = await prisma.verification.create({
      data: {
        productId: productIds[i],
        level: levels[i % levels.length],
        status: statuses[i % statuses.length],
        verifierId: i % 2 === 0 ? `verifier-${i}` : null,
        assignedAt: i % 2 === 0 ? new Date() : null,
        completedAt: i % 4 === 0 ? new Date() : null,
      },
    })
    verifications.push(verification)
  }

  return verifications
}

// ============================================================================
// Full Database Seeding
// ============================================================================

/**
 * Seed complete test database
 */
export async function seedTestDatabase() {
  const prisma = getTestPrismaClient()

  // Clean existing data
  await cleanDatabase()

  // Create users
  const users = await seedUsers(10)
  const buyerIds = users.filter((u) => u.role === 'BUYER').map((u) => u.id)
  const sellerIds = users.filter((u) => u.role === 'SELLER').map((u) => u.id)

  // Create seller profiles
  await seedSellerProfiles(sellerIds)

  // Create products
  const products = await seedProducts(sellerIds, 20)
  const productIds = products.map((p) => p.id)

  // Create orders
  const orders = await seedOrders(buyerIds, sellerIds, productIds, 30)
  const completedOrderIds = orders.filter((o) => o.status === 'COMPLETED').map((o) => o.id)

  // Create settlements for completed orders
  if (completedOrderIds.length > 0) {
    await seedSettlements(completedOrderIds, sellerIds)
  }

  // Create verifications
  await seedVerifications(productIds)

  return {
    users,
    buyerIds,
    sellerIds,
    products,
    productIds,
    orders,
  }
}

// ============================================================================
// Transaction Helpers
// ============================================================================

/**
 * Run test in a transaction and rollback
 */
export async function runInTransaction<T>(
  callback: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  const prisma = getTestPrismaClient()
  let result: T

  try {
    result = await prisma.$transaction(async (tx) => {
      const testResult = await callback(tx as PrismaClient)
      // Force rollback by throwing error
      throw new Error('ROLLBACK')
    })
  } catch (error: any) {
    if (error.message === 'ROLLBACK') {
      return result!
    }
    throw error
  }

  return result!
}

// ============================================================================
// Query Helpers
// ============================================================================

/**
 * Wait for database operation to complete
 */
export async function waitForDbOperation(
  operation: () => Promise<any>,
  maxAttempts: number = 10,
  delayMs: number = 100
): Promise<any> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await operation()
    } catch (error) {
      if (i === maxAttempts - 1) throw error
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }
}

/**
 * Count records in table
 */
export async function countRecords(tableName: string): Promise<number> {
  const prisma = getTestPrismaClient()
  return await (prisma as any)[tableName].count()
}

/**
 * Find record by ID
 */
export async function findRecordById(tableName: string, id: string): Promise<any> {
  const prisma = getTestPrismaClient()
  return await (prisma as any)[tableName].findUnique({ where: { id } })
}

// ============================================================================
// Export Utilities
// ============================================================================

export default {
  getTestPrismaClient,
  closeTestDatabase,
  cleanDatabase,
  cleanTable,
  seedUsers,
  seedSellerProfiles,
  seedProducts,
  seedOrders,
  seedSettlements,
  seedVerifications,
  seedTestDatabase,
  runInTransaction,
  waitForDbOperation,
  countRecords,
  findRecordById,
}
