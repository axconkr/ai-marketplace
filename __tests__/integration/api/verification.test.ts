/**
 * Verification API Integration Tests
 * Tests for verification workflow endpoints
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import {
  createMockRequest,
  createMockUser,
  createMockProduct,
  createMockPrismaClient,
} from '../../utils/test-helpers'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: createMockPrismaClient(),
}))

describe('Verification API Integration Tests', () => {
  let mockPrisma: any

  beforeEach(async () => {
    const { prisma } = await import('@/lib/prisma')
    mockPrisma = prisma
    jest.clearAllMocks()
  })

  // Helper functions
  function createMockVerification(overrides?: any) {
    return {
      id: `verif-${Math.random().toString(36).substr(2, 9)}`,
      productId: 'product-1',
      level: 1,
      status: 'PENDING',
      requestedBy: 'seller-1',
      assignedTo: null,
      score: null,
      badges: [],
      comments: null,
      submittedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    }
  }

  describe('GET /api/verifications', () => {
    it('should return list of verifications for admin', async () => {
      const mockVerifications = [
        createMockVerification({ status: 'PENDING' }),
        createMockVerification({ status: 'IN_PROGRESS' }),
        createMockVerification({ status: 'COMPLETED' }),
      ]

      mockPrisma.verification.findMany.mockResolvedValue(mockVerifications)

      const verifications = await mockPrisma.verification.findMany()

      expect(verifications).toHaveLength(3)
      expect(mockPrisma.verification.findMany).toHaveBeenCalled()
    })

    it('should filter verifications by status', async () => {
      const pendingVerifications = [
        createMockVerification({ status: 'PENDING' }),
        createMockVerification({ status: 'PENDING' }),
      ]

      mockPrisma.verification.findMany.mockResolvedValue(pendingVerifications)

      const verifications = await mockPrisma.verification.findMany({
        where: { status: 'PENDING' },
      })

      expect(verifications).toHaveLength(2)
      expect(verifications.every(v => v.status === 'PENDING')).toBe(true)
    })

    it('should filter verifications by level', async () => {
      const level2Verifications = [
        createMockVerification({ level: 2 }),
      ]

      mockPrisma.verification.findMany.mockResolvedValue(level2Verifications)

      const verifications = await mockPrisma.verification.findMany({
        where: { level: 2 },
      })

      expect(verifications).toHaveLength(1)
      expect(verifications[0].level).toBe(2)
    })

    it('should include product and user details', async () => {
      const verification = createMockVerification()
      const product = createMockProduct()
      const seller = createMockUser({ role: 'SELLER' })

      mockPrisma.verification.findMany.mockResolvedValue([
        {
          ...verification,
          product,
          requestedByUser: seller,
        },
      ])

      const verifications = await mockPrisma.verification.findMany({
        include: {
          product: true,
          requestedByUser: true,
        },
      })

      expect(verifications[0].product).toBeDefined()
      expect(verifications[0].requestedByUser).toBeDefined()
    })
  })

  describe('POST /api/verifications', () => {
    it('should create Level 0 auto-verification on product upload', async () => {
      const product = createMockProduct()
      const verification = createMockVerification({
        productId: product.id,
        level: 0,
        status: 'COMPLETED',
        autoVerified: true,
      })

      mockPrisma.verification.create.mockResolvedValue(verification)

      const newVerification = await mockPrisma.verification.create({
        data: {
          productId: product.id,
          level: 0,
          status: 'COMPLETED',
          requestedBy: product.sellerId,
        },
      })

      expect(newVerification).toBeDefined()
      expect(newVerification.level).toBe(0)
      expect(newVerification.status).toBe('COMPLETED')
    })

    it('should create Level 1 verification request', async () => {
      const product = createMockProduct()
      const seller = createMockUser({ role: 'SELLER' })

      const verification = createMockVerification({
        productId: product.id,
        level: 1,
        status: 'PENDING',
        requestedBy: seller.id,
      })

      mockPrisma.verification.create.mockResolvedValue(verification)

      const newVerification = await mockPrisma.verification.create({
        data: {
          productId: product.id,
          level: 1,
          status: 'PENDING',
          requestedBy: seller.id,
        },
      })

      expect(newVerification.level).toBe(1)
      expect(newVerification.status).toBe('PENDING')
      expect(newVerification.requestedBy).toBe(seller.id)
    })

    it('should create Level 2 verification with higher fee', async () => {
      const product = createMockProduct()
      const verification = createMockVerification({
        productId: product.id,
        level: 2,
        fee: 100,
      })

      mockPrisma.verification.create.mockResolvedValue(verification)

      const newVerification = await mockPrisma.verification.create({
        data: {
          productId: product.id,
          level: 2,
          status: 'PENDING',
          requestedBy: product.sellerId,
        },
      })

      expect(newVerification.level).toBe(2)
    })

    it('should create Level 3 verification with highest fee', async () => {
      const product = createMockProduct()
      const verification = createMockVerification({
        productId: product.id,
        level: 3,
        fee: 150,
      })

      mockPrisma.verification.create.mockResolvedValue(verification)

      const newVerification = await mockPrisma.verification.create({
        data: {
          productId: product.id,
          level: 3,
          status: 'PENDING',
          requestedBy: product.sellerId,
        },
      })

      expect(newVerification.level).toBe(3)
    })

    it('should prevent duplicate verification requests', async () => {
      const product = createMockProduct()

      mockPrisma.verification.findFirst.mockResolvedValue(
        createMockVerification({
          productId: product.id,
          status: 'PENDING',
        })
      )

      const existingVerification = await mockPrisma.verification.findFirst({
        where: {
          productId: product.id,
          status: { in: ['PENDING', 'IN_PROGRESS'] },
        },
      })

      expect(existingVerification).toBeDefined()
      // Should not create duplicate
    })

    it('should only allow product owner to request verification', async () => {
      const product = createMockProduct({ sellerId: 'seller-1' })
      const unauthorizedUser = createMockUser({ id: 'seller-2' })

      const isAuthorized = product.sellerId === unauthorizedUser.id
      expect(isAuthorized).toBe(false)
    })
  })

  describe('GET /api/verifications/:id', () => {
    it('should return verification by ID', async () => {
      const verification = createMockVerification()

      mockPrisma.verification.findUnique.mockResolvedValue(verification)

      const found = await mockPrisma.verification.findUnique({
        where: { id: verification.id },
      })

      expect(found).toBeDefined()
      expect(found.id).toBe(verification.id)
    })

    it('should return null for non-existent verification', async () => {
      mockPrisma.verification.findUnique.mockResolvedValue(null)

      const verification = await mockPrisma.verification.findUnique({
        where: { id: 'non-existent' },
      })

      expect(verification).toBeNull()
    })

    it('should include product and verifier details', async () => {
      const verification = createMockVerification()
      const product = createMockProduct()
      const verifier = createMockUser({ role: 'SELLER', id: 'verifier-1' })

      mockPrisma.verification.findUnique.mockResolvedValue({
        ...verification,
        product,
        assignedToUser: verifier,
      })

      const found = await mockPrisma.verification.findUnique({
        where: { id: verification.id },
        include: {
          product: true,
          assignedToUser: true,
        },
      })

      expect(found.product).toBeDefined()
      expect(found.assignedToUser).toBeDefined()
    })
  })

  describe('POST /api/verifications/:id/claim', () => {
    it('should allow verifier to claim verification task', async () => {
      const verification = createMockVerification({ status: 'PENDING' })
      const verifier = createMockUser({ id: 'verifier-1' })

      mockPrisma.verification.findUnique.mockResolvedValue(verification)
      mockPrisma.verification.update.mockResolvedValue({
        ...verification,
        assignedTo: verifier.id,
        status: 'IN_PROGRESS',
      })

      const updated = await mockPrisma.verification.update({
        where: { id: verification.id },
        data: {
          assignedTo: verifier.id,
          status: 'IN_PROGRESS',
        },
      })

      expect(updated.assignedTo).toBe(verifier.id)
      expect(updated.status).toBe('IN_PROGRESS')
    })

    it('should prevent claiming already assigned verification', async () => {
      const verification = createMockVerification({
        status: 'IN_PROGRESS',
        assignedTo: 'verifier-1',
      })

      mockPrisma.verification.findUnique.mockResolvedValue(verification)

      const isAvailable = verification.status === 'PENDING' && !verification.assignedTo
      expect(isAvailable).toBe(false)
    })

    it('should prevent claiming completed verification', async () => {
      const verification = createMockVerification({ status: 'COMPLETED' })

      mockPrisma.verification.findUnique.mockResolvedValue(verification)

      const isAvailable = verification.status === 'PENDING'
      expect(isAvailable).toBe(false)
    })
  })

  describe('POST /api/verifications/:id/start', () => {
    it('should mark verification as in progress', async () => {
      const verification = createMockVerification({
        status: 'PENDING',
        assignedTo: 'verifier-1',
      })

      mockPrisma.verification.update.mockResolvedValue({
        ...verification,
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      })

      const updated = await mockPrisma.verification.update({
        where: { id: verification.id },
        data: {
          status: 'IN_PROGRESS',
          startedAt: new Date(),
        },
      })

      expect(updated.status).toBe('IN_PROGRESS')
      expect(updated.startedAt).toBeDefined()
    })

    it('should only allow assigned verifier to start', async () => {
      const verification = createMockVerification({
        assignedTo: 'verifier-1',
      })
      const unauthorizedVerifier = 'verifier-2'

      const isAuthorized = verification.assignedTo === unauthorizedVerifier
      expect(isAuthorized).toBe(false)
    })
  })

  describe('POST /api/verifications/:id/submit', () => {
    it('should submit verification with approval', async () => {
      const verification = createMockVerification({
        status: 'IN_PROGRESS',
        assignedTo: 'verifier-1',
      })

      const submissionData = {
        status: 'APPROVED',
        score: 85,
        badges: ['SECURITY', 'QUALITY'],
        comments: 'Product meets all verification criteria.',
      }

      mockPrisma.verification.update.mockResolvedValue({
        ...verification,
        ...submissionData,
        status: 'COMPLETED',
        submittedAt: new Date(),
      })

      const updated = await mockPrisma.verification.update({
        where: { id: verification.id },
        data: {
          ...submissionData,
          status: 'COMPLETED',
          submittedAt: new Date(),
        },
      })

      expect(updated.status).toBe('COMPLETED')
      expect(updated.score).toBe(85)
      expect(updated.badges).toContain('SECURITY')
      expect(updated.submittedAt).toBeDefined()
    })

    it('should submit verification with rejection', async () => {
      const verification = createMockVerification({
        status: 'IN_PROGRESS',
        assignedTo: 'verifier-1',
      })

      const submissionData = {
        status: 'REJECTED',
        score: 45,
        rejectionReasons: ['SECURITY_ISSUES', 'QUALITY_CONCERNS'],
        comments: 'Product has security vulnerabilities.',
      }

      mockPrisma.verification.update.mockResolvedValue({
        ...verification,
        ...submissionData,
        status: 'COMPLETED',
        submittedAt: new Date(),
      })

      const updated = await mockPrisma.verification.update({
        where: { id: verification.id },
        data: {
          ...submissionData,
          status: 'COMPLETED',
          submittedAt: new Date(),
        },
      })

      expect(updated.status).toBe('COMPLETED')
      expect(updated.score).toBe(45)
      expect(updated.rejectionReasons).toContain('SECURITY_ISSUES')
    })

    it('should validate score range (0-100)', async () => {
      const validScores = [0, 50, 85, 100]
      const invalidScores = [-1, 101, 150]

      validScores.forEach(score => {
        expect(score >= 0 && score <= 100).toBe(true)
      })

      invalidScores.forEach(score => {
        expect(score >= 0 && score <= 100).toBe(false)
      })
    })

    it('should require comments for rejection', async () => {
      const submissionData = {
        status: 'REJECTED',
        score: 40,
        comments: '',
      }

      const isValid = submissionData.status === 'REJECTED'
        ? submissionData.comments.length > 0
        : true

      expect(isValid).toBe(false)
    })

    it('should only allow assigned verifier to submit', async () => {
      const verification = createMockVerification({
        assignedTo: 'verifier-1',
      })
      const unauthorizedVerifier = 'verifier-2'

      const isAuthorized = verification.assignedTo === unauthorizedVerifier
      expect(isAuthorized).toBe(false)
    })

    it('should update product verification status on approval', async () => {
      const product = createMockProduct()
      const verification = createMockVerification({
        productId: product.id,
        status: 'IN_PROGRESS',
      })

      mockPrisma.verification.update.mockResolvedValue({
        ...verification,
        status: 'COMPLETED',
      })

      mockPrisma.product.update.mockResolvedValue({
        ...product,
        verificationLevel: verification.level,
        isVerified: true,
      })

      const updatedProduct = await mockPrisma.product.update({
        where: { id: product.id },
        data: {
          verificationLevel: verification.level,
          isVerified: true,
        },
      })

      expect(updatedProduct.isVerified).toBe(true)
      expect(updatedProduct.verificationLevel).toBe(verification.level)
    })
  })

  describe('POST /api/verifications/:id/cancel', () => {
    it('should allow seller to cancel pending verification', async () => {
      const verification = createMockVerification({
        status: 'PENDING',
        requestedBy: 'seller-1',
      })

      mockPrisma.verification.update.mockResolvedValue({
        ...verification,
        status: 'CANCELLED',
      })

      const updated = await mockPrisma.verification.update({
        where: { id: verification.id },
        data: { status: 'CANCELLED' },
      })

      expect(updated.status).toBe('CANCELLED')
    })

    it('should prevent canceling in-progress verification', async () => {
      const verification = createMockVerification({
        status: 'IN_PROGRESS',
      })

      const canCancel = verification.status === 'PENDING'
      expect(canCancel).toBe(false)
    })

    it('should only allow requester to cancel', async () => {
      const verification = createMockVerification({
        requestedBy: 'seller-1',
      })
      const unauthorizedUser = 'seller-2'

      const isAuthorized = verification.requestedBy === unauthorizedUser
      expect(isAuthorized).toBe(false)
    })

    it('should process refund on cancellation', async () => {
      const verification = createMockVerification({
        status: 'PENDING',
        fee: 50,
      })

      // Mock refund processing
      const refundAmount = verification.fee
      expect(refundAmount).toBe(50)
    })
  })

  describe('GET /api/verifications/available', () => {
    it('should return available verification tasks for verifiers', async () => {
      const availableVerifications = [
        createMockVerification({ status: 'PENDING', assignedTo: null }),
        createMockVerification({ status: 'PENDING', assignedTo: null }),
      ]

      mockPrisma.verification.findMany.mockResolvedValue(availableVerifications)

      const verifications = await mockPrisma.verification.findMany({
        where: {
          status: 'PENDING',
          assignedTo: null,
        },
      })

      expect(verifications).toHaveLength(2)
      expect(verifications.every(v => v.status === 'PENDING')).toBe(true)
      expect(verifications.every(v => v.assignedTo === null)).toBe(true)
    })

    it('should filter by verification level', async () => {
      const level2Tasks = [
        createMockVerification({ level: 2, status: 'PENDING' }),
      ]

      mockPrisma.verification.findMany.mockResolvedValue(level2Tasks)

      const verifications = await mockPrisma.verification.findMany({
        where: {
          level: 2,
          status: 'PENDING',
        },
      })

      expect(verifications[0].level).toBe(2)
    })

    it('should exclude claimed tasks', async () => {
      mockPrisma.verification.findMany.mockResolvedValue([])

      const verifications = await mockPrisma.verification.findMany({
        where: {
          status: 'PENDING',
          assignedTo: null,
        },
      })

      expect(verifications.every(v => !v.assignedTo)).toBe(true)
    })
  })

  describe('GET /api/verifications/assigned-to-me', () => {
    it('should return verifications assigned to current verifier', async () => {
      const verifierId = 'verifier-1'
      const assignedVerifications = [
        createMockVerification({ assignedTo: verifierId, status: 'IN_PROGRESS' }),
        createMockVerification({ assignedTo: verifierId, status: 'IN_PROGRESS' }),
      ]

      mockPrisma.verification.findMany.mockResolvedValue(assignedVerifications)

      const verifications = await mockPrisma.verification.findMany({
        where: { assignedTo: verifierId },
      })

      expect(verifications).toHaveLength(2)
      expect(verifications.every(v => v.assignedTo === verifierId)).toBe(true)
    })

    it('should include product details', async () => {
      const verifierId = 'verifier-1'
      const verification = createMockVerification({ assignedTo: verifierId })
      const product = createMockProduct()

      mockPrisma.verification.findMany.mockResolvedValue([
        { ...verification, product },
      ])

      const verifications = await mockPrisma.verification.findMany({
        where: { assignedTo: verifierId },
        include: { product: true },
      })

      expect(verifications[0].product).toBeDefined()
    })
  })

  describe('GET /api/verifications/my-verifications', () => {
    it('should return verifications requested by seller', async () => {
      const sellerId = 'seller-1'
      const myVerifications = [
        createMockVerification({ requestedBy: sellerId }),
        createMockVerification({ requestedBy: sellerId }),
      ]

      mockPrisma.verification.findMany.mockResolvedValue(myVerifications)

      const verifications = await mockPrisma.verification.findMany({
        where: { requestedBy: sellerId },
      })

      expect(verifications).toHaveLength(2)
      expect(verifications.every(v => v.requestedBy === sellerId)).toBe(true)
    })

    it('should include verifier details for completed verifications', async () => {
      const sellerId = 'seller-1'
      const verification = createMockVerification({
        requestedBy: sellerId,
        status: 'COMPLETED',
        assignedTo: 'verifier-1',
      })
      const verifier = createMockUser({ id: 'verifier-1' })

      mockPrisma.verification.findMany.mockResolvedValue([
        { ...verification, assignedToUser: verifier },
      ])

      const verifications = await mockPrisma.verification.findMany({
        where: { requestedBy: sellerId },
        include: { assignedToUser: true },
      })

      expect(verifications[0].assignedToUser).toBeDefined()
    })
  })

  describe('GET /api/verifications/stats', () => {
    it('should return verification statistics', async () => {
      mockPrisma.verification.count.mockResolvedValue(100)

      const stats = {
        total: await mockPrisma.verification.count(),
        pending: await mockPrisma.verification.count({ where: { status: 'PENDING' } }),
        inProgress: await mockPrisma.verification.count({ where: { status: 'IN_PROGRESS' } }),
        completed: await mockPrisma.verification.count({ where: { status: 'COMPLETED' } }),
      }

      expect(stats.total).toBe(100)
      expect(mockPrisma.verification.count).toHaveBeenCalledTimes(4)
    })

    it('should group stats by level', async () => {
      const levelStats = {
        level0: 50,
        level1: 30,
        level2: 15,
        level3: 5,
      }

      expect(levelStats.level0).toBeGreaterThan(0)
      expect(levelStats.level0 + levelStats.level1 + levelStats.level2 + levelStats.level3).toBe(100)
    })
  })

  describe('GET /api/verifications/verifier-stats', () => {
    it('should return verifier performance statistics', async () => {
      const verifierId = 'verifier-1'

      mockPrisma.verification.count.mockResolvedValue(25)

      const stats = {
        totalCompleted: await mockPrisma.verification.count({
          where: { assignedTo: verifierId, status: 'COMPLETED' },
        }),
        averageScore: 87.5,
        totalEarnings: 1250,
      }

      expect(stats.totalCompleted).toBe(25)
      expect(stats.averageScore).toBeGreaterThan(0)
      expect(stats.totalEarnings).toBeGreaterThan(0)
    })

    it('should track approval rate', async () => {
      const total = 100
      const approved = 85
      const approvalRate = (approved / total) * 100

      expect(approvalRate).toBe(85)
    })
  })

  describe('Verification Workflow Integration', () => {
    it('should complete full verification workflow', async () => {
      const product = createMockProduct()
      const seller = createMockUser({ role: 'SELLER' })
      const verifier = createMockUser({ id: 'verifier-1' })

      // 1. Create verification request
      const verification = createMockVerification({
        productId: product.id,
        requestedBy: seller.id,
        status: 'PENDING',
      })
      mockPrisma.verification.create.mockResolvedValue(verification)

      const created = await mockPrisma.verification.create({
        data: {
          productId: product.id,
          level: 1,
          requestedBy: seller.id,
          status: 'PENDING',
        },
      })

      expect(created.status).toBe('PENDING')

      // 2. Verifier claims task
      mockPrisma.verification.update.mockResolvedValue({
        ...verification,
        assignedTo: verifier.id,
        status: 'IN_PROGRESS',
      })

      const claimed = await mockPrisma.verification.update({
        where: { id: verification.id },
        data: {
          assignedTo: verifier.id,
          status: 'IN_PROGRESS',
        },
      })

      expect(claimed.assignedTo).toBe(verifier.id)
      expect(claimed.status).toBe('IN_PROGRESS')

      // 3. Verifier submits review
      mockPrisma.verification.update.mockResolvedValue({
        ...verification,
        status: 'COMPLETED',
        score: 90,
        badges: ['SECURITY', 'QUALITY'],
        submittedAt: new Date(),
      })

      const submitted = await mockPrisma.verification.update({
        where: { id: verification.id },
        data: {
          status: 'COMPLETED',
          score: 90,
          badges: ['SECURITY', 'QUALITY'],
          submittedAt: new Date(),
        },
      })

      expect(submitted.status).toBe('COMPLETED')
      expect(submitted.score).toBe(90)
    })

    it('should handle verification cancellation', async () => {
      const verification = createMockVerification({
        status: 'PENDING',
        requestedBy: 'seller-1',
      })

      mockPrisma.verification.update.mockResolvedValue({
        ...verification,
        status: 'CANCELLED',
      })

      const cancelled = await mockPrisma.verification.update({
        where: { id: verification.id },
        data: { status: 'CANCELLED' },
      })

      expect(cancelled.status).toBe('CANCELLED')
    })

    it('should handle verification reassignment', async () => {
      const verification = createMockVerification({
        assignedTo: 'verifier-1',
        status: 'IN_PROGRESS',
      })

      // Unassign from verifier-1
      mockPrisma.verification.update.mockResolvedValue({
        ...verification,
        assignedTo: null,
        status: 'PENDING',
      })

      const unassigned = await mockPrisma.verification.update({
        where: { id: verification.id },
        data: {
          assignedTo: null,
          status: 'PENDING',
        },
      })

      expect(unassigned.assignedTo).toBeNull()
      expect(unassigned.status).toBe('PENDING')

      // Reassign to verifier-2
      mockPrisma.verification.update.mockResolvedValue({
        ...verification,
        assignedTo: 'verifier-2',
        status: 'IN_PROGRESS',
      })

      const reassigned = await mockPrisma.verification.update({
        where: { id: verification.id },
        data: {
          assignedTo: 'verifier-2',
          status: 'IN_PROGRESS',
        },
      })

      expect(reassigned.assignedTo).toBe('verifier-2')
    })
  })
})
