import { PrismaClient } from '@prisma/client';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import { calculateSettlement } from '../lib/services/settlement';
import { getVerifierEarnings } from '../lib/services/verifier-earnings';

const prisma = new PrismaClient();

/**
 * Send settlement notification email to seller
 */
async function sendSettlementNotification(sellerId: string, settlementId: string) {
  // In production, integrate with email service (SendGrid, AWS SES, etc.)
  const settlement = await prisma.settlement.findUnique({
    where: { id: settlementId },
    include: { seller: true },
  });

  if (!settlement) {
    console.error(`Settlement ${settlementId} not found`);
    return;
  }

  const seller = settlement.seller;
  const periodStr = `${format(settlement.period_start, 'yyyy-MM-dd')} - ${format(settlement.period_end, 'yyyy-MM-dd')}`;

  console.log(`
    📧 Sending settlement notification to ${seller.email}
    Settlement ID: ${settlementId}
    Period: ${periodStr}
    Total Sales: ${settlement.currency} ${(settlement.total_amount / 100).toFixed(2)}
    Platform Fee: ${settlement.currency} ${(settlement.platform_fee / 100).toFixed(2)}
    Net Amount: ${settlement.currency} ${(settlement.payout_amount / 100).toFixed(2)}
  `);

  // TODO: Implement actual email sending
  // await sendEmail({
  //   to: seller.email,
  //   subject: `Settlement Ready for ${periodStr}`,
  //   template: 'settlement-created',
  //   data: {
  //     sellerName: seller.name,
  //     period: periodStr,
  //     totalSales: settlement.total_amount,
  //     platformFee: settlement.platform_fee,
  //     netAmount: settlement.payout_amount,
  //     currency: settlement.currency,
  //     settlementUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settlements/${settlementId}`,
  //   },
  // });
}

/**
 * Calculate verifier settlement
 */
async function calculateVerifierSettlement(params: {
  verifierId: string;
  periodStart: Date;
  periodEnd: Date;
}) {
  const { verifierId, periodStart, periodEnd } = params;

  // Get verifier earnings
  const earnings = await getVerifierEarnings(verifierId, periodStart, periodEnd);

  if (earnings.verificationCount === 0) {
    throw new Error('No verifications in period');
  }

  // Create settlement
  const settlement = await prisma.settlement.create({
    data: {
      seller_id: verifierId, // Reuse seller_id field
      period_start: periodStart,
      period_end: periodEnd,
      total_amount: 0, // No product sales
      platform_fee: 0,
      payout_amount: earnings.totalEarnings,
      verification_earnings: earnings.totalEarnings,
      verification_count: earnings.verificationCount,
      currency: 'USD',
      status: 'PENDING',
    },
  });

  // Link payouts to settlement
  await prisma.verifierPayout.updateMany({
    where: {
      verifier_id: verifierId,
      createdAt: {
        gte: periodStart,
        lt: periodEnd,
      },
      status: 'PENDING',
    },
    data: {
      settlement_id: settlement.id,
      status: 'INCLUDED_IN_SETTLEMENT',
    },
  });

  // Send notification
  await sendSettlementNotification(verifierId, settlement.id);

  return settlement;
}

/**
 * Run monthly settlement for all sellers and verifiers
 */
export async function runMonthlySettlement() {
  console.log('🚀 Starting monthly settlement process...');

  const now = new Date();
  const periodStart = startOfMonth(subMonths(now, 1));
  const periodEnd = endOfMonth(subMonths(now, 1));

  console.log(`📅 Settlement period: ${format(periodStart, 'yyyy-MM-dd')} to ${format(periodEnd, 'yyyy-MM-dd')}`);

  try {
    // 1. Get all sellers who have paid orders in the period
    const sellersWithSales = await prisma.user.findMany({
      where: {
        role: { in: ['seller', 'service_provider'] },
        products: {
          some: {
            orders: {
              some: {
                status: 'PAID',
                paid_at: {
                  gte: periodStart,
                  lt: periodEnd,
                },
              },
            },
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    console.log(`👥 Found ${sellersWithSales.length} sellers with sales in period`);

    // 2. Get all verifiers with completed verifications in period
    const verifiersWithEarnings = await prisma.user.findMany({
      where: {
        role: 'verifier',
        verifierPayouts: {
          some: {
            createdAt: {
              gte: periodStart,
              lt: periodEnd,
            },
            status: 'PENDING',
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    console.log(`🔍 Found ${verifiersWithEarnings.length} verifiers with earnings in period`);

    // 3. Create settlements for sellers
    const results = {
      sellers: {
        successful: 0,
        failed: 0,
        errors: [] as Array<{ userId: string; error: string }>,
      },
      verifiers: {
        successful: 0,
        failed: 0,
        errors: [] as Array<{ userId: string; error: string }>,
      },
    };

    for (const seller of sellersWithSales) {
      try {
        console.log(`\n💰 Processing settlement for seller: ${seller.email} (${seller.id})`);

        // Check if settlement already exists for this period
        const existing = await prisma.settlement.findFirst({
          where: {
            seller_id: seller.id,
            period_start: periodStart,
            period_end: periodEnd,
          },
        });

        if (existing) {
          console.log(`⚠️  Settlement already exists for this period, skipping...`);
          continue;
        }

        // Calculate and create settlement
        const { settlement, calculation } = await calculateSettlement({
          sellerId: seller.id,
          periodStart,
          periodEnd,
        });

        console.log(`✅ Settlement created successfully:`);
        console.log(`   Orders: ${calculation.orderCount}`);
        console.log(`   Total Sales: ${settlement.currency} ${(calculation.totalSales / 100).toFixed(2)}`);
        console.log(`   Platform Fee: ${settlement.currency} ${(calculation.platformFee / 100).toFixed(2)}`);
        console.log(`   Net Amount: ${settlement.currency} ${(calculation.netAmount / 100).toFixed(2)}`);

        // Send notification
        await sendSettlementNotification(seller.id, settlement.id);

        results.sellers.successful++;
      } catch (error) {
        console.error(`❌ Failed to create settlement for seller ${seller.id}:`, error);
        results.sellers.failed++;
        results.sellers.errors.push({
          userId: seller.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // 4. Create settlements for verifiers
    for (const verifier of verifiersWithEarnings) {
      try {
        console.log(`\n🔍 Processing settlement for verifier: ${verifier.email} (${verifier.id})`);

        // Check if settlement already exists for this period
        const existing = await prisma.settlement.findFirst({
          where: {
            seller_id: verifier.id,
            period_start: periodStart,
            period_end: periodEnd,
          },
        });

        if (existing) {
          console.log(`⚠️  Settlement already exists for this period, skipping...`);
          continue;
        }

        // Calculate and create verifier settlement
        const settlement = await calculateVerifierSettlement({
          verifierId: verifier.id,
          periodStart,
          periodEnd,
        });

        console.log(`✅ Verifier settlement created successfully:`);
        console.log(`   Verifications: ${settlement.verification_count}`);
        console.log(`   Total Earnings: ${settlement.currency} ${(settlement.verification_earnings / 100).toFixed(2)}`);
        console.log(`   Net Amount: ${settlement.currency} ${(settlement.payout_amount / 100).toFixed(2)}`);

        results.verifiers.successful++;
      } catch (error) {
        console.error(`❌ Failed to create settlement for verifier ${verifier.id}:`, error);
        results.verifiers.failed++;
        results.verifiers.errors.push({
          userId: verifier.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // 5. Summary
    console.log(`\n📊 Settlement Summary:`);
    console.log(`\n  Sellers:`);
    console.log(`   ✅ Successful: ${results.sellers.successful}`);
    console.log(`   ❌ Failed: ${results.sellers.failed}`);
    console.log(`\n  Verifiers:`);
    console.log(`   ✅ Successful: ${results.verifiers.successful}`);
    console.log(`   ❌ Failed: ${results.verifiers.failed}`);

    if (results.sellers.errors.length > 0) {
      console.log(`\n⚠️  Seller Errors:`);
      results.sellers.errors.forEach((err) => {
        console.log(`   - User ${err.userId}: ${err.error}`);
      });
    }

    if (results.verifiers.errors.length > 0) {
      console.log(`\n⚠️  Verifier Errors:`);
      results.verifiers.errors.forEach((err) => {
        console.log(`   - User ${err.userId}: ${err.error}`);
      });
    }

    console.log(`\n✨ Monthly settlement process completed!`);

    return results;
  } catch (error) {
    console.error('❌ Fatal error during settlement process:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Run settlement for specific seller (manual trigger)
 */
export async function runSettlementForSeller(
  sellerId: string,
  periodStart?: Date,
  periodEnd?: Date
) {
  const start = periodStart || startOfMonth(subMonths(new Date(), 1));
  const end = periodEnd || endOfMonth(subMonths(new Date(), 1));

  console.log(`🔧 Running manual settlement for seller ${sellerId}`);
  console.log(`📅 Period: ${format(start, 'yyyy-MM-dd')} to ${format(end, 'yyyy-MM-dd')}`);

  try {
    const { settlement, calculation } = await calculateSettlement({
      sellerId,
      periodStart: start,
      periodEnd: end,
    });

    console.log(`✅ Settlement created: ${settlement.id}`);
    console.log(`   Total: ${settlement.currency} ${(calculation.totalSales / 100).toFixed(2)}`);
    console.log(`   Fee: ${settlement.currency} ${(calculation.platformFee / 100).toFixed(2)}`);
    console.log(`   Net: ${settlement.currency} ${(calculation.netAmount / 100).toFixed(2)}`);

    await sendSettlementNotification(sellerId, settlement.id);

    return settlement;
  } catch (error) {
    console.error('❌ Failed to create settlement:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// If running directly from command line
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args[0] === 'seller' && args[1]) {
    // Run for specific seller
    runSettlementForSeller(args[1])
      .then(() => process.exit(0))
      .catch((error) => {
        console.error(error);
        process.exit(1);
      });
  } else {
    // Run monthly settlement for all sellers
    runMonthlySettlement()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error(error);
        process.exit(1);
      });
  }
}
