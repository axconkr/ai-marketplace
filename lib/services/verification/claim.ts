/**
 * Verification Claim Service
 * Handles verifier self-assignment and claim logic
 */

import { prisma } from '@/lib/db';
import { sendVerificationAssignment } from '../email-notifications';
import { notifyVerificationClaimed } from '../notification-service';
import { VerificationStatus } from '@prisma/client';

// ============================================================================
// CLAIM VERIFICATION
// ============================================================================

/**
 * Claim verification (verifier self-assign)
 *
 * Business Rules:
 * - Only PENDING verifications can be claimed
 * - Verifier must not be the product seller
 * - First-come-first-served basis
 * - Automatically sends assignment notification
 */
export async function claimVerification(
  verificationId: string,
  verifierId: string
) {
  // 1. Get verification with product details
  const verification = await prisma.verification.findUnique({
    where: { id: verificationId },
    include: {
      product: {
        select: {
          seller_id: true,
        },
      },
    },
  });

  if (!verification) {
    throw new Error('Verification not found');
  }

  // 2. Validate status - only PENDING can be claimed
  if (verification.status !== 'PENDING') {
    throw new Error(`Verification is not available. Current status: ${verification.status}`);
  }

  // 3. Check if already assigned
  if (verification.verifier_id && verification.verifier_id !== verifierId) {
    throw new Error('Verification is already assigned to another verifier');
  }

  // 4. Prevent seller from verifying their own product
  if (verification.product.seller_id === verifierId) {
    throw new Error('You cannot verify your own product');
  }

  // 5. Update verification status
  const updated = await prisma.verification.update({
    where: { id: verificationId },
    data: {
      verifier_id: verifierId,
      status: 'ASSIGNED' as VerificationStatus,
      assigned_at: new Date(),
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
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

  // 6. Send assignment notification to verifier
  try {
    await sendVerificationAssignment(verifierId, verificationId);
    console.log(`✅ Verification ${verificationId} claimed by verifier ${verifierId}`);
  } catch (error) {
    // Log but don't fail the claim if notification fails
    console.error('Failed to send assignment notification:', error);
  }

  // 7. Send assignment notification to seller (Real-time)
  try {
    await notifyVerificationClaimed(verificationId);
  } catch (error) {
    console.error('Failed to send real-time notification to seller:', error);
  }

  return updated;
}

/**
 * Check if verification can be claimed
 */
export async function canClaimVerification(
  verificationId: string,
  verifierId: string
): Promise<{ canClaim: boolean; reason?: string }> {
  const verification = await prisma.verification.findUnique({
    where: { id: verificationId },
    include: {
      product: {
        select: {
          seller_id: true,
        },
      },
    },
  });

  if (!verification) {
    return {
      canClaim: false,
      reason: 'Verification not found',
    };
  }

  if (verification.status !== 'PENDING') {
    return {
      canClaim: false,
      reason: `Verification is ${verification.status.toLowerCase()}`,
    };
  }

  if (verification.verifier_id && verification.verifier_id !== verifierId) {
    return {
      canClaim: false,
      reason: 'Already assigned to another verifier',
    };
  }

  if (verification.product.seller_id === verifierId) {
    return {
      canClaim: false,
      reason: 'Cannot verify your own product',
    };
  }

  return { canClaim: true };
}

/**
 * Get verifier's claimed verifications
 */
export async function getClaimedVerifications(
  verifierId: string,
  options?: {
    status?: VerificationStatus[];
    page?: number;
    limit?: number;
  }
) {
  const page = options?.page || 1;
  const limit = options?.limit || 10;
  const skip = (page - 1) * limit;

  const where: any = {
    verifier_id: verifierId,
  };

  if (options?.status && options.status.length > 0) {
    where.status = { in: options.status };
  }

  const [verifications, total] = await Promise.all([
    prisma.verification.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            seller: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        assigned_at: 'desc',
      },
      skip,
      take: limit,
    }),
    prisma.verification.count({ where }),
  ]);

  return {
    verifications,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Unclaim verification (if not yet started)
 */
export async function unclaimVerification(
  verificationId: string,
  verifierId: string
) {
  const verification = await prisma.verification.findUnique({
    where: { id: verificationId },
  });

  if (!verification) {
    throw new Error('Verification not found');
  }

  if (verification.verifier_id !== verifierId) {
    throw new Error('Not authorized to unclaim this verification');
  }

  // Can only unclaim if ASSIGNED (not yet started)
  if (verification.status !== 'ASSIGNED') {
    throw new Error(
      `Cannot unclaim verification with status: ${verification.status}. Only ASSIGNED verifications can be unclaimed.`
    );
  }

  // Reset to PENDING
  return await prisma.verification.update({
    where: { id: verificationId },
    data: {
      verifier_id: null,
      status: 'PENDING' as VerificationStatus,
      assigned_at: null,
    },
  });
}
