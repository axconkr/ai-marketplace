/**
 * Notification service
 */

import { prisma } from '@/lib/db';

export class NotificationService {
  /**
   * Send payment failed notification
   */
  static async sendPaymentFailedNotification(userId: string, amount: number) {
    await prisma.notification.create({
      data: {
        user_id: userId,
        type: 'PAYMENT_FAILED',
        title: '결제 실패',
        message: `₩${amount.toLocaleString()}원 결제에 실패했습니다. 결제 수단을 확인해 주세요.`,
        link: '/dashboard/subscription',
        data: {
          amount,
        },
      },
    });
  }
}
