import { PrismaClient } from '@prisma/client';
import { format } from 'date-fns';

const prisma = new PrismaClient();

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email notification (integrate with SendGrid, AWS SES, etc.)
 */
async function sendEmail(data: EmailData): Promise<void> {
  // In production, integrate with email service
  // Example with SendGrid:
  // const sgMail = require('@sendgrid/mail');
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  // await sgMail.send({
  //   to: data.to,
  //   from: process.env.FROM_EMAIL,
  //   subject: data.subject,
  //   html: data.html,
  //   text: data.text,
  // });

  console.log('📧 Email would be sent:', {
    to: data.to,
    subject: data.subject,
  });
}

/**
 * Send settlement created notification
 */
export async function sendSettlementCreatedEmail(
  sellerId: string,
  settlementId: string
): Promise<void> {
  const settlement = await prisma.settlement.findUnique({
    where: { id: settlementId },
    include: {
      seller: true,
      items: true,
    },
  });

  if (!settlement) {
    throw new Error('Settlement not found');
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settlement.currency,
    }).format(amount / 100);
  };

  const periodStr = `${format(settlement.period_start, 'MMMM yyyy')}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .summary { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .row.total { font-weight: bold; font-size: 18px; border-top: 2px solid #3b82f6; border-bottom: none; }
    .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Settlement Ready!</h1>
      <p>Your earnings for ${periodStr} are ready</p>
    </div>

    <div class="content">
      <p>Hello ${settlement.seller.name || 'there'},</p>

      <p>Great news! Your settlement for ${periodStr} has been calculated and is ready for payout.</p>

      <div class="summary">
        <h2 style="margin-top: 0;">Settlement Summary</h2>
        <div class="row">
          <span>Total Sales</span>
          <span>${formatCurrency(settlement.total_amount)}</span>
        </div>
        <div class="row">
          <span>Platform Fee</span>
          <span>-${formatCurrency(settlement.platform_fee)}</span>
        </div>
        <div class="row total">
          <span>Net Payout</span>
          <span>${formatCurrency(settlement.payout_amount)}</span>
        </div>
        <p style="margin-top: 15px; color: #6b7280; font-size: 14px;">
          Based on ${settlement.items.length} order(s)
        </p>
      </div>

      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settlements/${settlementId}" class="button">
          View Settlement Details
        </a>
      </p>

      <p><strong>What happens next?</strong></p>
      <ul>
        <li>Settlement will be processed on the 1st of the month</li>
        <li>Payment will be sent to your registered bank account</li>
        <li>You'll receive a confirmation email once payment is complete</li>
      </ul>

      <p>If you have any questions, please don't hesitate to contact our support team.</p>

      <p>Best regards,<br>AI Marketplace Team</p>
    </div>

    <div class="footer">
      <p>This is an automated email from AI Marketplace</p>
      <p>© ${new Date().getFullYear()} AI Marketplace. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  await sendEmail({
    to: settlement.seller.email,
    subject: `Settlement Ready: ${formatCurrency(settlement.payout_amount)} for ${periodStr}`,
    html,
  });
}

/**
 * Send settlement paid notification
 */
export async function sendSettlementPaidEmail(settlementId: string): Promise<void> {
  const settlement = await prisma.settlement.findUnique({
    where: { id: settlementId },
    include: { seller: true },
  });

  if (!settlement) {
    throw new Error('Settlement not found');
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settlement.currency,
    }).format(amount / 100);
  };

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .success-box { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Payment Sent!</h1>
    </div>

    <div class="content">
      <p>Hello ${settlement.seller.name || 'there'},</p>

      <div class="success-box">
        <p style="margin: 0;"><strong>Your settlement payment has been processed!</strong></p>
        <p style="margin: 10px 0 0 0; font-size: 24px; font-weight: bold; color: #10b981;">
          ${formatCurrency(settlement.payout_amount)}
        </p>
      </div>

      <p><strong>Payment Details:</strong></p>
      <ul>
        <li>Settlement ID: ${settlement.id}</li>
        <li>Amount: ${formatCurrency(settlement.payout_amount)}</li>
        <li>Method: ${settlement.payout_method || 'Bank Transfer'}</li>
        <li>Date: ${settlement.payout_date ? format(settlement.payout_date, 'MMMM dd, yyyy') : 'N/A'}</li>
        ${settlement.payout_reference ? `<li>Reference: ${settlement.payout_reference}</li>` : ''}
      </ul>

      <p>The payment should appear in your account within 1-3 business days.</p>

      <p>Thank you for being a valued seller on AI Marketplace!</p>

      <p>Best regards,<br>AI Marketplace Team</p>
    </div>

    <div class="footer">
      <p>© ${new Date().getFullYear()} AI Marketplace. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  await sendEmail({
    to: settlement.seller.email,
    subject: `Payment Sent: ${formatCurrency(settlement.payout_amount)}`,
    html,
  });
}

/**
 * Send settlement failed notification
 */
export async function sendSettlementFailedEmail(
  settlementId: string,
  reason?: string
): Promise<void> {
  const settlement = await prisma.settlement.findUnique({
    where: { id: settlementId },
    include: { seller: true },
  });

  if (!settlement) {
    throw new Error('Settlement not found');
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #ef4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .error-box { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
    .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ Settlement Payment Issue</h1>
    </div>

    <div class="content">
      <p>Hello ${settlement.seller.name || 'there'},</p>

      <div class="error-box">
        <p style="margin: 0;"><strong>We encountered an issue processing your settlement payment.</strong></p>
        ${reason ? `<p style="margin: 10px 0 0 0;">Reason: ${reason}</p>` : ''}
      </div>

      <p><strong>What you should do:</strong></p>
      <ul>
        <li>Verify your bank account details are correct</li>
        <li>Check that your account is active and can receive payments</li>
        <li>Contact support if you need assistance</li>
      </ul>

      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/bank-account" class="button">
          Update Bank Account
        </a>
      </p>

      <p>We're here to help! If you have any questions, please contact our support team.</p>

      <p>Best regards,<br>AI Marketplace Team</p>
    </div>

    <div class="footer">
      <p>© ${new Date().getFullYear()} AI Marketplace. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  await sendEmail({
    to: settlement.seller.email,
    subject: 'Action Required: Settlement Payment Issue',
    html,
  });
}

/**
 * Send bank account verification email
 */
export async function sendBankVerificationEmail(
  userId: string,
  verificationCode: string
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .code { background: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Bank Account Verification</h1>

    <p>Hello ${user.name || 'there'},</p>

    <p>We've initiated a small deposit (1원) to your bank account ending in ${user.bank_account?.slice(-4)}.</p>

    <p>Please check your bank statement for a deposit with this verification code:</p>

    <div class="code">${verificationCode}</div>

    <p>Enter this code in your account settings to complete verification.</p>

    <p>Best regards,<br>AI Marketplace Team</p>
  </div>
</body>
</html>
  `;

  await sendEmail({
    to: user.email,
    subject: 'Verify Your Bank Account',
    html,
  });
}
