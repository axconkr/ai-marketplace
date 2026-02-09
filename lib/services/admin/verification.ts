import { prisma } from '@/lib/prisma';
import { VerificationStatus, ExpertType, ExpertReviewStatus } from '@prisma/client';
import { AdminListParams, AdminListResult, AdminActionResult } from './types';
import { buildPaginationQuery, buildPaginationInfo, buildSearchWhere } from './utils';

export interface AdminVerification {
  id: string;
  product_id: string;
  verifier_id: string | null;
  level: number;
  status: VerificationStatus;
  requested_at: Date;
  product: { id: string; name: string; seller: { id: string; name: string | null } };
  verifier: { id: string; name: string | null; email: string } | null;
}

export async function listVerificationsForAdmin(
  params: AdminListParams & { level?: number }
): Promise<AdminListResult<AdminVerification>> {
  const where: any = {};

  if (params.status) {
    where.status = params.status;
  }

  if (params.level !== undefined) {
    where.level = params.level;
  }

  const searchWhere = buildSearchWhere(params.search, ['product.name']);
  if (Object.keys(searchWhere).length > 0) {
    where.OR = searchWhere.OR;
  }

  const { skip, take } = buildPaginationQuery(params);
  const [verifications, total] = await Promise.all([
    prisma.verification.findMany({
      where,
      select: {
        id: true,
        product_id: true,
        verifier_id: true,
        level: true,
        status: true,
        requested_at: true,
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
            email: true,
          },
        },
      },
      orderBy: { requested_at: 'desc' },
      skip,
      take,
    }),
    prisma.verification.count({ where }),
  ]);

  return {
    items: verifications as AdminVerification[],
    pagination: buildPaginationInfo(total, params),
  };
}

export async function getVerificationDetailsForAdmin(
  verificationId: string
): Promise<{
  id: string;
  product_id: string;
  verifier_id: string | null;
  level: number;
  status: VerificationStatus;
  fee: number;
  platform_share: number;
  verifier_share: number;
  report: any;
  score: number | null;
  badges: string[];
  requested_at: Date;
  assigned_at: Date | null;
  reviewed_at: Date | null;
  completed_at: Date | null;
  product: { id: string; name: string; seller: { id: string; name: string | null; email: string } };
  verifier: { id: string; name: string | null; email: string } | null;
  expertReviews: Array<{
    id: string;
    expert_type: ExpertType;
    expert_id: string | null;
    status: ExpertReviewStatus;
    fee: number;
    platform_share: number;
    expert_share: number;
    score: number | null;
    feedback: string | null;
    requested_at: Date;
    assigned_at: Date | null;
    completed_at: Date | null;
    expert: { id: string; name: string | null; email: string } | null;
  }>;
} | null> {
  return prisma.verification.findUnique({
    where: { id: verificationId },
    select: {
      id: true,
      product_id: true,
      verifier_id: true,
      level: true,
      status: true,
      fee: true,
      platform_share: true,
      verifier_share: true,
      report: true,
      score: true,
      badges: true,
      requested_at: true,
      assigned_at: true,
      reviewed_at: true,
      completed_at: true,
      product: {
        select: {
          id: true,
          name: true,
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
      expertReviews: {
        select: {
          id: true,
          expert_type: true,
          expert_id: true,
          status: true,
          fee: true,
          platform_share: true,
          expert_share: true,
          score: true,
          feedback: true,
          requested_at: true,
          assigned_at: true,
          completed_at: true,
          expert: {
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
}

export async function assignVerifier(
  verificationId: string,
  verifierId: string
): Promise<AdminActionResult> {
  try {
    const verification = await prisma.verification.findUnique({
      where: { id: verificationId },
    });

    if (!verification) {
      return {
        success: false,
        message: 'Verification not found',
      };
    }

    const verifier = await prisma.user.findUnique({
      where: { id: verifierId },
    });

    if (!verifier) {
      return {
        success: false,
        message: 'Verifier not found',
      };
    }

    const updated = await prisma.verification.update({
      where: { id: verificationId },
      data: {
        verifier_id: verifierId,
        assigned_at: new Date(),
        status: verification.status === VerificationStatus.PENDING ? VerificationStatus.ASSIGNED : verification.status,
      },
      select: {
        id: true,
        verifier_id: true,
        status: true,
        assigned_at: true,
      },
    });

    return {
      success: true,
      message: 'Verifier assigned successfully',
      data: updated,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to assign verifier',
    };
  }
}

export async function assignExpert(
  expertReviewId: string,
  expertId: string
): Promise<AdminActionResult> {
  try {
    const expertReview = await prisma.verificationExpert.findUnique({
      where: { id: expertReviewId },
    });

    if (!expertReview) {
      return {
        success: false,
        message: 'Expert review not found',
      };
    }

    const expert = await prisma.user.findUnique({
      where: { id: expertId },
    });

    if (!expert) {
      return {
        success: false,
        message: 'Expert not found',
      };
    }

    const updated = await prisma.verificationExpert.update({
      where: { id: expertReviewId },
      data: {
        expert_id: expertId,
        assigned_at: new Date(),
        status: expertReview.status === ExpertReviewStatus.PENDING ? ExpertReviewStatus.ASSIGNED : expertReview.status,
      },
      select: {
        id: true,
        expert_id: true,
        status: true,
        assigned_at: true,
      },
    });

    return {
      success: true,
      message: 'Expert assigned successfully',
      data: updated,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to assign expert',
    };
  }
}

export async function listAvailableVerifiers(): Promise<
  Array<{ id: string; name: string | null; email: string }>
> {
  return prisma.user.findMany({
    where: {
      role: {
        contains: 'verifier',
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: { name: 'asc' },
  });
}

export async function listAvailableExperts(expertType: ExpertType): Promise<
  Array<{ id: string; name: string | null; email: string }>
> {
  return prisma.user.findMany({
    where: {
      role: {
        contains: 'verifier',
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: { name: 'asc' },
  });
}

export async function approveVerification(
  verificationId: string,
  adminComment?: string
): Promise<AdminActionResult> {
  try {
    const verification = await prisma.verification.findUnique({
      where: { id: verificationId },
      include: { product: true },
    });

    if (!verification) {
      return { success: false, message: 'Verification not found' };
    }

    if (verification.status !== VerificationStatus.COMPLETED) {
      return { success: false, message: 'Verification must be in COMPLETED status for approval' };
    }

    const report = verification.report as any;
    const finalScore = report?.finalScore ?? verification.score ?? 0;
    const badges = verification.badges || [];

    await prisma.$transaction(async (tx) => {
      await tx.verification.update({
        where: { id: verificationId },
        data: {
          status: VerificationStatus.APPROVED,
          report: {
            ...report,
            adminDecision: {
              action: 'APPROVED',
              comment: adminComment || null,
              decidedAt: new Date().toISOString(),
            },
          } as any,
        },
      });

      await tx.product.update({
        where: { id: verification.product_id },
        data: {
          verification_level: verification.level,
          verification_score: finalScore,
          verification_badges: badges,
        },
      });

      if (verification.verifier_id && verification.verifier_share > 0) {
        await tx.verifierPayout.create({
          data: {
            verifier_id: verification.verifier_id,
            verification_id: verificationId,
            amount: verification.verifier_share,
            status: 'PENDING',
          },
        });
      }
    });

    return { success: true, message: '검증이 승인되었습니다.' };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to approve verification',
    };
  }
}

export async function rejectVerification(
  verificationId: string,
  reason: string
): Promise<AdminActionResult> {
  try {
    const verification = await prisma.verification.findUnique({
      where: { id: verificationId },
      include: { product: true },
    });

    if (!verification) {
      return { success: false, message: 'Verification not found' };
    }

    if (verification.status !== VerificationStatus.COMPLETED) {
      return { success: false, message: 'Verification must be in COMPLETED status for rejection' };
    }

    const report = verification.report as any;

    await prisma.$transaction(async (tx) => {
      await tx.verification.update({
        where: { id: verificationId },
        data: {
          status: VerificationStatus.REJECTED,
          report: {
            ...report,
            adminDecision: {
              action: 'REJECTED',
              reason,
              decidedAt: new Date().toISOString(),
            },
          } as any,
        },
      });

      await tx.product.update({
        where: { id: verification.product_id },
        data: {
          verification_level: 0,
          verification_score: 0,
          verification_badges: [],
        },
      });
    });

    return { success: true, message: '검증이 거부되었습니다.' };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to reject verification',
    };
  }
}

export async function getVerificationStatistics(): Promise<{
  total: number;
  byStatus: Record<string, number>;
  avgCompletionDays: number;
  pendingAssignments: number;
}> {
  const [total, byStatus, completedVerifications, pendingAssignments] = await Promise.all([
    prisma.verification.count(),
    prisma.verification.groupBy({
      by: ['status'],
      _count: true,
    }),
    prisma.verification.findMany({
      where: {
        AND: [
          { completed_at: { not: undefined } },
          { requested_at: { not: undefined } },
        ],
      },
      select: {
        requested_at: true,
        completed_at: true,
      },
    }),
    prisma.verification.count({
      where: {
        status: VerificationStatus.PENDING,
        verifier_id: undefined,
      },
    }),
  ]);

  // Calculate average completion days
  let avgCompletionDays = 0;
  if (completedVerifications.length > 0) {
    const totalDays = completedVerifications.reduce((sum, v) => {
      if (v.completed_at && v.requested_at) {
        const days = (v.completed_at.getTime() - v.requested_at.getTime()) / (1000 * 60 * 60 * 24);
        return sum + days;
      }
      return sum;
    }, 0);
    avgCompletionDays = Math.round((totalDays / completedVerifications.length) * 100) / 100;
  }

  const statusCounts: Record<string, number> = {};
  byStatus.forEach((item) => {
    statusCounts[item.status] = item._count;
  });

  return {
    total,
    byStatus: statusCounts,
    avgCompletionDays,
    pendingAssignments,
  };
}
