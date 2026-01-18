/**
 * Subscription notification service
 */

import { prisma } from '@/lib/db';

export class SubscriptionNotificationService {
  /**
   * Notify user of subscription creation
   */
  static async notifySubscriptionCreated(userId: string, tier: string, interval: string) {
    await prisma.notification.create({
      data: {
        user_id: userId,
        type: 'SUBSCRIPTION_CREATED',
        title: '구독이 시작되었습니다',
        message: `${tier} 플랜 (${interval === 'MONTHLY' ? '월간' : '연간'}) 구독이 성공적으로 시작되었습니다.`,
        link: '/dashboard/subscription',
        data: {
          tier,
          interval,
        },
      },
    });
  }

  /**
   * Notify user of subscription update
   */
  static async notifySubscriptionUpdated(
    userId: string,
    oldTier: string,
    newTier: string,
    interval: string
  ) {
    const isUpgrade = this.compareTiers(newTier, oldTier) > 0;
    const action = isUpgrade ? '업그레이드' : '다운그레이드';

    await prisma.notification.create({
      data: {
        user_id: userId,
        type: 'SUBSCRIPTION_UPDATED',
        title: `구독이 ${action}되었습니다`,
        message: `${oldTier}에서 ${newTier} 플랜으로 ${action}되었습니다.`,
        link: '/dashboard/subscription',
        data: {
          oldTier,
          newTier,
          interval,
          action,
        },
      },
    });
  }

  /**
   * Notify user of subscription cancellation
   */
  static async notifySubscriptionCancelled(
    userId: string,
    tier: string,
    endDate: Date,
    immediately: boolean
  ) {
    const message = immediately
      ? `${tier} 플랜 구독이 즉시 취소되었습니다.`
      : `${tier} 플랜 구독이 ${this.formatDate(endDate)}에 종료됩니다. 그 전까지는 모든 기능을 계속 사용하실 수 있습니다.`;

    await prisma.notification.create({
      data: {
        user_id: userId,
        type: 'SUBSCRIPTION_CANCELLED',
        title: '구독이 취소되었습니다',
        message,
        link: '/dashboard/subscription',
        data: {
          tier,
          endDate: endDate.toISOString(),
          immediately,
        },
      },
    });
  }

  /**
   * Notify user of payment failure
   */
  static async notifyPaymentFailed(userId: string, amount: number) {
    await prisma.notification.create({
      data: {
        user_id: userId,
        type: 'SUBSCRIPTION_PAYMENT_FAILED',
        title: '결제 실패',
        message: `₩${amount.toLocaleString()}원 결제에 실패했습니다. 결제 수단을 업데이트해 주세요.`,
        link: '/dashboard/subscription',
        data: {
          amount,
        },
      },
    });
  }

  /**
   * Notify user of upcoming renewal
   */
  static async notifyUpcomingRenewal(
    userId: string,
    tier: string,
    amount: number,
    renewalDate: Date
  ) {
    await prisma.notification.create({
      data: {
        user_id: userId,
        type: 'PAYMENT_RECEIVED',
        title: '구독 갱신 예정',
        message: `${tier} 플랜이 ${this.formatDate(renewalDate)}에 ₩${amount.toLocaleString()}원으로 자동 갱신됩니다.`,
        link: '/dashboard/subscription',
        data: {
          tier,
          amount,
          renewalDate: renewalDate.toISOString(),
        },
      },
    });
  }

  /**
   * Notify user of successful payment
   */
  static async notifyPaymentSucceeded(
    userId: string,
    tier: string,
    amount: number,
    receiptUrl?: string
  ) {
    await prisma.notification.create({
      data: {
        user_id: userId,
        type: 'PAYMENT_RECEIVED',
        title: '결제 완료',
        message: `${tier} 플랜 ₩${amount.toLocaleString()}원 결제가 완료되었습니다.`,
        link: receiptUrl || '/dashboard/subscription',
        data: {
          tier,
          amount,
          receiptUrl,
        },
      },
    });
  }

  /**
   * Compare tier levels
   */
  private static compareTiers(tier1: string, tier2: string): number {
    const tierOrder: Record<string, number> = {
      FREE: 0,
      BASIC: 1,
      PRO: 2,
      ENTERPRISE: 3,
    };

    return tierOrder[tier1] - tierOrder[tier2];
  }

  /**
   * Format date to Korean locale
   */
  private static formatDate(date: Date): string {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  }
}
