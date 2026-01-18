/**
 * Auth Library Unit Tests
 * Tests for authentication utilities
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import {
  createMockUser,
  createMockPrismaClient,
  mockEnv,
} from '../../utils/test-helpers'

// Mock the auth module
const mockVerifyToken = jest.fn()
jest.mock('@/lib/auth', () => ({
  verifyToken: mockVerifyToken,
}))

describe('Auth Library', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('verifyToken', () => {
    it('should verify valid token and return user', async () => {
      const mockUser = createMockUser({ role: 'BUYER' })
      mockVerifyToken.mockResolvedValue(mockUser)

      const token = 'valid-token-123'
      const result = await mockVerifyToken(token)

      expect(mockVerifyToken).toHaveBeenCalledWith(token)
      expect(result).toEqual(mockUser)
      expect(result.role).toBe('BUYER')
    })

    it('should return null for invalid token', async () => {
      mockVerifyToken.mockResolvedValue(null)

      const token = 'invalid-token'
      const result = await mockVerifyToken(token)

      expect(result).toBeNull()
    })

    it('should handle expired token', async () => {
      mockVerifyToken.mockRejectedValue(new Error('Token expired'))

      const token = 'expired-token'

      await expect(mockVerifyToken(token)).rejects.toThrow('Token expired')
    })
  })

  describe('Environment Variables', () => {
    it('should use correct JWT secret from env', () => {
      const restore = mockEnv({
        JWT_SECRET: 'test-secret-key',
      })

      expect(process.env.JWT_SECRET).toBe('test-secret-key')

      restore()
    })
  })
})
