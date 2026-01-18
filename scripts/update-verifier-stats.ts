import { PrismaClient } from '@prisma/client';
import { updateVerifierStats } from '../lib/services/verifier-earnings';

const prisma = new PrismaClient();

/**
 * Update verifier statistics for all verifiers
 */
export async function updateAllVerifierStats() {
  console.log('🔄 Starting verifier stats update...');

  try {
    // Get all users with verifier role
    const verifiers = await prisma.user.findMany({
      where: {
        role: 'verifier',
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    console.log(`📊 Found ${verifiers.length} verifiers`);

    const results = {
      successful: 0,
      failed: 0,
      errors: [] as Array<{ verifierId: string; error: string }>,
    };

    for (const verifier of verifiers) {
      try {
        console.log(`\n🔍 Updating stats for: ${verifier.email} (${verifier.id})`);

        const stats = await updateVerifierStats(verifier.id);

        console.log(`✅ Stats updated:`);
        console.log(`   Total Verifications: ${stats.total_verifications}`);
        console.log(`   Total Earnings: $${(stats.total_earnings / 100).toFixed(2)}`);
        console.log(`   Approval Rate: ${(stats.approval_rate * 100).toFixed(1)}%`);
        console.log(`   Avg Score: ${stats.average_score_given.toFixed(1)}`);
        console.log(`   Avg Review Time: ${stats.average_review_time_hours.toFixed(1)} hours`);

        results.successful++;
      } catch (error) {
        console.error(`❌ Failed to update stats for verifier ${verifier.id}:`, error);
        results.failed++;
        results.errors.push({
          verifierId: verifier.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    console.log(`\n📊 Update Summary:`);
    console.log(`   ✅ Successful: ${results.successful}`);
    console.log(`   ❌ Failed: ${results.failed}`);

    if (results.errors.length > 0) {
      console.log(`\n⚠️  Errors:`);
      results.errors.forEach((err) => {
        console.log(`   - Verifier ${err.verifierId}: ${err.error}`);
      });
    }

    console.log(`\n✨ Verifier stats update completed!`);

    return results;
  } catch (error) {
    console.error('❌ Fatal error during stats update:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Update stats for a specific verifier
 */
export async function updateStatsForVerifier(verifierId: string) {
  console.log(`🔧 Updating stats for verifier ${verifierId}`);

  try {
    const stats = await updateVerifierStats(verifierId);

    console.log(`✅ Stats updated:`);
    console.log(`   Total Verifications: ${stats.total_verifications}`);
    console.log(`   Total Earnings: $${(stats.total_earnings / 100).toFixed(2)}`);
    console.log(`   Approval Rate: ${(stats.approval_rate * 100).toFixed(1)}%`);
    console.log(`   Avg Score: ${stats.average_score_given.toFixed(1)}`);
    console.log(`   Avg Review Time: ${stats.average_review_time_hours.toFixed(1)} hours`);

    return stats;
  } catch (error) {
    console.error('❌ Failed to update stats:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Generate verifier performance report
 */
export async function generateVerifierReport(verifierId?: string) {
  console.log('📊 Generating verifier performance report...');

  try {
    const where: any = { role: 'verifier' };
    if (verifierId) {
      where.id = verifierId;
    }

    const verifiers = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        verifier_stats: true,
        _count: {
          select: {
            verificationsAsVerifier: true,
            verifierPayouts: true,
          },
        },
      },
    });

    console.log(`\n📊 Verifier Performance Report`);
    console.log(`${'='.repeat(80)}\n`);

    verifiers.forEach((verifier) => {
      const stats = verifier.verifier_stats as any || {};

      console.log(`Verifier: ${verifier.name || verifier.email}`);
      console.log(`Email: ${verifier.email}`);
      console.log(`ID: ${verifier.id}`);
      console.log(`\nPerformance Metrics:`);
      console.log(`  Total Verifications: ${stats.total_verifications || 0}`);
      console.log(`  Total Earnings: $${((stats.total_earnings || 0) / 100).toFixed(2)}`);
      console.log(`  Approval Rate: ${((stats.approval_rate || 0) * 100).toFixed(1)}%`);
      console.log(`  Avg Quality Score: ${(stats.average_score_given || 0).toFixed(1)}/100`);
      console.log(`  Avg Review Time: ${(stats.average_review_time_hours || 0).toFixed(1)} hours`);
      console.log(`\n${'-'.repeat(80)}\n`);
    });

    return verifiers;
  } catch (error) {
    console.error('❌ Failed to generate report:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// If running directly from command line
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === 'update') {
    // Update all verifier stats
    updateAllVerifierStats()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error(error);
        process.exit(1);
      });
  } else if (command === 'verifier' && args[1]) {
    // Update specific verifier
    updateStatsForVerifier(args[1])
      .then(() => process.exit(0))
      .catch((error) => {
        console.error(error);
        process.exit(1);
      });
  } else if (command === 'report') {
    // Generate report
    generateVerifierReport(args[1])
      .then(() => process.exit(0))
      .catch((error) => {
        console.error(error);
        process.exit(1);
      });
  } else {
    console.log('Usage:');
    console.log('  npm run update-verifier-stats update          - Update all verifier stats');
    console.log('  npm run update-verifier-stats verifier <id>   - Update specific verifier');
    console.log('  npm run update-verifier-stats report [id]     - Generate performance report');
    process.exit(0);
  }
}
