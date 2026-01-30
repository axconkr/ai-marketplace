/**
 * POST /api/verifications - Request verification
 * GET /api/verifications - List verifications
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, requireRole } from '@/lib/auth';
import { UserRole } from '@/src/lib/auth/types';
import { runLevel0Verification } from '@/lib/services/verification/level0';
import { requestLevel1Verification } from '@/lib/services/verification/level1';
import { processVerificationFee } from '@/lib/services/verification/payment';
import { VerificationStatus } from '@prisma/client';

// ============================================================================
// POST - Request Verification
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Authenticate user - sellers and admins can request verification
    const user = await requireRole(request, [UserRole.SELLER, UserRole.ADMIN]);

    const body = await request.json();
    const { productId, level } = body;

    // Validate inputs
    if (!productId || level === undefined) {
      return NextResponse.json(
        { error: 'Product ID and level are required' },
        { status: 400 }
      );
    }

    if (![0, 1, 2, 3].includes(level)) {
      return NextResponse.json(
        { error: 'Invalid verification level' },
        { status: 400 }
      );
    }

    // Verify product ownership
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { seller_id: true },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (product.seller_id !== user.userId) {
      return NextResponse.json(
        { error: 'Not authorized to request verification for this product' },
        { status: 403 }
      );
    }

    // Check if verification already in progress
    const existingVerification = await prisma.verification.findFirst({
      where: {
        product_id: productId,
        status: {
          in: ['PENDING', 'ASSIGNED', 'IN_PROGRESS'] as VerificationStatus[],
        },
      },
    });

    if (existingVerification) {
      return NextResponse.json(
        { error: 'Verification already in progress for this product' },
        { status: 409 }
      );
    }

    let verification;

    // Handle Level 0 (automatic, free)
    if (level === 0) {
      verification = await runLevel0Verification(productId);

      return NextResponse.json({
        verification,
        message:
          verification.status === 'APPROVED'
            ? 'Product passed automatic verification'
            : 'Product failed automatic verification. Please fix the issues.',
      });
    }
    // Handle Level 1+ (requires payment)
    if (level >= 1) {
      // Create payment intent
      const paymentIntent = await processVerificationFee(productId, level, user.userId);

      if (!paymentIntent) {
        return NextResponse.json(
          { error: 'Failed to create payment intent' },
          { status: 500 }
        );
      }

      // Create verification request (will be activated after payment)
      verification = await requestLevel1Verification(productId);

      return NextResponse.json({
        verification,
        paymentIntent: {
          id: paymentIntent.id,
          clientSecret: paymentIntent.clientSecret,
          amount: paymentIntent.amount,
        },
        message: 'Payment required to proceed with verification',
      });
    }
    return NextResponse.json({ error: 'Invalid level' }, { status: 400 });
  } catch (error: any) {
    console.error('Error requesting verification:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to request verification' },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET - List Verifications
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // Authenticate user - any authenticated user can list their verifications
    const user = await requireAuth(request);

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') as VerificationStatus | null;
    const level = searchParams.get('level');
    const verifierId = searchParams.get('verifierId');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Filter by level
    if (level !== null) {
      where.level = parseInt(level);
    }

    // Filter by verifier
    if (verifierId) {
      where.verifier_id = verifierId;
    }

    // User role-based filtering
    if (user.role === 'admin') {
      // Admins can see all
    } else if (user.role === 'verifier') {
      // Verifiers see their assigned verifications
      where.verifier_id = user.userId;
    } else {
      // Sellers see their product verifications
      where.product = {
        seller_id: user.userId,
      };
    }

    const [verifications, total] = await Promise.all([
      prisma.verification.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              seller: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          verifier: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          requested_at: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.verification.count({ where }),
    ]);

    return NextResponse.json({
      verifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error listing verifications:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list verifications' },
      { status: 500 }
    );
  }
}
