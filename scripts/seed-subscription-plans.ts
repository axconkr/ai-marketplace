/**
 * Seed subscription plans to database
 * Run: tsx scripts/seed-subscription-plans.ts
 */

import { PrismaClient } from '@prisma/client';
import { PLAN_PRICING } from '../src/lib/subscriptions/types';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding subscription plans...');

  for (const plan of PLAN_PRICING) {
    const result = await prisma.subscriptionPlan.upsert({
      where: { tier: plan.tier },
      update: {
        name: plan.name,
        description: plan.description,
        monthlyPrice: plan.monthlyPrice,
        yearlyPrice: plan.yearlyPrice,
        features: plan.features,
        isActive: plan.isActive,
        sortOrder: plan.sortOrder,
      },
      create: {
        tier: plan.tier,
        name: plan.name,
        description: plan.description,
        features: plan.features,
        monthlyPrice: plan.monthlyPrice,
        yearlyPrice: plan.yearlyPrice,
        isActive: plan.isActive,
        sortOrder: plan.sortOrder,
      },
    });

    console.log(`✓ ${result.name} (${result.tier})`);
  }

  console.log('\nSubscription plans seeded successfully!');
  console.log('\nNext steps:');
  console.log('1. Create products and prices in Stripe Dashboard');
  console.log('2. Update plans with Stripe price IDs:');
  console.log('   - Monthly price ID');
  console.log('   - Yearly price ID');
  console.log('3. Configure webhook endpoint in Stripe');
  console.log('4. Set STRIPE_WEBHOOK_SECRET in .env.local');
}

main()
  .catch((error) => {
    console.error('Error seeding plans:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
