import { NextRequest, NextResponse } from 'next/server';
import { processEmailQueue, cleanupOldEmails, getQueueStats } from '@/lib/services/email-queue';

const CRON_SECRET = process.env.CRON_SECRET;

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await processEmailQueue();
    const cleanedUp = await cleanupOldEmails(30);
    const stats = await getQueueStats();

    return NextResponse.json({
      success: true,
      result,
      cleanedUp,
      stats,
    });
  } catch (error) {
    console.error('Email queue processing failed:', error);
    return NextResponse.json(
      { error: 'Processing failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return POST(request);
}
