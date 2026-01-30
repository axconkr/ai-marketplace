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
 * Note: Seller profiles are stored as User records with role='SELLER'
 * This function is kept for backward compatibility but returns empty array
 */
export async function seedSellerProfiles(userIds: string[]) {
   // Seller profiles are managed through User model with role='SELLER'
   // No separate sellerProfile model exists
   return []
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
         seller_id: sellerIds[i % sellerIds.length],
         name: `Test Product ${i}`,
         description: `This is a test product description ${i}`,
         category: categories[i % categories.length],
         price: (i + 1) * 10000,
         status: i % 5 === 0 ? 'draft' : 'active',
         currency: 'KRW',
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

   const statuses: Array<'PENDING' | 'PAID' | 'COMPLETED' | 'REFUNDED' | 'CANCELLED' | 'FAILED'> = [
     'PENDING',
     'COMPLETED',
     'CANCELLED',
     'REFUNDED',
   ]

   for (let i = 0; i < count; i++) {
     const order = await prisma.order.create({
       data: {
         buyer_id: buyerIds[i % buyerIds.length],
         product_id: productIds[i % productIds.length],
         amount: (i + 1) * 10000,
         currency: 'KRW',
         platform_fee: (i + 1) * 1500,
         seller_amount: (i + 1) * 8500,
         status: statuses[i % statuses.length],
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
         seller_id: sellerIds[i % sellerIds.length],
         total_amount: (i + 1) * 10000,
         platform_fee: (i + 1) * 1500,
         payout_amount: (i + 1) * 8500,
         currency: 'KRW',
         status: i % 3 === 0 ? 'PENDING' : 'PAID',
         period_start: new Date(new Date().setDate(1)),
         period_end: new Date(),
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

   const levels = [1, 2]
   const statuses: Array<'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'APPROVED' | 'REJECTED' | 'CANCELLED'> = [
     'PENDING',
     'IN_PROGRESS',
     'COMPLETED',
     'REJECTED',
   ]

   for (let i = 0; i < productIds.length; i++) {
     const verification = await prisma.verification.create({
       data: {
         product_id: productIds[i],
         level: levels[i % levels.length],
         status: statuses[i % statuses.length],
         verifier_id: i % 2 === 0 ? `verifier-${i}` : null,
         fee: 5000,
         platform_share: 2500,
         verifier_share: 2500,
         assigned_at: i % 2 === 0 ? new Date() : null,
         completed_at: i % 4 === 0 ? new Date() : null,
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
