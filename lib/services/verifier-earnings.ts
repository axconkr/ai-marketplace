import { PrismaClient, PayoutStatus, VerificationStatus } from '@prisma/client';
import { startOfMonth, endOfMonth } from 'date-fns';

const prisma = new PrismaClient();

export interface VerifierEarnings {
  payouts: Array<{
    id: string;
    amount: number;
    status: PayoutStatus;
    createdAt: Date;
    verification: {
      id: string;
      level: number;
      completed_at: Date | null;
      product: {
        id: string;
        name: string;
      };
    };
  }>;
  totalEarnings: number;
  verificationCount: number;
  periodStart: Date;
  periodEnd: Date;
}

export interface VerifierStats {
  total_verifications: number;
  total_earnings: number;
  approval_rate: number;
  average_score_given: number;
  average_review_time_hours: number;
}

/**
 * Record verifier earning when verification is completed
 */
export async function recordVerifierEarning(
  verificationId: string,
  verifierId: string,
  amount: number
): Promise<any> {
  // Create payout record
  const payout = await prisma.verifierPayout.create({
    data: {
      verifier_id: verifierId,
      verification_id: verificationId,
      amount,
      status: 'PENDING',
    },
  });

  // Update verifier stats
  const currentStats = await getVerifierStats(verifierId);
  await updateVerifierStats(verifierId, {
    ...currentStats,
    total_verifications: currentStats.total_verifications + 1,
    total_earnings: currentStats.total_earnings + amount,
  });

  return payout;
}

/**
 * Get verifier earnings for a period
 */
export async function getVerifierEarnings(
  verifierId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<VerifierEarnings> {
  const payouts = await prisma.verifierPayout.findMany({
    where: {
      verifier_id: verifierId,
      createdAt: {
        gte: periodStart,
        lt: periodEnd,
      },
    },
    include: {
      verification: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const totalEarnings = payouts.reduce((sum, p) => sum + p.amount, 0);
  const verificationCount = payouts.length;

  return {
    payouts,
    totalEarnings,
    verificationCount,
    periodStart,
    periodEnd,
  };
}

/**
 * Get current month earnings estimate
 */
export async function getCurrentMonthEarnings(verifierId: string) {
  const now = new Date();
  const periodStart = startOfMonth(now);
  const periodEnd = now;

  return getVerifierEarnings(verifierId, periodStart, periodEnd);
}

/**
 * Get earnings breakdown by verification level
 */
export async function getEarningsBreakdown(
  verifierId: string,
  periodStart?: Date,
  periodEnd?: Date
) {
  const where: any = {
    verifier_id: verifierId,
  };

  if (periodStart && periodEnd) {
    where.createdAt = {
      gte: periodStart,
      lt: periodEnd,
    };
  }

  const payouts = await prisma.verifierPayout.findMany({
    where,
    include: {
      verification: {
        select: {
          level: true,
        },
      },
    },
  });

  // Group by level
  const breakdown = payouts.reduce((acc, payout) => {
    const level = payout.verification.level;
    if (!acc[level]) {
      acc[level] = {
        level,
        count: 0,
        earnings: 0,
      };
    }
    acc[level].count++;
    acc[level].earnings += payout.amount;
    return acc;
  }, {} as Record<number, { level: number; count: number; earnings: number }>);

  return Object.values(breakdown).sort((a, b) => a.level - b.level);
}

/**
 * Get verifier statistics
 */
export async function getVerifierStats(verifierId: string): Promise<VerifierStats> {
  const user = await prisma.user.findUnique({
    where: { id: verifierId },
    select: { verifier_stats: true },
  });

  if (user?.verifier_stats) {
    return user.verifier_stats as VerifierStats;
  }

  // Return default stats if not set
  return {
    total_verifications: 0,
    total_earnings: 0,
    approval_rate: 0,
    average_score_given: 0,
    average_review_time_hours: 0,
  };
}

/**
 * Update verifier statistics
 */
export async function updateVerifierStats(
  verifierId: string,
  stats?: Partial<VerifierStats>
) {
  // If stats not provided, calculate from scratch
  if (!stats) {
    const verifications = await prisma.verification.findMany({
      where: {
        verifier_id: verifierId,
        status: { in: ['COMPLETED', 'APPROVED'] },
      },
      include: {
        verifierPayout: true,
      },
    });

    const totalVerifications = verifications.length;
    const totalEarnings = verifications.reduce(
      (sum, v) => sum + (v.verifierPayout?.amount || 0),
      0
    );
    const approvedCount = verifications.filter(
      (v) => v.status === 'APPROVED'
    ).length;
    const totalScore = verifications.reduce((sum, v) => sum + (v.score || 0), 0);

    // Calculate average review time
    const reviewTimes = verifications
      .filter((v) => v.assigned_at && v.completed_at)
      .map((v) => {
        const start = v.assigned_at!.getTime();
        const end = v.completed_at!.getTime();
        return (end - start) / (1000 * 60 * 60); // hours
      });

    const averageReviewTime =
      reviewTimes.length > 0
        ? reviewTimes.reduce((sum, t) => sum + t, 0) / reviewTimes.length
        : 0;

    stats = {
      total_verifications: totalVerifications,
      total_earnings: totalEarnings,
      approval_rate: totalVerifications > 0 ? approvedCount / totalVerifications : 0,
      average_score_given: totalVerifications > 0 ? totalScore / totalVerifications : 0,
      average_review_time_hours: averageReviewTime,
    };
  }

  await prisma.user.update({
    where: { id: verifierId },
    data: { verifier_stats: stats as any },
  });

  return stats;
}

/**
 * Get pending payouts for verifier
 */
export async function getPendingPayouts(verifierId: string) {
  const payouts = await prisma.verifierPayout.findMany({
    where: {
      verifier_id: verifierId,
      status: 'PENDING',
    },
    include: {
      verification: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const totalPending = payouts.reduce((sum, p) => sum + p.amount, 0);

  return {
    payouts,
    totalPending,
    count: payouts.length,
  };
}

/**
 * Get settlement history for verifier
 */
export async function getVerifierSettlementHistory(
  verifierId: string,
  limit = 12
) {
  const settlements = await prisma.settlement.findMany({
    where: {
      seller_id: verifierId, // Reusing seller_id field for verifiers
      verification_count: {
        gt: 0,
      },
    },
    include: {
      verifierPayouts: {
        include: {
          verification: {
            select: {
              level: true,
              completed_at: true,
            },
          },
        },
      },
    },
    orderBy: {
      period_start: 'desc',
    },
    take: limit,
  });

  return settlements;
}

/**
 * Calculate verification fee split (30% platform, 70% verifier)
 */
export function calculateVerificationSplit(fee: number): {
  platformShare: number;
  verifierShare: number;
} {
  const platformShare = Math.round(fee * 0.3);
  const verifierShare = fee - platformShare; // Ensure total matches fee

  return {
    platformShare,
    verifierShare,
  };
}

/**
 * Get verification fees by level (in cents)
 */
export function getVerificationFee(level: number): number {
  const fees: Record<number, number> = {
    0: 0, // Free
    1: 5000, // $50
    2: 15000, // $150
    3: 50000, // $500
  };

  return fees[level] || 0;
}

/**
 * Process verification completion and create payout
 */
export async function processVerificationPayout(verificationId: string) {
  const verification = await prisma.verification.findUnique({
    where: { id: verificationId },
    include: { verifierPayout: true },
  });

  if (!verification) {
    throw new Error('Verification not found');
  }

  if (!verification.verifier_id) {
    throw new Error('No verifier assigned');
  }

  if (verification.status !== 'COMPLETED' && verification.status !== 'APPROVED') {
    throw new Error('Verification not completed');
  }

  // Check if payout already exists
  if (verification.verifierPayout) {
    return verification.verifierPayout;
  }

  // Create payout record
  const payout = await recordVerifierEarning(
    verificationId,
    verification.verifier_id,
    verification.verifier_share
  );

  return payout;
}
