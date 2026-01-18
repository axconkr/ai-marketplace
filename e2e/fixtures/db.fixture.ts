/**
 * Playwright Database Fixtures
 * Database seeding and cleanup for E2E tests
 */

import { test as base } from '@playwright/test'
import { PrismaClient } from '@prisma/client'

// ============================================================================
// Database Connection
// ============================================================================

let prisma: PrismaClient | null = null

function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test',
        },
      },
    })
  }
  return prisma
}

// ============================================================================
// Database Cleanup
// ============================================================================

export async function cleanDatabase() {
  const client = getPrismaClient()

  // Delete in order respecting foreign key constraints
  await client.verification.deleteMany()
  await client.settlement.deleteMany()
  await client.order.deleteMany()
  await client.product.deleteMany()
  await client.sellerProfile.deleteMany()
  await client.user.deleteMany()
}

// ============================================================================
// Database Seeding
// ============================================================================

/**
 * Seed test users for E2E tests
 */
export async function seedTestUsers() {
  const client = getPrismaClient()

  const buyer = await client.user.create({
    data: {
      email: 'test-buyer@example.com',
      name: 'Test Buyer',
      password: '$2a$10$YourHashedPasswordHere', // bcrypt hash of 'TestPassword123!'
      role: 'BUYER',
      emailVerified: new Date(),
    },
  })

  const seller = await client.user.create({
    data: {
      email: 'test-seller@example.com',
      name: 'Test Seller',
      password: '$2a$10$YourHashedPasswordHere',
      role: 'SELLER',
      emailVerified: new Date(),
    },
  })

  const admin = await client.user.create({
    data: {
      email: 'test-admin@example.com',
      name: 'Test Admin',
      password: '$2a$10$YourHashedPasswordHere',
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  })

  return { buyer, seller, admin }
}

/**
 * Seed seller profile
 */
export async function seedSellerProfile(userId: string) {
  const client = getPrismaClient()

  return await client.sellerProfile.create({
    data: {
      userId,
      businessName: 'Test Business Inc.',
      businessNumber: '123-45-67890',
      businessEmail: 'business@test.com',
      phoneNumber: '010-1234-5678',
      bankName: 'Test Bank',
      accountNumber: '1234567890',
      accountHolder: 'Test Holder',
      isVerified: true,
      verifiedAt: new Date(),
    },
  })
}

/**
 * Seed test products
 */
export async function seedTestProducts(sellerId: string) {
  const client = getPrismaClient()

  const products = await Promise.all([
    client.product.create({
      data: {
        sellerId,
        title: 'Test N8N Template',
        description: 'Test automation template',
        category: 'N8N_TEMPLATE',
        price: 50000,
        status: 'ACTIVE',
      },
    }),
    client.product.create({
      data: {
        sellerId,
        title: 'Test Make Scenario',
        description: 'Test Make.com scenario',
        category: 'MAKE_SCENARIO',
        price: 30000,
        status: 'ACTIVE',
      },
    }),
    client.product.create({
      data: {
        sellerId,
        title: 'Test AI Agent',
        description: 'Test AI automation agent',
        category: 'AI_AGENT',
        price: 100000,
        status: 'ACTIVE',
      },
    }),
  ])

  return products
}

/**
 * Seed complete test database
 */
export async function seedCompleteDatabase() {
  await cleanDatabase()

  const users = await seedTestUsers()
  const sellerProfile = await seedSellerProfile(users.seller.id)
  const products = await seedTestProducts(users.seller.id)

  return {
    users,
    sellerProfile,
    products,
  }
}

// ============================================================================
// Fixtures
// ============================================================================

type DatabaseFixtures = {
  cleanDb: void
  seededDb: {
    users: {
      buyer: any
      seller: any
      admin: any
    }
    products: any[]
  }
}

/**
 * Extended test with database fixtures
 */
export const test = base.extend<DatabaseFixtures>({
  /**
   * Clean database before and after test
   */
  cleanDb: [
    async ({}, use) => {
      await cleanDatabase()
      await use()
      await cleanDatabase()
    },
    { auto: true },
  ],

  /**
   * Seeded database with test data
   */
  seededDb: async ({}, use) => {
    const data = await seedCompleteDatabase()
    await use(data)
    await cleanDatabase()
  },
})

// ============================================================================
// Cleanup
// ============================================================================

/**
 * Close database connection
 */
export async function closeDatabase() {
  if (prisma) {
    await prisma.$disconnect()
    prisma = null
  }
}

// Global teardown
if (typeof afterAll !== 'undefined') {
  afterAll(async () => {
    await closeDatabase()
  })
}
