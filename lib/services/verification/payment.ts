/**
 * Verification Payment and Payout Services
 */

import { prisma } from '@/lib/db';
import { getPaymentProvider } from '@/lib/payment';
import { startOfMonth, endOfMonth } from 'date-fns';

// ============================================================================
// CONSTANTS
// ============================================================================

export const VERIFICATION_FEES = {
  0: 0,       // Free
  1: 5000,    // $50
  2: 15000,   // $150 (Phase 2)
  3: 50000,   // $500 (Phase 2)
} as const;

const PLATFORM_SHARE_RATE = 0.3; // 30%
const VERIFIER_SHARE_RATE = 0.7; // 70%

// ============================================================================
// PAYMENT PROCESSING
// ============================================================================

/**
 * Process verification fee payment
 */
export async function processVerificationFee(
  productId: string,
  level: number,
  sellerId: string
) {
  const fee = VERIFICATION_FEES[level as keyof typeof VERIFICATION_FEES];

  if (fee === undefined) {
    throw new Error('Invalid verification level');
  }

  if (fee === 0) {
    return null; // Free for Level 0
  }

  // Get product for metadata
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      name: true,
      seller: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  // Create payment intent
  const provider = getPaymentProvider('USD');
  const paymentIntent = await provider.createPaymentIntent({
    amount: fee,
    currency: 'USD',
    orderId: `verification-${productId}-${Date.now()}`,
    customerId: sellerId,
    customerEmail: product.seller.email,
    customerName: product.seller.name || undefined,
    productId,
    productName: `${product.name} - Level ${level} Verification`,
  });

  return paymentIntent;
}

/**
 * Confirm verification payment
 */
export async function confirmVerificationPayment(
  verificationId: string,
  paymentIntentId: string
) {
  const verification = await prisma.verification.findUnique({
    where: { id: verificationId },
  });

  if (!verification) {
    throw new Error('Verification not found');
  }

  // Verify payment with provider
  const provider = getPaymentProvider('USD');
  const paymentDetails = await provider.getPayment(paymentIntentId);

  if (paymentDetails.status !== 'succeeded') {
    throw new Error('Payment not successful');
  }

  // Update verification status
  return await prisma.verification.update({
    where: { id: verificationId },
    data: {
      status: 'PENDING', // Now awaiting verifier assignment
    },
  });
}

// ============================================================================
// VERIFIER PAYOUTS
// ============================================================================

/**
 * Create verifier payout record
 */
export async function createVerifierPayout(
  verifierId: string,
  verificationId: string,
  amount: number
) {
  // Create payout record
  const payout = await prisma.verifierPayout.create({
    data: {
      verifier_id: verifierId,
      verification_id: verificationId,
      amount,
      status: 'PENDING',
    },
  });

  // Update settlement (create if doesn't exist)
  const periodStart = startOfMonth(new Date());
  const periodEnd = endOfMonth(new Date());

  await prisma.settlement.upsert({
    where: {
      seller_id_period_start: {
        seller_id: verifierId,
        period_start: periodStart,
      },
    },
    create: {
      seller_id: verifierId,
      period_start: periodStart,
      period_end: periodEnd,
      verification_earnings: amount,
      verification_count: 1,
      total_amount: 0,
      platform_fee: 0,
      payout_amount: amount,
      currency: 'USD',
    },
    update: {
      verification_earnings: { increment: amount },
      verification_count: { increment: 1 },
      payout_amount: { increment: amount },
    },
  });

  return payout;
}

/**
 * Process verifier payouts for a settlement period
 */
export async function processVerifierPayouts(
  settlementId: string
) {
  const settlement = await prisma.settlement.findUnique({
    where: { id: settlementId },
    include: {
      seller: true,
      verifierPayouts: {
        where: {
          status: 'PENDING',
        },
      },
    },
  });

  if (!settlement) {
    throw new Error('Settlement not found');
  }

  // Calculate total payout amount
  const totalPayout = settlement.verifierPayouts.reduce(
    (sum, payout) => sum + payout.amount,
    0
  );

  // Process payout via Stripe Connect or bank transfer
  // This is a placeholder - implement based on your payment provider
  const payoutResult = await processStripeConnectPayout(
    settlement.seller.stripe_account_id,
    totalPayout,
    'USD'
  );

  // Update payout records
  await prisma.$transaction([
    // Update settlement
    prisma.settlement.update({
      where: { id: settlementId },
      data: {
        status: 'PAID',
        payout_date: new Date(),
        payout_reference: payoutResult.id,
      },
    }),

    // Update verifier payouts
    ...settlement.verifierPayouts.map((payout) =>
      prisma.verifierPayout.update({
        where: { id: payout.id },
        data: {
          status: 'PAID',
          settlement_id: settlementId,
          paid_at: new Date(),
        },
      })
    ),
  ]);

  return {
    settlementId,
    totalPayout,
    payoutCount: settlement.verifierPayouts.length,
    payoutReference: payoutResult.id,
  };
}

/**
 * Get verifier earnings summary
 */
export async function getVerifierEarnings(
  verifierId: string,
  options?: {
    startDate?: Date;
    endDate?: Date;
  }
) {
  const where: any = {
    verifier_id: verifierId,
  };

  if (options?.startDate) {
    where.createdAt = { gte: options.startDate };
  }
  if (options?.endDate) {
    where.createdAt = {
      ...where.createdAt,
      lte: options.endDate,
    };
  }

  const [payouts, stats] = await Promise.all([
    // Get all payouts
    prisma.verifierPayout.findMany({
      where,
      include: {
        verification: {
          select: {
            level: true,
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),

    // Get aggregated stats
    prisma.verifierPayout.aggregate({
      where,
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    }),
  ]);

  // Group by status
  const byStatus = {
    pending: 0,
    included: 0,
    paid: 0,
  };

  payouts.forEach((payout) => {
    const amount = payout.amount;
    if (payout.status === 'PENDING') {
      byStatus.pending += amount;
    } else if (payout.status === 'INCLUDED_IN_SETTLEMENT') {
      byStatus.included += amount;
    } else if (payout.status === 'PAID') {
      byStatus.paid += amount;
    }
  });

  return {
    total: stats._sum.amount || 0,
    count: stats._count.id || 0,
    byStatus,
    payouts,
  };
}

/**
 * Get verifier performance stats
 */
export async function getVerifierStats(verifierId: string) {
  const verifier = await prisma.user.findUnique({
    where: { id: verifierId },
    select: {
      verifier_stats: true,
    },
  });

  if (!verifier) {
    throw new Error('Verifier not found');
  }

  const stats = verifier.verifier_stats as any || {
    total_verifications: 0,
    total_earnings: 0,
    approval_rate: 0,
    avg_score: 0,
  };

  // Get recent verifications
  const recentVerifications = await prisma.verification.findMany({
    where: {
      verifier_id: verifierId,
      status: { in: ['APPROVED', 'REJECTED'] },
    },
    orderBy: {
      completed_at: 'desc',
    },
    take: 10,
    select: {
      id: true,
      level: true,
      status: true,
      score: true,
      completed_at: true,
      product: {
        select: {
          name: true,
        },
      },
    },
  });

  return {
    stats,
    recentVerifications,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Process Stripe Connect payout
 * Placeholder - implement based on your Stripe integration
 */
async function processStripeConnectPayout(
  stripeAccountId: string | null,
  amount: number,
  currency: string
): Promise<{ id: string }> {
  if (!stripeAccountId) {
    throw new Error('Stripe account not connected');
  }

  // TODO: Implement Stripe Connect payout
  // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  // const payout = await stripe.payouts.create(
  //   {
  //     amount,
  //     currency: currency.toLowerCase(),
  //   },
  //   {
  //     stripeAccount: stripeAccountId,
  //   }
  // );

  // For now, return mock payout
  return {
    id: `po_mock_${Date.now()}`,
  };
}

/**
 * Calculate verification fee breakdown
 */
export function calculateVerificationFee(level: number) {
  const fee = VERIFICATION_FEES[level as keyof typeof VERIFICATION_FEES];

  if (fee === undefined) {
    throw new Error('Invalid verification level');
  }

  const platformShare = Math.round(fee * PLATFORM_SHARE_RATE);
  const verifierShare = Math.round(fee * VERIFIER_SHARE_RATE);

  return {
    total: fee,
    platformShare,
    verifierShare,
    currency: 'USD',
  };
}
