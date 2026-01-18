/**
 * API endpoint tests for subscription system
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Subscription API Endpoints', () => {
  let testUserId: string;
  let authToken: string;

  beforeAll(async () => {
    // Create test user
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash('testpassword123', 10);

    const testUser = await prisma.user.create({
      data: {
        email: `test-api-sub-${Date.now()}@example.com`,
        name: 'Test API User',
        password: hashedPassword,
        emailVerified: true,
      },
    });
    testUserId = testUser.id;

    // Generate auth token (simplified - adapt to your auth system)
    const jwt = await import('jsonwebtoken');
    authToken = jwt.sign(
      { userId: testUserId, email: testUser.email },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    // Cleanup
    await prisma.subscription.deleteMany({
      where: { userId: testUserId },
    });
    await prisma.user.delete({
      where: { id: testUserId },
    });
    await prisma.$disconnect();
  });

  describe('GET /api/subscriptions/plans', () => {
    it('should return all subscription plans', async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/subscriptions/plans`
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(4);
      expect(data.data[0]).toHaveProperty('tier');
      expect(data.data[0]).toHaveProperty('name');
      expect(data.data[0]).toHaveProperty('monthlyPrice');
      expect(data.data[0]).toHaveProperty('yearlyPrice');
      expect(data.data[0]).toHaveProperty('features');
    });
  });

  describe('GET /api/subscriptions', () => {
    it('should return 401 without auth', async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/subscriptions`
      );

      expect(response.status).toBe(401);
    });

    it('should return null for user without subscription', async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/subscriptions`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toBeNull();
    });
  });

  describe('POST /api/subscriptions/checkout', () => {
    it('should create checkout session', async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/subscriptions/checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            tier: 'BASIC',
            interval: 'MONTHLY',
          }),
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('sessionId');
      expect(data.data).toHaveProperty('url');
    });

    it('should validate input', async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/subscriptions/checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            tier: 'INVALID_TIER',
            interval: 'MONTHLY',
          }),
        }
      );

      expect(response.status).toBe(500);
    });
  });
});
