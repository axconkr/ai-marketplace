import { PrismaClient, VerificationStatus } from '@prisma/client';

const prisma = new PrismaClient();

export interface VerificationRevenue {
  totalFees: number;
  platformShare: number;
  verifierShare: number;
  count: number;
  byLevel: Array<{
    level: number;
    count: number;
    totalFees: number;
    platformShare: number;
    verifierShare: number;
  }>;
}

/**
 * Get verification revenue for a period
 */
export async function getVerificationRevenue(
  periodStart: Date,
  periodEnd: Date
): Promise<VerificationRevenue> {
  const verifications = await prisma.verification.findMany({
    where: {
      completed_at: {
        gte: periodStart,
        lt: periodEnd,
      },
      status: { in: ['APPROVED', 'COMPLETED'] },
    },
    select: {
      id: true,
      level: true,
      fee: true,
      platform_share: true,
      verifier_share: true,
    },
  });

  const totalFees = verifications.reduce((sum, v) => sum + v.fee, 0);
  const platformShare = verifications.reduce((sum, v) => sum + v.platform_share, 0);
  const verifierShare = verifications.reduce((sum, v) => sum + v.verifier_share, 0);

  // Group by level
  const byLevel = verifications.reduce((acc, v) => {
    if (!acc[v.level]) {
      acc[v.level] = {
        level: v.level,
        count: 0,
        totalFees: 0,
        platformShare: 0,
        verifierShare: 0,
      };
    }
    acc[v.level].count++;
    acc[v.level].totalFees += v.fee;
    acc[v.level].platformShare += v.platform_share;
    acc[v.level].verifierShare += v.verifier_share;
    return acc;
  }, {} as Record<number, any>);

  return {
    totalFees,
    platformShare,
    verifierShare,
    count: verifications.length,
    byLevel: Object.values(byLevel).sort((a, b) => a.level - b.level),
  };
}

/**
 * Get total platform revenue (product sales + verifications)
 */
export async function getTotalPlatformRevenue(
  periodStart: Date,
  periodEnd: Date
) {
  // Product sales platform fees
  const productRevenue = await prisma.order.aggregate({
    where: {
      status: 'PAID',
      paid_at: {
        gte: periodStart,
        lt: periodEnd,
      },
    },
    _sum: {
      platform_fee: true,
    },
    _count: true,
  });

  // Verification platform share
  const verificationRevenue = await getVerificationRevenue(periodStart, periodEnd);

  return {
    productSales: {
      platformFee: productRevenue._sum.platform_fee || 0,
      orderCount: productRevenue._count,
    },
    verifications: {
      platformShare: verificationRevenue.platformShare,
      verificationCount: verificationRevenue.count,
    },
    total: (productRevenue._sum.platform_fee || 0) + verificationRevenue.platformShare,
  };
}

/**
 * Get verification stats by verifier
 */
export async function getVerificationStatsByVerifier(
  periodStart?: Date,
  periodEnd?: Date
) {
  const where: any = {
    status: { in: ['APPROVED', 'COMPLETED'] },
  };

  if (periodStart && periodEnd) {
    where.completed_at = {
      gte: periodStart,
      lt: periodEnd,
    };
  }

  const verifications = await prisma.verification.groupBy({
    by: ['verifier_id'],
    where,
    _count: true,
    _sum: {
      fee: true,
      verifier_share: true,
    },
  });

  const stats = await Promise.all(
    verifications
      .filter((v) => v.verifier_id !== null)
      .map(async (v) => {
        const verifier = await prisma.user.findUnique({
          where: { id: v.verifier_id! },
          select: {
            id: true,
            email: true,
            name: true,
          },
        });

        return {
          verifier,
          verificationCount: v._count,
          totalFees: v._sum.fee || 0,
          totalEarnings: v._sum.verifier_share || 0,
        };
      })
  );

  return stats.sort((a, b) => b.verificationCount - a.verificationCount);
}

/**
 * Get verification conversion rate
 */
export async function getVerificationConversionRate(
  periodStart: Date,
  periodEnd: Date
) {
  const total = await prisma.verification.count({
    where: {
      requested_at: {
        gte: periodStart,
        lt: periodEnd,
      },
    },
  });

  const completed = await prisma.verification.count({
    where: {
      completed_at: {
        gte: periodStart,
        lt: periodEnd,
      },
      status: { in: ['APPROVED', 'COMPLETED'] },
    },
  });

  const approved = await prisma.verification.count({
    where: {
      completed_at: {
        gte: periodStart,
        lt: periodEnd,
      },
      status: 'APPROVED',
    },
  });

  return {
    totalRequested: total,
    completed,
    approved,
    completionRate: total > 0 ? completed / total : 0,
    approvalRate: completed > 0 ? approved / completed : 0,
  };
}

/**
 * Get average verification turnaround time
 */
export async function getAverageTurnaroundTime(
  periodStart: Date,
  periodEnd: Date
) {
  const verifications = await prisma.verification.findMany({
    where: {
      completed_at: {
        gte: periodStart,
        lt: periodEnd,
      },
      assigned_at: { not: null },
      status: { in: ['APPROVED', 'COMPLETED'] },
    },
    select: {
      assigned_at: true,
      completed_at: true,
      level: true,
    },
  });

  const turnaroundTimes = verifications.map((v) => {
    const start = v.assigned_at!.getTime();
    const end = v.completed_at!.getTime();
    return {
      level: v.level,
      hours: (end - start) / (1000 * 60 * 60),
    };
  });

  // Group by level
  const byLevel = turnaroundTimes.reduce((acc, t) => {
    if (!acc[t.level]) {
      acc[t.level] = {
        level: t.level,
        times: [],
      };
    }
    acc[t.level].times.push(t.hours);
    return acc;
  }, {} as Record<number, { level: number; times: number[] }>);

  const averageByLevel = Object.values(byLevel).map((item) => ({
    level: item.level,
    averageHours: item.times.reduce((sum, t) => sum + t, 0) / item.times.length,
    count: item.times.length,
  }));

  const overallAverage =
    turnaroundTimes.length > 0
      ? turnaroundTimes.reduce((sum, t) => sum + t.hours, 0) / turnaroundTimes.length
      : 0;

  return {
    overall: overallAverage,
    byLevel: averageByLevel,
    totalVerifications: turnaroundTimes.length,
  };
}
