/**
 * Password Change API Integration Tests
 */

import { NextRequest } from 'next/server';
import { PATCH } from '@/app/api/user/password/route';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { generateAccessToken } from '@/src/lib/auth/jwt';

// Mock rate limiter
jest.mock('@/lib/rate-limit', () => ({
  rateLimit: () => ({
    check: jest.fn().mockResolvedValue({
      limit: 5,
      remaining: 4,
      reset: Date.now() + 900000,
    }),
  }),
}));

describe('Password Change API', () => {
  let testUser: any;
  let authToken: string;

  beforeEach(async () => {
    // Create test user
    const hashedPassword = await hashPassword('OldP@ssw0rd123');
    testUser = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        password: hashedPassword,
        name: 'Test User',
        role: 'user',
      },
    });

    // Generate auth token
    authToken = generateAccessToken({
      id: testUser.id,
      email: testUser.email,
      role: testUser.role,
      name: testUser.name,
    });
  });

  afterEach(async () => {
    // Clean up test user
    if (testUser) {
      await prisma.user.delete({
        where: { id: testUser.id },
      });
    }
  });

  describe('PATCH /api/user/password', () => {
    it('should change password successfully', async () => {
      const request = new NextRequest('http://localhost:3000/api/user/password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          currentPassword: 'OldP@ssw0rd123',
          newPassword: 'NewP@ssw0rd456',
          confirmPassword: 'NewP@ssw0rd456',
        }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('successfully');

      // Verify password was changed in database
      const updatedUser = await prisma.user.findUnique({
        where: { id: testUser.id },
      });
      expect(updatedUser?.password).not.toBe(testUser.password);
    });

    it('should reject incorrect current password', async () => {
      const request = new NextRequest('http://localhost:3000/api/user/password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          currentPassword: 'WrongP@ssw0rd123',
          newPassword: 'NewP@ssw0rd456',
          confirmPassword: 'NewP@ssw0rd456',
        }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('incorrect');
    });

    it('should reject mismatched new passwords', async () => {
      const request = new NextRequest('http://localhost:3000/api/user/password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          currentPassword: 'OldP@ssw0rd123',
          newPassword: 'NewP@ssw0rd456',
          confirmPassword: 'DifferentP@ssw0rd',
        }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid input');
    });

    it('should reject same current and new password', async () => {
      const request = new NextRequest('http://localhost:3000/api/user/password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          currentPassword: 'OldP@ssw0rd123',
          newPassword: 'OldP@ssw0rd123',
          confirmPassword: 'OldP@ssw0rd123',
        }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid input');
    });

    it('should reject weak new password', async () => {
      const request = new NextRequest('http://localhost:3000/api/user/password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          currentPassword: 'OldP@ssw0rd123',
          newPassword: 'weak',
          confirmPassword: 'weak',
        }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid input');
    });

    it('should require authentication', async () => {
      const request = new NextRequest('http://localhost:3000/api/user/password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: 'OldP@ssw0rd123',
          newPassword: 'NewP@ssw0rd456',
          confirmPassword: 'NewP@ssw0rd456',
        }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('Authentication');
    });

    it('should reject password change for OAuth users', async () => {
      // Create OAuth user (no password)
      const oauthUser = await prisma.user.create({
        data: {
          email: `oauth-${Date.now()}@example.com`,
          name: 'OAuth User',
          role: 'user',
          oauthProvider: 'google',
          oauthId: 'google-123',
        },
      });

      const oauthToken = generateAccessToken({
        id: oauthUser.id,
        email: oauthUser.email,
        role: oauthUser.role,
        name: oauthUser.name,
      });

      const request = new NextRequest('http://localhost:3000/api/user/password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${oauthToken}`,
        },
        body: JSON.stringify({
          currentPassword: 'AnyP@ssw0rd123',
          newPassword: 'NewP@ssw0rd456',
          confirmPassword: 'NewP@ssw0rd456',
        }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('OAuth');

      // Clean up
      await prisma.user.delete({
        where: { id: oauthUser.id },
      });
    });
  });
});
