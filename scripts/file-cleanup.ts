/**
 * File Cleanup Script
 * Automatically removes files marked as deleted for more than 30 days
 * Run this as a cron job in production
 */

import { PrismaClient } from '@prisma/client';
import { cleanupDeletedFiles } from '../lib/services/file';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting file cleanup...');

  try {
    // Default: 30 days retention for deleted files
    const retentionDays = parseInt(process.env.FILE_RETENTION_DAYS || '30');

    console.log(`Cleaning up files deleted more than ${retentionDays} days ago...`);

    const deletedCount = await cleanupDeletedFiles(retentionDays);

    console.log(`✓ Successfully cleaned up ${deletedCount} file(s)`);

    // Optional: Display storage statistics
    const stats = await prisma.file.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
      _sum: {
        size: true,
      },
    });

    console.log('\nCurrent Storage Statistics:');
    stats.forEach((stat) => {
      const totalSize = stat._sum.size || 0;
      const sizeMB = (totalSize / 1024 / 1024).toFixed(2);
      console.log(
        `  ${stat.status}: ${stat._count.id} files, ${sizeMB} MB`
      );
    });

    process.exit(0);
  } catch (error) {
    console.error('Cleanup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
