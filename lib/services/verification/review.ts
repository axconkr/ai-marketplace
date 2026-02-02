/**
 * Verification Manual Review
 * Handles verifier submission and product updates
 */

import { prisma } from '@/lib/db';
import { sendVerificationComplete } from '../email-notifications';
import { notifyVerificationCompleted } from '../notification-service';
import type { ManualReview, SubmitReviewParams } from './types';
import { createVerifierPayout } from './payment';

// ============================================================================
// REVIEW SUBMISSION
// ============================================================================

/**
 * Start verification review
 */
export async function startVerificationReview(
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
    throw new Error('Not authorized to review this verification');
  }

  if (verification.status !== 'ASSIGNED') {
    throw new Error('Verification not available for review');
  }

  // Update status to IN_PROGRESS
  return await prisma.verification.update({
    where: { id: verificationId },
    data: {
      status: 'IN_PROGRESS',
    },
  });
}

/**
 * Submit manual review and complete verification
 */
export async function submitVerificationReview(params: SubmitReviewParams) {
  const { verificationId, verifierId, review } = params;

  // 1. Get verification with product
  const verification = await prisma.verification.findUnique({
    where: { id: verificationId },
    include: {
      product: true,
    },
  });

  if (!verification) {
    throw new Error('Verification not found');
  }

  if (verification.verifier_id !== verifierId) {
    throw new Error('Not authorized to submit review for this verification');
  }

  if (verification.status !== 'ASSIGNED' && verification.status !== 'IN_PROGRESS') {
    throw new Error('Verification not available for review');
  }

  // 2. Calculate final score
  const report = verification.report as any;
  const automatedScore = calculateAutomatedScore(report);
  const manualScore = review.score;
  const finalScore = (automatedScore + manualScore) / 2;

  // 3. Determine badges based on review and scores
  const badges = determineBadges(review, finalScore);

  // 4. Update verification using transaction
  const result = await prisma.$transaction(async (tx) => {
    // Update verification
    const updatedVerification = await tx.verification.update({
      where: { id: verificationId },
      data: {
        status: review.approved ? 'APPROVED' : 'REJECTED',
        report: {
          ...report,
          manual: {
            ...review,
            reviewedBy: verifierId,
            reviewedAt: new Date().toISOString(),
          },
          finalScore,
        } as any,
        score: finalScore,
        badges,
        reviewed_at: new Date(),
        completed_at: new Date(),
      },
    });

    // Update product
    await tx.product.update({
      where: { id: verification.product_id },
      data: {
        verification_level: review.approved ? verification.level : 0,
        verification_score: finalScore,
        verification_badges: review.approved ? badges : [],
      },
    });

    // Create verifier payout if approved
    if (review.approved && verification.verifier_share > 0) {
      await tx.verifierPayout.create({
        data: {
          verifier_id: verifierId,
          verification_id: verificationId,
          amount: verification.verifier_share,
          status: 'PENDING',
        },
      });

      // Update verifier stats
      await updateVerifierStats(tx, verifierId, review.approved, finalScore);
    }

    return updatedVerification;
  });

  // 5. Send notifications
  await notifyVerificationCompleted(verificationId);
  await sendVerificationComplete(verificationId);

  return result;
}

/**
 * Cancel verification
 */
export async function cancelVerification(
  verificationId: string,
  userId: string,
  isAdmin: boolean
) {
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

  // Check authorization
  const isOwner = verification.product.seller_id === userId;
  if (!isOwner && !isAdmin) {
    throw new Error('Not authorized to cancel this verification');
  }

  // Can only cancel PENDING, ASSIGNED, or IN_PROGRESS
  if (!['PENDING', 'ASSIGNED', 'IN_PROGRESS'].includes(verification.status)) {
    throw new Error('Cannot cancel completed verification');
  }

  // Update verification
  return await prisma.verification.update({
    where: { id: verificationId },
    data: {
      status: 'CANCELLED',
      completed_at: new Date(),
    },
  });
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate automated score from report
 */
function calculateAutomatedScore(report: any): number {
  if (!report) return 0;

  // Level 0 score
  if (report.score !== undefined) {
    return report.score;
  }

  // Level 1+ automated tests
  if (report.automated) {
    const { codeQuality, documentation, dependencies, structure } = report.automated;
    const scores = [
      codeQuality?.score || 0,
      documentation?.score || 0,
      dependencies?.score || 0,
      structure?.score || 0,
    ];
    return scores.reduce((sum, s) => sum + s, 0) / scores.length;
  }

  return 0;
}

/**
 * Determine badges based on review and scores
 */
function determineBadges(review: ManualReview, finalScore: number): string[] {
  const badges: string[] = [];

  // Quality badge (score >= 85)
  if (finalScore >= 85) {
    badges.push('quality');
  }

  // Custom badges from reviewer
  if (review.badges && review.badges.length > 0) {
    badges.push(...review.badges);
  }

  // Remove duplicates
  return Array.from(new Set(badges));
}

/**
 * Update verifier statistics
 */
async function updateVerifierStats(
  tx: any,
  verifierId: string,
  approved: boolean,
  score: number
) {
  const verifier = await tx.user.findUnique({
    where: { id: verifierId },
  });

  if (!verifier) return;

  const stats = verifier.verifier_stats as any || {
    total_verifications: 0,
    total_earnings: 0,
    approval_rate: 0,
    avg_score: 0,
  };

  const totalVerifications = stats.total_verifications + 1;
  const totalApprovals = Math.round(stats.approval_rate * stats.total_verifications) + (approved ? 1 : 0);
  const approvalRate = totalApprovals / totalVerifications;

  const totalScore = stats.avg_score * stats.total_verifications + score;
  const avgScore = totalScore / totalVerifications;

  await tx.user.update({
    where: { id: verifierId },
    data: {
      verifier_stats: {
        total_verifications: totalVerifications,
        total_earnings: stats.total_earnings,
        approval_rate: approvalRate,
        avg_score: avgScore,
      },
    },
  });
}

/**
 * Get verification details for verifier
 */
export async function getVerificationForReview(
  verificationId: string,
  verifierId: string
) {
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
    },
  });

  if (!verification) {
    throw new Error('Verification not found');
  }

  if (verification.verifier_id !== verifierId) {
    throw new Error('Not authorized to view this verification');
  }

  return verification;
}

/**
 * List available verifications (unassigned)
 */
export async function listAvailableVerifications(options?: {
  level?: number;
  page?: number;
  limit?: number;
}) {
  const page = options?.page || 1;
  const limit = options?.limit || 10;
  const skip = (page - 1) * limit;

  const where: any = {
    status: 'PENDING',
  };

  if (options?.level !== undefined) {
    where.level = options.level;
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
          },
        },
      },
      orderBy: {
        requested_at: 'asc',
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

// Claim verification function moved to claim.ts for better separation of concerns
