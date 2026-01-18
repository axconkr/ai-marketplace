'use client';

import { useState, useEffect } from 'react';
import {
  CreditCard,
  Calendar,
  TrendingUp,
  AlertCircle,
  Settings,
  Download,
  Loader2,
  ExternalLink,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { SubscriptionStatusBadge } from './subscription-status-badge';
import type { SubscriptionDetails, BillingHistoryItem } from '@/src/lib/subscriptions/types';

/**
 * SubscriptionManager Component
 * User's subscription management dashboard
 */

interface SubscriptionManagerProps {
  userId: string;
}

const TIER_NAMES = {
  FREE: '무료',
  BASIC: '베이직',
  PRO: '프로',
  ENTERPRISE: '엔터프라이즈',
};

const INTERVAL_LABELS = {
  MONTHLY: '월간',
  YEARLY: '연간',
};

export function SubscriptionManager({ userId }: SubscriptionManagerProps) {
  const { success, error } = useToast();
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null);
  const [billingHistory, setBillingHistory] = useState<BillingHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchSubscription();
    fetchBillingHistory();
  }, [userId]);

  const fetchSubscription = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/subscriptions');
      const result = await response.json();

      if (response.ok && result.success) {
        setSubscription(result.data);
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBillingHistory = async () => {
    try {
      // This would fetch from Stripe via API
      // For now, using mock data
      setBillingHistory([]);
    } catch (err) {
      console.error('Error fetching billing history:', err);
    }
  };

  const handleManageBilling = async () => {
    try {
      setIsUpdating(true);

      const response = await fetch('/api/subscriptions/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl: window.location.href,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create portal session');
      }

      // Redirect to Stripe Customer Portal
      if (result.data.url) {
        window.location.href = result.data.url;
      }
    } catch (err: any) {
      console.error('Portal error:', err);
      error(err.message || '고객 포털 열기에 실패했습니다');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (
      !confirm(
        '구독을 취소하시겠습니까? 현재 결제 기간이 끝날 때까지 서비스를 이용할 수 있습니다.'
      )
    ) {
      return;
    }

    try {
      setIsUpdating(true);

      const response = await fetch(`/api/subscriptions/${subscription?.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          immediately: false,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to cancel subscription');
      }

      success('구독이 취소되었습니다. 현재 기간 종료 시까지 이용 가능합니다.');
      fetchSubscription();
    } catch (err: any) {
      console.error('Cancel error:', err);
      error(err.message || '구독 취소에 실패했습니다');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpgrade = () => {
    window.location.href = '/pricing';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const isFree = !subscription || subscription.tier === 'FREE';
  const isActive = subscription?.status === 'ACTIVE';
  const isCancelled = subscription?.cancelAtPeriodEnd;

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                현재 구독
              </CardTitle>
              <CardDescription>구독 플랜 및 상태 정보</CardDescription>
            </div>
            {subscription && (
              <SubscriptionStatusBadge status={subscription.status} />
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Plan Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">플랜</p>
              <p className="text-2xl font-bold">
                {subscription
                  ? TIER_NAMES[subscription.tier as keyof typeof TIER_NAMES] ||
                    subscription.tier
                  : '무료'}
              </p>
            </div>

            {subscription && subscription.tier !== 'FREE' && (
              <>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">결제 주기</p>
                  <p className="text-lg font-medium">
                    {INTERVAL_LABELS[
                      subscription.interval as keyof typeof INTERVAL_LABELS
                    ] || subscription.interval}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-gray-500">다음 결제일</p>
                  <p className="text-lg font-medium">
                    {formatDate(subscription.currentPeriodEnd)}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-gray-500">시작일</p>
                  <p className="text-lg font-medium">
                    {formatDate(subscription.currentPeriodStart)}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Cancellation Notice */}
          {isCancelled && (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-900">구독 취소 예정</p>
                    <p className="text-sm text-yellow-800 mt-1">
                      {subscription &&
                        `${formatDate(subscription.currentPeriodEnd)}까지 이용 가능합니다.`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-4 border-t">
            {isFree ? (
              <Button onClick={handleUpgrade} className="flex-1 sm:flex-none">
                <TrendingUp className="w-4 h-4 mr-2" />
                플랜 업그레이드
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleManageBilling}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      로딩 중...
                    </>
                  ) : (
                    <>
                      <Settings className="w-4 h-4 mr-2" />
                      결제 정보 관리
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </>
                  )}
                </Button>

                <Button variant="outline" onClick={handleUpgrade}>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  플랜 변경
                </Button>

                {!isCancelled && (
                  <Button
                    variant="outline"
                    onClick={handleCancelSubscription}
                    disabled={isUpdating}
                    className="text-red-600 hover:text-red-700"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    구독 취소
                  </Button>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Usage Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            사용 현황
          </CardTitle>
          <CardDescription>현재 플랜의 사용량</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">등록된 상품</p>
                <p className="text-2xl font-bold">-</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">한도</p>
                <p className="text-lg font-medium">
                  {isFree ? '3개' : '무제한'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">이번 달 검증</p>
                <p className="text-2xl font-bold">-</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">할인율</p>
                <p className="text-lg font-medium text-green-600">
                  {isFree ? '0%' : subscription?.tier === 'BASIC' ? '10%' : subscription?.tier === 'PRO' ? '20%' : '30%'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      {!isFree && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  결제 내역
                </CardTitle>
                <CardDescription>최근 결제 내역</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleManageBilling}>
                <ExternalLink className="w-4 h-4 mr-1" />
                전체 보기
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {billingHistory.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                아직 결제 내역이 없습니다
              </p>
            ) : (
              <div className="space-y-3">
                {billingHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {item.status === 'paid' ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : item.status === 'failed' ? (
                        <XCircle className="w-5 h-5 text-red-500" />
                      ) : (
                        <Loader2 className="w-5 h-5 text-yellow-500" />
                      )}
                      <div>
                        <p className="font-medium">{item.description}</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(item.date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-semibold">{formatCurrency(item.amount)}</p>
                      {item.invoiceUrl && (
                        <Button variant="ghost" size="sm" asChild>
                          <a
                            href={item.invoiceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
