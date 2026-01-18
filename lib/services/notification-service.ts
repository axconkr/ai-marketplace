import { PrismaClient, NotificationType } from '@prisma/client';
import { sendEmailNotification } from './email-notifications';

const prisma = new PrismaClient();

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  data?: any;
}

/**
 * Get notification category for user settings
 */
function getNotificationCategory(type: NotificationType): string {
  const categoryMap: Record<NotificationType, string> = {
    ORDER_PLACED: 'orders',
    ORDER_COMPLETED: 'orders',
    PAYMENT_RECEIVED: 'payments',
    PAYMENT_FAILED: 'payments',
    REFUND_APPROVED: 'refunds',
    REFUND_REJECTED: 'refunds',
    PRODUCT_APPROVED: 'products',
    PRODUCT_REJECTED: 'products',
    VERIFICATION_REQUESTED: 'verifications',
    VERIFICATION_COMPLETED: 'verifications',
    VERIFICATION_ASSIGNED: 'verifications',
    SETTLEMENT_READY: 'settlements',
    SETTLEMENT_PAID: 'settlements',
    REVIEW_RECEIVED: 'reviews',
    MESSAGE_RECEIVED: 'messages',
    SYSTEM_ANNOUNCEMENT: 'system',
  };
  return categoryMap[type] || 'system';
}

/**
 * Create a notification for a user
 */
export async function createNotification(params: CreateNotificationParams) {
  const { userId, type, title, message, link, data } = params;

  // Get user notification preferences
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      notification_settings: true,
      email: true,
      name: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const settings = (user.notification_settings as any) || {};
  const category = getNotificationCategory(type);

  // Create in-app notification (always create)
  const notification = await prisma.notification.create({
    data: {
      user_id: userId,
      type,
      title,
      message,
      link,
      data,
    },
  });

  // Send email if enabled (default to true if not set)
  const emailEnabled = settings.email?.[category] !== false;
  if (emailEnabled) {
    try {
      await sendEmailNotification({
        to: user.email,
        name: user.name || undefined,
        type,
        title,
        message,
        link,
        data,
      });
    } catch (error) {
      console.error('Failed to send email notification:', error);
      // Don't fail the whole operation if email fails
    }
  }

  return notification;
}

/**
 * Create bulk notifications
 */
export async function createBulkNotifications(notifications: CreateNotificationParams[]) {
  const createdNotifications = await prisma.notification.createMany({
    data: notifications.map(n => ({
      user_id: n.userId,
      type: n.type,
      title: n.title,
      message: n.message,
      link: n.link,
      data: n.data,
    })),
  });

  // TODO: Send bulk emails asynchronously

  return createdNotifications;
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string, userId: string) {
  return await prisma.notification.update({
    where: {
      id: notificationId,
      user_id: userId, // Ensure user owns this notification
    },
    data: {
      read: true,
      read_at: new Date(),
    },
  });
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string) {
  return await prisma.notification.updateMany({
    where: {
      user_id: userId,
      read: false,
    },
    data: {
      read: true,
      read_at: new Date(),
    },
  });
}

/**
 * Delete notification
 */
export async function deleteNotification(notificationId: string, userId: string) {
  return await prisma.notification.delete({
    where: {
      id: notificationId,
      user_id: userId,
    },
  });
}

/**
 * Clear all read notifications for a user
 */
export async function clearAllReadNotifications(userId: string) {
  return await prisma.notification.deleteMany({
    where: {
      user_id: userId,
      read: true,
    },
  });
}

/**
 * Get notifications for a user
 */
export async function getUserNotifications(params: {
  userId: string;
  unreadOnly?: boolean;
  page?: number;
  limit?: number;
}) {
  const { userId, unreadOnly = false, page = 1, limit = 20 } = params;

  const notifications = await prisma.notification.findMany({
    where: {
      user_id: userId,
      ...(unreadOnly && { read: false }),
    },
    orderBy: { created_at: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
  });

  const unreadCount = await prisma.notification.count({
    where: { user_id: userId, read: false },
  });

  const totalCount = await prisma.notification.count({
    where: {
      user_id: userId,
      ...(unreadOnly && { read: false }),
    },
  });

  return {
    notifications,
    unreadCount,
    totalCount,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit),
  };
}

// ============================================================================
// ORDER NOTIFICATIONS
// ============================================================================

export async function notifyNewOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      product: true,
      buyer: true,
    },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  await createNotification({
    userId: order.product.seller_id,
    type: 'ORDER_PLACED',
    title: 'New Order Received',
    message: `${order.buyer.name} purchased ${order.product.name}`,
    link: `/dashboard/orders/${orderId}`,
    data: {
      orderId,
      amount: order.amount,
      productId: order.product_id,
      buyerId: order.buyer_id,
    },
  });
}

export async function notifyOrderCompleted(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { product: true },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  await createNotification({
    userId: order.buyer_id,
    type: 'ORDER_COMPLETED',
    title: 'Order Completed',
    message: `Your order for ${order.product.name} is ready for download`,
    link: `/orders/${orderId}`,
    data: { orderId, productId: order.product_id },
  });
}

// ============================================================================
// PAYMENT NOTIFICATIONS
// ============================================================================

export async function notifyPaymentReceived(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { product: true },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  await createNotification({
    userId: order.product.seller_id,
    type: 'PAYMENT_RECEIVED',
    title: 'Payment Received',
    message: `Payment of ${formatCurrency(order.seller_amount, order.currency)} received for ${order.product.name}`,
    link: `/dashboard/orders/${orderId}`,
    data: { orderId, amount: order.seller_amount },
  });
}

export async function notifyPaymentFailed(orderId: string, reason?: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { product: true },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  await createNotification({
    userId: order.buyer_id,
    type: 'PAYMENT_FAILED',
    title: 'Payment Failed',
    message: reason
      ? `Payment for ${order.product.name} failed: ${reason}`
      : `Payment for ${order.product.name} failed`,
    link: `/orders/${orderId}`,
    data: { orderId, reason },
  });
}

// ============================================================================
// REFUND NOTIFICATIONS
// ============================================================================

export async function notifyRefundApproved(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { product: true },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  await createNotification({
    userId: order.buyer_id,
    type: 'REFUND_APPROVED',
    title: 'Refund Approved',
    message: `Your refund of ${formatCurrency(order.amount, order.currency)} has been approved`,
    link: `/orders/${orderId}`,
    data: { orderId, amount: order.amount },
  });
}

export async function notifyRefundRejected(orderId: string, reason?: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { product: true },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  await createNotification({
    userId: order.buyer_id,
    type: 'REFUND_REJECTED',
    title: 'Refund Request Rejected',
    message: reason
      ? `Your refund request was rejected: ${reason}`
      : 'Your refund request was rejected',
    link: `/orders/${orderId}`,
    data: { orderId, reason },
  });
}

// ============================================================================
// VERIFICATION NOTIFICATIONS
// ============================================================================

export async function notifyVerificationRequested(verificationId: string) {
  const verification = await prisma.verification.findUnique({
    where: { id: verificationId },
    include: { product: true },
  });

  if (!verification) {
    throw new Error('Verification not found');
  }

  await createNotification({
    userId: verification.product.seller_id,
    type: 'VERIFICATION_REQUESTED',
    title: 'Verification Requested',
    message: `Level ${verification.level} verification requested for ${verification.product.name}`,
    link: `/dashboard/verifications/${verificationId}`,
    data: { verificationId, level: verification.level },
  });
}

export async function notifyVerificationCompleted(verificationId: string) {
  const verification = await prisma.verification.findUnique({
    where: { id: verificationId },
    include: { product: true },
  });

  if (!verification) {
    throw new Error('Verification not found');
  }

  const approved = verification.status === 'APPROVED';

  await createNotification({
    userId: verification.product.seller_id,
    type: 'VERIFICATION_COMPLETED',
    title: approved ? 'Product Approved' : 'Verification Complete',
    message: approved
      ? `${verification.product.name} has been verified (Level ${verification.level})`
      : `Verification for ${verification.product.name} is complete`,
    link: `/dashboard/verifications/${verificationId}`,
    data: {
      verificationId,
      level: verification.level,
      approved,
      score: verification.score,
    },
  });
}

export async function notifyVerificationAssigned(verificationId: string) {
  const verification = await prisma.verification.findUnique({
    where: { id: verificationId },
    include: { product: true },
  });

  if (!verification || !verification.verifier_id) {
    throw new Error('Verification or verifier not found');
  }

  await createNotification({
    userId: verification.verifier_id,
    type: 'VERIFICATION_ASSIGNED',
    title: 'New Verification Assignment',
    message: `You've been assigned to verify ${verification.product.name} (Level ${verification.level})`,
    link: `/verifications/${verificationId}/review`,
    data: {
      verificationId,
      level: verification.level,
      earning: verification.verifier_share,
    },
  });
}

export async function notifyProductApproved(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  await createNotification({
    userId: product.seller_id,
    type: 'PRODUCT_APPROVED',
    title: 'Product Approved',
    message: `${product.name} has been approved and is now live`,
    link: `/products/${productId}`,
    data: { productId },
  });
}

export async function notifyProductRejected(productId: string, reason?: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  await createNotification({
    userId: product.seller_id,
    type: 'PRODUCT_REJECTED',
    title: 'Product Rejected',
    message: reason
      ? `${product.name} was rejected: ${reason}`
      : `${product.name} was rejected`,
    link: `/dashboard/products/${productId}`,
    data: { productId, reason },
  });
}

// ============================================================================
// SETTLEMENT NOTIFICATIONS
// ============================================================================

export async function notifySettlementReady(settlementId: string) {
  const settlement = await prisma.settlement.findUnique({
    where: { id: settlementId },
  });

  if (!settlement) {
    throw new Error('Settlement not found');
  }

  await createNotification({
    userId: settlement.seller_id,
    type: 'SETTLEMENT_READY',
    title: 'Monthly Settlement Ready',
    message: `Your settlement of ${formatCurrency(settlement.payout_amount, settlement.currency)} is ready`,
    link: `/dashboard/settlements/${settlementId}`,
    data: {
      settlementId,
      amount: settlement.payout_amount,
      currency: settlement.currency,
    },
  });
}

export async function notifySettlementPaid(settlementId: string) {
  const settlement = await prisma.settlement.findUnique({
    where: { id: settlementId },
  });

  if (!settlement) {
    throw new Error('Settlement not found');
  }

  await createNotification({
    userId: settlement.seller_id,
    type: 'SETTLEMENT_PAID',
    title: 'Settlement Paid',
    message: `Your settlement of ${formatCurrency(settlement.payout_amount, settlement.currency)} has been paid`,
    link: `/dashboard/settlements/${settlementId}`,
    data: {
      settlementId,
      amount: settlement.payout_amount,
      currency: settlement.currency,
      payoutDate: settlement.payout_date,
    },
  });
}

// ============================================================================
// SYSTEM NOTIFICATIONS
// ============================================================================

export async function notifySystemAnnouncement(params: {
  userIds?: string[]; // If not provided, notify all users
  title: string;
  message: string;
  link?: string;
  data?: any;
}) {
  const { userIds, title, message, link, data } = params;

  if (userIds) {
    // Notify specific users
    await createBulkNotifications(
      userIds.map(userId => ({
        userId,
        type: 'SYSTEM_ANNOUNCEMENT',
        title,
        message,
        link,
        data,
      }))
    );
  } else {
    // Notify all users
    const users = await prisma.user.findMany({
      select: { id: true },
    });

    await createBulkNotifications(
      users.map(user => ({
        userId: user.id,
        type: 'SYSTEM_ANNOUNCEMENT',
        title,
        message,
        link,
        data,
      }))
    );
  }
}

// ============================================================================
// HELPERS
// ============================================================================

function formatCurrency(cents: number, currency = 'USD'): string {
  const amount = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}
