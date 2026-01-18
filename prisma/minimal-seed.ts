import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../.env.local') });

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting minimal database seed...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@aimarket.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin',
      emailVerified: true,
    },
  });
  console.log('✅ Created admin user');

  // Create seller
  const seller = await prisma.user.create({
    data: {
      email: 'seller@example.com',
      password: hashedPassword,
      name: 'Test Seller',
      role: 'seller',
      emailVerified: true,
    },
  });
  console.log('✅ Created seller user');

  // Create buyer
  const buyer = await prisma.user.create({
    data: {
      email: 'buyer@example.com',
      password: hashedPassword,
      name: 'Test Buyer',
      role: 'user',
      emailVerified: true,
    },
  });
  console.log('✅ Created buyer user');

  // Create test products
  const product1 = await prisma.product.create({
    data: {
      name: 'Test AI Workflow',
      description: 'A test AI automation workflow',
      category: 'WORKFLOW',
      price: 99.99,
      currency: 'USD',
      status: 'ACTIVE',
      seller_id: seller.id,
    },
  });

  const product2 = await prisma.product.create({
    data: {
      name: 'Another Test Workflow',
      description: 'Another test automation',
      category: 'WORKFLOW',
      price: 49.99,
      currency: 'USD',
      status: 'ACTIVE',
      seller_id: seller.id,
    },
  });

  console.log('✅ Created 2 test products');
  console.log('\n✨ Seeding completed successfully!');
  console.log('\nTest Users:');
  console.log('  Admin: admin@aimarket.com / password123');
  console.log('  Seller: seller@example.com / password123');
  console.log('  Buyer: buyer@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
