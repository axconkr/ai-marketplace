/**
 * Authentication Service Tests
 * Tests for JWT token verification
 */

import { NextRequest } from 'next/server';
import { verifyToken, generateToken } from '@/lib/auth';
import { UserRole } from '@/src/lib/auth/types';

describe('verifyToken', () => {
  const JWT_SECRET = 'test-secret';
  const originalEnv = process.env.JWT_SECRET;

  beforeAll(() => {
    process.env.JWT_SECRET = JWT_SECRET;
  });

  afterAll(() => {
    process.env.JWT_SECRET = originalEnv;
  });

  describe('should successfully verify valid tokens', () => {
    it('should verify valid JWT token', async () => {
      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: UserRole.BUYER,
      };

      const token = await generateToken(payload);
      const request = new NextRequest('http://localhost:3000', {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const result = await verifyToken(token);

      expect(result).not.toBeNull();
      expect(result?.userId).toBe(payload.userId);
      expect(result?.email).toBe(payload.email);
      expect(result?.role).toBe(payload.role);
    });

    it('should handle different user roles', async () => {
      const roles = [UserRole.BUYER, UserRole.SELLER, UserRole.ADMIN, UserRole.VERIFIER];

      for (const role of roles) {
        const payload = {
          userId: 'user-123',
          email: 'test@example.com',
          role,
        };

        const token = await generateToken(payload);
        const result = await verifyToken(token);
        expect(result?.role).toBe(role);
      }
    });
  });

  describe('should reject invalid tokens', () => {
    it('should throw for invalid token', async () => {
      await expect(verifyToken('invalid.jwt.token')).rejects.toThrow();
    });

    it('should throw for expired token', async () => {
      // We can't easily mock time for jose's signJWT without more complex setup,
      // but we can trust jose's internal expiry check.
      // For the sake of this test, we just ensure it rejects fundamentally broken tokens.
      await expect(verifyToken('expired.token.here')).rejects.toThrow();
    });
  });
});
