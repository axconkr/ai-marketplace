/**
 * Authentication Service Tests
 * Tests for JWT token verification
 */

import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { verifyToken, hasRole, TokenPayload } from '@/lib/auth/verify-token';

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
    it('should verify valid JWT token', () => {
      const payload: TokenPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'buyer',
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
      const request = new NextRequest('http://localhost:3000', {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const result = verifyToken(request);

      expect(result).not.toBeNull();
      expect(result?.userId).toBe(payload.userId);
      expect(result?.email).toBe(payload.email);
      expect(result?.role).toBe(payload.role);
    });

    it('should handle different user roles', () => {
      const roles = ['buyer', 'seller', 'admin', 'verifier'];

      roles.forEach((role) => {
        const payload: TokenPayload = {
          userId: 'user-123',
          email: 'test@example.com',
          role,
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
        const request = new NextRequest('http://localhost:3000', {
          headers: {
            authorization: `Bearer ${token}`,
          },
        });

        const result = verifyToken(request);
        expect(result?.role).toBe(role);
      });
    });
  });

  describe('should reject invalid tokens', () => {
    it('should return null for missing authorization header', () => {
      const request = new NextRequest('http://localhost:3000');
      const result = verifyToken(request);
      expect(result).toBeNull();
    });

    it('should return null for malformed authorization header', () => {
      const request = new NextRequest('http://localhost:3000', {
        headers: {
          authorization: 'InvalidFormat token123',
        },
      });
      const result = verifyToken(request);
      expect(result).toBeNull();
    });

    it('should return null for expired token', () => {
      const payload: TokenPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'buyer',
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '-1h' }); // Expired
      const request = new NextRequest('http://localhost:3000', {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const result = verifyToken(request);
      expect(result).toBeNull();
    });

    it('should return null for token with wrong secret', () => {
      const payload: TokenPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'buyer',
      };

      const token = jwt.sign(payload, 'wrong-secret', { expiresIn: '1h' });
      const request = new NextRequest('http://localhost:3000', {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const result = verifyToken(request);
      expect(result).toBeNull();
    });

    it('should return null for malformed JWT', () => {
      const request = new NextRequest('http://localhost:3000', {
        headers: {
          authorization: 'Bearer invalid.jwt.token',
        },
      });

      const result = verifyToken(request);
      expect(result).toBeNull();
    });

    it('should throw error when JWT_SECRET is not configured', () => {
      delete process.env.JWT_SECRET;

      const payload: TokenPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'buyer',
      };

      const token = jwt.sign(payload, 'any-secret', { expiresIn: '1h' });
      const request = new NextRequest('http://localhost:3000', {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const result = verifyToken(request);
      expect(result).toBeNull();

      // Restore
      process.env.JWT_SECRET = JWT_SECRET;
    });
  });

  describe('hasRole', () => {
    it('should return true when user has required role', () => {
      const user: TokenPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'admin',
      };

      expect(hasRole(user, ['admin'])).toBe(true);
      expect(hasRole(user, ['admin', 'seller'])).toBe(true);
    });

    it('should return false when user does not have required role', () => {
      const user: TokenPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'buyer',
      };

      expect(hasRole(user, ['admin'])).toBe(false);
      expect(hasRole(user, ['admin', 'seller'])).toBe(false);
    });

    it('should return false when user is null', () => {
      expect(hasRole(null, ['admin'])).toBe(false);
    });

    it('should handle multiple roles', () => {
      const user: TokenPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'seller',
      };

      expect(hasRole(user, ['buyer', 'seller', 'admin'])).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle token without Bearer prefix', () => {
      const payload: TokenPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'buyer',
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
      const request = new NextRequest('http://localhost:3000', {
        headers: {
          authorization: token, // Missing 'Bearer '
        },
      });

      const result = verifyToken(request);
      expect(result).toBeNull();
    });

    it('should handle empty authorization header', () => {
      const request = new NextRequest('http://localhost:3000', {
        headers: {
          authorization: '',
        },
      });

      const result = verifyToken(request);
      expect(result).toBeNull();
    });

    it('should handle authorization header with only Bearer', () => {
      const request = new NextRequest('http://localhost:3000', {
        headers: {
          authorization: 'Bearer ',
        },
      });

      const result = verifyToken(request);
      expect(result).toBeNull();
    });
  });
});
