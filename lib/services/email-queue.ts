import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/email/resend';
import { EmailQueueStatus } from '@prisma/client';

const MAX_ATTEMPTS = 3;
const BATCH_SIZE = 50;

export interface QueueEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
  scheduledAt?: Date;
}

export async function queueEmail(params: QueueEmailParams): Promise<string> {
  const email = await prisma.emailQueue.create({
    data: {
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
      scheduled_at: params.scheduledAt || new Date(),
    },
  });

  return email.id;
}

export async function queueBulkEmails(
  emails: QueueEmailParams[]
): Promise<number> {
  const result = await prisma.emailQueue.createMany({
    data: emails.map((e) => ({
      to: e.to,
      subject: e.subject,
      html: e.html,
      text: e.text,
      scheduled_at: e.scheduledAt || new Date(),
    })),
  });

  return result.count;
}

export async function processEmailQueue(): Promise<{
  processed: number;
  sent: number;
  failed: number;
}> {
  const pendingEmails = await prisma.emailQueue.findMany({
    where: {
      status: EmailQueueStatus.PENDING,
      scheduled_at: { lte: new Date() },
      attempts: { lt: MAX_ATTEMPTS },
    },
    take: BATCH_SIZE,
    orderBy: { scheduled_at: 'asc' },
  });

  let sent = 0;
  let failed = 0;

  for (const email of pendingEmails) {
    await prisma.emailQueue.update({
      where: { id: email.id },
      data: { status: EmailQueueStatus.PROCESSING },
    });

    try {
      await sendEmail({
        to: email.to,
        subject: email.subject,
        html: email.html,
        text: email.text || undefined,
      });

      await prisma.emailQueue.update({
        where: { id: email.id },
        data: {
          status: EmailQueueStatus.SENT,
          sent_at: new Date(),
        },
      });
      sent++;
    } catch (error) {
      const newAttempts = email.attempts + 1;
      const status =
        newAttempts >= MAX_ATTEMPTS
          ? EmailQueueStatus.FAILED
          : EmailQueueStatus.PENDING;

      await prisma.emailQueue.update({
        where: { id: email.id },
        data: {
          status,
          attempts: newAttempts,
          last_error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      failed++;
    }
  }

  return {
    processed: pendingEmails.length,
    sent,
    failed,
  };
}

export async function cleanupOldEmails(olderThanDays = 30): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

  const result = await prisma.emailQueue.deleteMany({
    where: {
      status: { in: [EmailQueueStatus.SENT, EmailQueueStatus.FAILED] },
      created_at: { lte: cutoffDate },
    },
  });

  return result.count;
}

export async function getQueueStats(): Promise<{
  pending: number;
  processing: number;
  sent: number;
  failed: number;
}> {
  const [pending, processing, sent, failed] = await Promise.all([
    prisma.emailQueue.count({ where: { status: EmailQueueStatus.PENDING } }),
    prisma.emailQueue.count({ where: { status: EmailQueueStatus.PROCESSING } }),
    prisma.emailQueue.count({ where: { status: EmailQueueStatus.SENT } }),
    prisma.emailQueue.count({ where: { status: EmailQueueStatus.FAILED } }),
  ]);

  return { pending, processing, sent, failed };
}
