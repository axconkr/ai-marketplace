import { NotificationType } from '@prisma/client';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface EmailTemplateProps {
  name?: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  data?: any;
}

/**
 * Get notification icon HTML
 */
function getNotificationIcon(type: NotificationType): string {
  const icons: Record<NotificationType, string> = {
    ORDER_PLACED: '🛒',
    ORDER_COMPLETED: '✅',
    PAYMENT_RECEIVED: '💰',
    PAYMENT_FAILED: '❌',
    REFUND_APPROVED: '✅',
    REFUND_REJECTED: '❌',
    PRODUCT_APPROVED: '✅',
    PRODUCT_REJECTED: '❌',
    VERIFICATION_REQUESTED: '📋',
    VERIFICATION_COMPLETED: '✅',
    VERIFICATION_ASSIGNED: '📝',
    SETTLEMENT_READY: '💵',
    SETTLEMENT_PAID: '✅',
    REVIEW_RECEIVED: '⭐',
    MESSAGE_RECEIVED: '💬',
    SYSTEM_ANNOUNCEMENT: '📢',
    REQUEST_CREATED: '📝',
    PROPOSAL_SUBMITTED: '📨',
    PROPOSAL_SELECTED: '🎉',
    PROPOSAL_REJECTED: '❌',
    ESCROW_INITIATED: '🔐',
    ESCROW_RELEASED: '💸',
    SUBSCRIPTION_CREATED: '🔔',
    SUBSCRIPTION_UPDATED: '🔄',
    SUBSCRIPTION_CANCELLED: '🚫',
    SUBSCRIPTION_PAYMENT_FAILED: '⚠️',
  };
  return icons[type] || '📬';
}

/**
 * Get notification color
 */
function getNotificationColor(type: NotificationType): string {
  const colors: Record<NotificationType, string> = {
    ORDER_PLACED: '#3b82f6',
    ORDER_COMPLETED: '#10b981',
    PAYMENT_RECEIVED: '#10b981',
    PAYMENT_FAILED: '#ef4444',
    REFUND_APPROVED: '#10b981',
    REFUND_REJECTED: '#ef4444',
    PRODUCT_APPROVED: '#10b981',
    PRODUCT_REJECTED: '#ef4444',
    VERIFICATION_REQUESTED: '#3b82f6',
    VERIFICATION_COMPLETED: '#10b981',
    VERIFICATION_ASSIGNED: '#3b82f6',
    SETTLEMENT_READY: '#10b981',
    SETTLEMENT_PAID: '#10b981',
    REVIEW_RECEIVED: '#f59e0b',
    MESSAGE_RECEIVED: '#3b82f6',
    SYSTEM_ANNOUNCEMENT: '#6366f1',
    REQUEST_CREATED: '#3b82f6',
    PROPOSAL_SUBMITTED: '#3b82f6',
    PROPOSAL_SELECTED: '#10b981',
    PROPOSAL_REJECTED: '#ef4444',
    ESCROW_INITIATED: '#8b5cf6',
    ESCROW_RELEASED: '#10b981',
    SUBSCRIPTION_CREATED: '#3b82f6',
    SUBSCRIPTION_UPDATED: '#3b82f6',
    SUBSCRIPTION_CANCELLED: '#ef4444',
    SUBSCRIPTION_PAYMENT_FAILED: '#ef4444',
  };
  return colors[type] || '#6b7280';
}

/**
 * Generate email HTML template
 */
export function generateNotificationEmail(props: EmailTemplateProps): string {
  const { name = 'there', type, title, message, link, data } = props;
  const icon = getNotificationIcon(type);
  const color = getNotificationColor(type);

  const buttonHtml = link
    ? `
      <div style="margin: 30px 0; text-align: center;">
        <a href="${APP_URL}${link}"
           style="display: inline-block; background: ${color}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500;">
          View Details
        </a>
      </div>
    `
    : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
    }
    .header {
      background: ${color};
      color: white;
      padding: 30px;
      text-align: center;
    }
    .icon {
      font-size: 48px;
      margin-bottom: 10px;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .content {
      padding: 30px;
    }
    .message-box {
      background: #f9fafb;
      border-left: 4px solid ${color};
      padding: 15px 20px;
      margin: 20px 0;
    }
    .button {
      display: inline-block;
      background: ${color};
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 500;
    }
    .footer {
      background: #f9fafb;
      padding: 20px 30px;
      text-align: center;
      color: #6b7280;
      font-size: 12px;
      border-top: 1px solid #e5e7eb;
    }
    .footer a {
      color: ${color};
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="icon">${icon}</div>
      <h1>${title}</h1>
    </div>

    <div class="content">
      <p>Hello ${name},</p>

      <div class="message-box">
        <p style="margin: 0;">${message}</p>
      </div>

      ${buttonHtml}

      <p style="color: #6b7280; font-size: 14px;">
        This is an automated notification from AI Marketplace.
        You can manage your notification preferences in your
        <a href="${APP_URL}/settings/notifications" style="color: ${color};">account settings</a>.
      </p>
    </div>

    <div class="footer">
      <p style="margin: 0 0 10px 0;">AI Marketplace</p>
      <p style="margin: 0;">
        <a href="${APP_URL}/settings/notifications">Notification Settings</a> |
        <a href="${APP_URL}/help">Help Center</a>
      </p>
      <p style="margin: 10px 0 0 0;">
        © ${new Date().getFullYear()} AI Marketplace. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate plain text version of notification email
 */
export function generateNotificationText(props: EmailTemplateProps): string {
  const { name = 'there', title, message, link } = props;

  let text = `Hello ${name},\n\n`;
  text += `${title}\n\n`;
  text += `${message}\n\n`;

  if (link) {
    text += `View Details: ${APP_URL}${link}\n\n`;
  }

  text += `---\n`;
  text += `This is an automated notification from AI Marketplace.\n`;
  text += `Manage your notification preferences: ${APP_URL}/settings/notifications\n\n`;
  text += `© ${new Date().getFullYear()} AI Marketplace. All rights reserved.`;

  return text;
}
