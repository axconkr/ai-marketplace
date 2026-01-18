import { PrismaClient, NotificationType } from '@prisma/client';
import { format } from 'date-fns';
import {
  generateNotificationEmail,
  generateNotificationText,
} from '../email/notification-templates';

const prisma = new PrismaClient();

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface EmailData {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

interface NotificationEmailData {
  to: string;
  name?: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  data?: any;
}

/**
 * Send email (placeholder - integrate with actual email service)
 */
async function sendEmail(emailData: EmailData) {
  console.log('📧 Email to send:', emailData);
  // TODO: Integrate with SendGrid, AWS SES, or other email service
  // Example with SendGrid:
  // const msg = {
  //   to: emailData.to,
  //   from: 'noreply@marketplace.com',
  //   subject: emailData.subject,
  //   templateId: getTemplateId(emailData.template),
  //   dynamicTemplateData: emailData.data,
  // };
  // await sgMail.send(msg);
}

/**
 * Send notification email using template
 */
export async function sendEmailNotification(data: NotificationEmailData) {
  const html = generateNotificationEmail(data);
  const text = generateNotificationText(data);

  // In production, use actual email service
  console.log('📧 Notification email to send:', {
    to: data.to,
    subject: data.title,
    type: data.type,
  });

  // TODO: Integrate with email service
  // Example with SendGrid:
  // const sgMail = require('@sendgrid/mail');
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  // await sgMail.send({
  //   to: data.to,
  //   from: process.env.FROM_EMAIL,
  //   subject: data.title,
  //   html,
  //   text,
  // });

  // Example with AWS SES:
  // const ses = new AWS.SES({ region: 'us-east-1' });
  // await ses.sendEmail({
  //   Source: process.env.FROM_EMAIL,
  //   Destination: { ToAddresses: [data.to] },
  //   Message: {
  //     Subject: { Data: data.title },
  //     Body: {
  //       Html: { Data: html },
  //       Text: { Data: text },
  //     },
  //   },
  // }).promise();
}

/**
 * Format currency for display
 */
function formatCurrency(cents: number, currency = 'USD'): string {
  const amount = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Send verification assignment notification to verifier
 */
export async function sendVerificationAssignment(
  verifierId: string,
  verificationId: string
) {
  const verification = await prisma.verification.findUnique({
    where: { id: verificationId },
    include: {
      product: {
        select: {
          id: true,
          name: true,
        },
      },
      verifier: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  });

  if (!verification || !verification.verifier) {
    throw new Error('Verification or verifier not found');
  }

  await sendEmail({
    to: verification.verifier.email,
    subject: 'New Verification Assignment',
    template: 'verification-assigned',
    data: {
      verifierName: verification.verifier.name || 'Verifier',
      productName: verification.product.name,
      level: verification.level,
      fee: formatCurrency(verification.fee),
      earning: formatCurrency(verification.verifier_share),
      link: `${APP_URL}/verifications/${verificationId}/review`,
    },
  });
}

/**
 * Send verification completion notification to seller
 */
export async function sendVerificationComplete(
  verificationId: string
) {
  const verification = await prisma.verification.findUnique({
    where: { id: verificationId },
    include: {
      product: {
        include: {
          seller: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!verification) {
    throw new Error('Verification not found');
  }

  await sendEmail({
    to: verification.product.seller.email,
    subject: `Verification Complete: ${verification.product.name}`,
    template: 'verification-complete',
    data: {
      sellerName: verification.product.seller.name || 'Seller',
      productName: verification.product.name,
      level: verification.level,
      status: verification.status,
      score: verification.score,
      badges: verification.badges,
      link: `${APP_URL}/products/${verification.product_id}`,
    },
  });
}

/**
 * Send monthly settlement notification to verifier
 */
export async function sendVerifierSettlementNotification(
  verifierId: string,
  settlementId: string
) {
  const settlement = await prisma.settlement.findUnique({
    where: { id: settlementId },
    include: {
      seller: {
        select: {
          email: true,
          name: true,
        },
      },
      verifierPayouts: {
        include: {
          verification: {
            select: {
              level: true,
            },
          },
        },
      },
    },
  });

  if (!settlement) {
    throw new Error('Settlement not found');
  }

  const periodStr = `${format(settlement.period_start, 'yyyy-MM-dd')} - ${format(settlement.period_end, 'yyyy-MM-dd')}`;

  await sendEmail({
    to: settlement.seller.email,
    subject: `Monthly Settlement Ready - ${format(settlement.period_start, 'MMM yyyy')}`,
    template: 'verifier-settlement',
    data: {
      verifierName: settlement.seller.name || 'Verifier',
      period: periodStr,
      periodMonth: format(settlement.period_start, 'MMMM yyyy'),
      verificationCount: settlement.verification_count,
      totalEarnings: formatCurrency(settlement.verification_earnings, settlement.currency),
      netAmount: formatCurrency(settlement.payout_amount, settlement.currency),
      currency: settlement.currency,
      settlementUrl: `${APP_URL}/dashboard/settlements/${settlementId}`,
      verifications: settlement.verifierPayouts.map((p) => ({
        amount: formatCurrency(p.amount, settlement.currency),
        level: p.verification.level,
      })),
    },
  });
}

/**
 * Send payout confirmation to verifier
 */
export async function sendPayoutConfirmation(
  verifierId: string,
  settlementId: string
) {
  const settlement = await prisma.settlement.findUnique({
    where: { id: settlementId },
    include: {
      seller: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  });

  if (!settlement) {
    throw new Error('Settlement not found');
  }

  await sendEmail({
    to: settlement.seller.email,
    subject: 'Payment Sent - Verification Earnings',
    template: 'payout-confirmed',
    data: {
      verifierName: settlement.seller.name || 'Verifier',
      amount: formatCurrency(settlement.payout_amount, settlement.currency),
      currency: settlement.currency,
      payoutMethod: settlement.payout_method,
      payoutDate: settlement.payout_date ? format(settlement.payout_date, 'yyyy-MM-dd') : 'N/A',
      reference: settlement.payout_reference,
    },
  });
}

/**
 * Send reminder for pending verification
 */
export async function sendVerificationReminder(
  verificationId: string,
  daysElapsed: number
) {
  const verification = await prisma.verification.findUnique({
    where: { id: verificationId },
    include: {
      product: {
        select: {
          name: true,
        },
      },
      verifier: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  });

  if (!verification || !verification.verifier) {
    return;
  }

  await sendEmail({
    to: verification.verifier.email,
    subject: 'Reminder: Pending Verification',
    template: 'verification-reminder',
    data: {
      verifierName: verification.verifier.name || 'Verifier',
      productName: verification.product.name,
      level: verification.level,
      daysElapsed,
      earning: formatCurrency(verification.verifier_share),
      link: `${APP_URL}/verifications/${verificationId}/review`,
    },
  });
}

/**
 * Send weekly earnings summary to verifier
 */
export async function sendWeeklyEarningsSummary(
  verifierId: string,
  weekStart: Date,
  weekEnd: Date
) {
  const payouts = await prisma.verifierPayout.findMany({
    where: {
      verifier_id: verifierId,
      createdAt: {
        gte: weekStart,
        lt: weekEnd,
      },
    },
    include: {
      verification: {
        select: {
          level: true,
        },
      },
    },
  });

  if (payouts.length === 0) {
    return; // No activity this week
  }

  const verifier = await prisma.user.findUnique({
    where: { id: verifierId },
    select: {
      email: true,
      name: true,
    },
  });

  if (!verifier) {
    return;
  }

  const totalEarnings = payouts.reduce((sum, p) => sum + p.amount, 0);

  await sendEmail({
    to: verifier.email,
    subject: 'Weekly Earnings Summary',
    template: 'weekly-summary',
    data: {
      verifierName: verifier.name || 'Verifier',
      weekStart: format(weekStart, 'yyyy-MM-dd'),
      weekEnd: format(weekEnd, 'yyyy-MM-dd'),
      verificationCount: payouts.length,
      totalEarnings: formatCurrency(totalEarnings),
      averageEarning: formatCurrency(Math.round(totalEarnings / payouts.length)),
    },
  });
}
