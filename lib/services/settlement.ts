import { PrismaClient, SettlementStatus } from '@prisma/client';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

const prisma = new PrismaClient();

export interface CalculateSettlementParams {
  sellerId: string;
  periodStart: Date;
  periodEnd: Date;
}

export interface SettlementCalculation {
  totalSales: number;
  platformFee: number;
  refundAmount: number;
  netAmount: number;
  orderCount: number;
  refundCount: number;
}

/**
 * Calculate settlement for a seller for a given period
 */
export async function calculateSettlement(params: CalculateSettlementParams) {
  const { sellerId, periodStart, periodEnd } = params;

  // 1. Get all paid orders in period
  const paidOrders = await prisma.order.findMany({
    where: {
      product: { seller_id: sellerId },
      status: 'PAID',
      paid_at: {
        gte: periodStart,
        lt: periodEnd,
      },
    },
    include: {
      product: {
        include: { seller: true },
      },
    },
  });

  // 2. Get all refunds in period
  const refundedOrders = await prisma.order.findMany({
    where: {
      product: { seller_id: sellerId },
      status: 'REFUNDED',
      refunded_at: {
        gte: periodStart,
        lt: periodEnd,
      },
    },
  });

  // 3. Calculate totals
  const totalSales = paidOrders.reduce((sum, order) => sum + order.amount, 0);
  const platformFee = paidOrders.reduce((sum, order) => sum + order.platform_fee, 0);
  const refundAmount = refundedOrders.reduce((sum, order) => sum + order.amount, 0);
  const netAmount = totalSales - platformFee - refundAmount;

  // 4. Get currency (assuming all orders same currency)
  const currency = paidOrders[0]?.currency || 'USD';

  // 5. Create settlement record
  const settlement = await prisma.settlement.create({
    data: {
      seller_id: sellerId,
      period_start: periodStart,
      period_end: periodEnd,
      total_amount: totalSales,
      platform_fee: platformFee,
      payout_amount: netAmount,
      currency,
      status: 'PENDING',
      items: {
        create: paidOrders.map((order) => ({
          product_id: order.product_id,
          order_id: order.id,
          amount: order.amount,
          platform_fee: order.platform_fee,
          payout_amount: order.seller_amount,
        })),
      },
    },
    include: {
      items: true,
      seller: true,
    },
  });

  return {
    settlement,
    calculation: {
      totalSales,
      platformFee,
      refundAmount,
      netAmount,
      orderCount: paidOrders.length,
      refundCount: refundedOrders.length,
    } as SettlementCalculation,
  };
}

/**
 * Get current month estimated settlement for a seller
 */
export async function getCurrentMonthEstimate(sellerId: string) {
  const now = new Date();
  const periodStart = startOfMonth(now);
  const periodEnd = now;

  const paidOrders = await prisma.order.findMany({
    where: {
      product: { seller_id: sellerId },
      status: 'PAID',
      paid_at: {
        gte: periodStart,
        lt: periodEnd,
      },
    },
  });

  // Get verification earnings for current month
  const verificationEarnings = await prisma.verifierPayout.aggregate({
    where: {
      verifier_id: sellerId,
      status: 'PENDING',
      createdAt: {
        gte: periodStart,
        lt: periodEnd,
      },
    },
    _sum: { amount: true },
    _count: true,
  });

  // Get expert payout earnings for current month
  const expertEarnings = await prisma.expertPayout.aggregate({
    where: {
      expert_id: sellerId,
      status: 'PENDING',
      createdAt: {
        gte: periodStart,
        lt: periodEnd,
      },
    },
    _sum: { amount: true },
    _count: true,
  });

  const totalSales = paidOrders.reduce((sum, order) => sum + order.amount, 0);
  const platformFee = paidOrders.reduce((sum, order) => sum + order.platform_fee, 0);
  const verificationAmount = (verificationEarnings._sum.amount || 0) + (expertEarnings._sum.amount || 0);
  const verificationCount = (verificationEarnings._count || 0) + (expertEarnings._count || 0);
  const netAmount = totalSales - platformFee + verificationAmount;

  return {
    periodStart,
    periodEnd,
    totalSales,
    platformFee,
    netAmount,
    verificationEarnings: verificationAmount,
    verificationCount,
    orderCount: paidOrders.length,
    currency: paidOrders[0]?.currency || 'KRW',
  };
}

/**
 * Process settlement payout (admin only)
 */
export async function processSettlementPayout(
  settlementId: string,
  paymentMethod: 'bank_transfer' | 'stripe_connect',
  transactionId?: string
) {
  const settlement = await prisma.settlement.findUnique({
    where: { id: settlementId },
    include: { seller: true },
  });

  if (!settlement) {
    throw new Error('Settlement not found');
  }

  if (settlement.status !== 'PENDING') {
    throw new Error('Settlement already processed');
  }

  // Update settlement status
  const updated = await prisma.settlement.update({
    where: { id: settlementId },
    data: {
      status: 'PROCESSING',
      payout_method: paymentMethod,
      payout_reference: transactionId || `MANUAL_${Date.now()}`,
    },
  });

  return updated;
}

/**
 * Mark settlement as paid
 */
export async function markSettlementAsPaid(settlementId: string) {
  const updated = await prisma.settlement.update({
    where: { id: settlementId },
    data: {
      status: 'PAID',
      payout_date: new Date(),
    },
  });

  return updated;
}

/**
 * Mark settlement as failed
 */
export async function markSettlementAsFailed(settlementId: string, reason?: string) {
  const updated = await prisma.settlement.update({
    where: { id: settlementId },
    data: {
      status: 'FAILED',
    },
  });

  return updated;
}

/**
 * Get settlement details
 */
export async function getSettlementDetails(settlementId: string) {
  const settlement = await prisma.settlement.findUnique({
    where: { id: settlementId },
    include: {
      seller: {
        select: {
          id: true,
          email: true,
          name: true,
          bank_name: true,
          bank_account: true,
          account_holder: true,
          bank_verified: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              category: true,
            },
          },
        },
      },
    },
  });

  return settlement;
}

/**
 * List settlements for a seller
 */
export async function listSettlementsForSeller(sellerId: string, limit = 10) {
  const settlements = await prisma.settlement.findMany({
    where: { seller_id: sellerId },
    include: {
      items: true,
    },
    orderBy: { period_start: 'desc' },
    take: limit,
  });

  return settlements;
}

/**
 * List all settlements (admin)
 */
export async function listAllSettlements(
  filters?: {
    status?: SettlementStatus;
    sellerId?: string;
    startDate?: Date;
    endDate?: Date;
  },
  page = 1,
  limit = 20
) {
  const where: any = {};

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.sellerId) {
    where.seller_id = filters.sellerId;
  }

  if (filters?.startDate || filters?.endDate) {
    where.period_start = {};
    if (filters.startDate) {
      where.period_start.gte = filters.startDate;
    }
    if (filters.endDate) {
      where.period_start.lte = filters.endDate;
    }
  }

  const [settlements, total] = await Promise.all([
    prisma.settlement.findMany({
      where,
      include: {
        seller: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        items: true,
      },
      orderBy: { createdAt: 'desc' }, // Settlement uses createdAt (camelCase)
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.settlement.count({ where }),
  ]);

  return {
    settlements,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get settlement summary statistics with monthly data and revenue breakdown
 */
export async function getSettlementSummary(sellerId?: string) {
  const where: any = {};
  if (sellerId) {
    where.seller_id = sellerId;
  }

  const [pending, processing, paid, failed] = await Promise.all([
    prisma.settlement.aggregate({
      where: { ...where, status: 'PENDING' },
      _sum: { payout_amount: true },
      _count: true,
    }),
    prisma.settlement.aggregate({
      where: { ...where, status: 'PROCESSING' },
      _sum: { payout_amount: true },
      _count: true,
    }),
    prisma.settlement.aggregate({
      where: { ...where, status: 'PAID' },
      _sum: { payout_amount: true },
      _count: true,
    }),
    prisma.settlement.aggregate({
      where: { ...where, status: 'FAILED' },
      _sum: { payout_amount: true },
      _count: true,
    }),
  ]);

  // Get monthly data for last 12 months
  const monthlyData = await getMonthlySettlementData(sellerId);

  // Get revenue breakdown
  const revenueBreakdown = await getRevenueBreakdown(sellerId);

  return {
    pending: {
      amount: pending._sum.payout_amount || 0,
      count: pending._count,
    },
    processing: {
      amount: processing._sum.payout_amount || 0,
      count: processing._count,
    },
    paid: {
      amount: paid._sum.payout_amount || 0,
      count: paid._count,
    },
    failed: {
      amount: failed._sum.payout_amount || 0,
      count: failed._count,
    },
    monthlyData,
    revenueBreakdown,
  };
}

/**
 * Get monthly settlement data for charts
 */
export async function getMonthlySettlementData(sellerId?: string) {
  const now = new Date();
  const months = [];

  // Get last 12 months
  for (let i = 11; i >= 0; i--) {
    const monthDate = subMonths(now, i);
    const periodStart = startOfMonth(monthDate);
    const periodEnd = endOfMonth(monthDate);

    const where: any = {
      period_start: {
        gte: periodStart,
        lt: periodEnd,
      },
    };

    if (sellerId) {
      where.seller_id = sellerId;
    }

    const settlements = await prisma.settlement.findMany({
      where,
      include: {
        items: true,
      },
    });

    const totalAmount = settlements.reduce((sum, s) => sum + s.total_amount, 0);
    const platformFee = settlements.reduce((sum, s) => sum + s.platform_fee, 0);
    const payoutAmount = settlements.reduce((sum, s) => sum + s.payout_amount, 0);
    const verificationEarnings = settlements.reduce((sum, s) => sum + s.verification_earnings, 0);
    const orderCount = settlements.reduce((sum, s) => sum + s.items.length, 0);

    months.push({
      month: format(periodStart, 'yyyy-MM-dd'),
      totalAmount,
      platformFee,
      payoutAmount,
      verificationEarnings,
      orderCount,
    });
  }

  return months;
}

/**
 * Get revenue breakdown (product sales vs verification earnings)
 */
export async function getRevenueBreakdown(sellerId?: string) {
  const where: any = {};
  if (sellerId) {
    where.seller_id = sellerId;
  }

  const settlements = await prisma.settlement.findMany({
    where,
    select: {
      total_amount: true,
      verification_earnings: true,
    },
  });

  const productSales = settlements.reduce((sum, s) => sum + s.total_amount, 0);
  const verificationEarnings = settlements.reduce((sum, s) => sum + s.verification_earnings, 0);

  return {
    productSales,
    verificationEarnings,
    totalRevenue: productSales + verificationEarnings,
  };
}

/**
 * Process Stripe Connect payout
 */
export async function processStripeConnectPayout(settlementId: string) {
  const settlement = await prisma.settlement.findUnique({
    where: { id: settlementId },
    include: { seller: true },
  });

  if (!settlement) {
    throw new Error('Settlement not found');
  }

  if (!settlement.seller.stripe_account_id) {
    throw new Error('Seller does not have Stripe Connect account');
  }

  // Initialize Stripe (in production, use actual Stripe SDK)
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  // For now, return mock transfer ID
  // In production:
  // const transfer = await stripe.transfers.create({
  //   amount: Math.round(settlement.payout_amount),
  //   currency: settlement.currency.toLowerCase(),
  //   destination: settlement.seller.stripe_account_id,
  //   description: `Settlement ${format(settlement.period_start, 'yyyy-MM')}`,
  // });

  const mockTransferId = `tr_${Date.now()}`;

  await processSettlementPayout(
    settlementId,
    'stripe_connect',
    mockTransferId
  );

  return { transferId: mockTransferId };
}

/**
 * Calculate platform fee for an order
 */
export function calculatePlatformFee(amount: number, feeRate: number): number {
  return Math.round(amount * feeRate);
}

/**
 * Validate bank account details
 */
export async function validateBankAccount(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      bank_name: true,
      bank_account: true,
      account_holder: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const isValid =
    !!user.bank_name &&
    !!user.bank_account &&
    !!user.account_holder;

  return {
    isValid,
    details: user,
  };
}
