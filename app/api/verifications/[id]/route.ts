/**
 * GET /api/verifications/[id] - Get verification details
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const verificationId = params.id;

    // Authenticate user
    const user = await requireAuth(request);

    const verification = await prisma.verification.findUnique({
      where: { id: verificationId },
      include: {
        product: {
          include: {
            files: true,
            seller: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        verifier: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!verification) {
      return NextResponse.json({ error: 'Verification not found' }, { status: 404 });
    }

    // Authorization check
    const isOwner = verification.product.seller_id === user.userId;
    const isVerifier = verification.verifier_id === user.userId;
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isVerifier && !isAdmin) {
      return NextResponse.json(
        { error: 'Not authorized to view this verification' },
        { status: 403 }
      );
    }

    return NextResponse.json({ verification });
  } catch (error: any) {
    console.error('Error fetching verification:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch verification' },
      { status: 500 }
    );
  }
}
