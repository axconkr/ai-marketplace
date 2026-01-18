'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SubscriptionPricingCard } from './subscription-pricing-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { Loader2 } from 'lucide-react';
import { BillingInterval, PLAN_PRICING, type PlanPricing } from '@/src/lib/subscriptions/types';

/**
 * SubscriptionPlans Component
 * Main pricing page component with billing toggle
 */

interface SubscriptionPlansProps {
  currentTier?: string;
  showCurrentPlan?: boolean;
}

export function SubscriptionPlans({
  currentTier = 'FREE',
  showCurrentPlan = true,
}: SubscriptionPlansProps) {
  const router = useRouter();
  const { success, error } = useToast();
  const [billingInterval, setBillingInterval] = useState<BillingInterval>(
    BillingInterval.MONTHLY
  );
  const [plans, setPlans] = useState<PlanPricing[]>(PLAN_PRICING);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch plans from API (optional - can use static PLAN_PRICING)
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/subscriptions/plans');
        const result = await response.json();

        if (response.ok && result.success && result.data) {
          setPlans(result.data);
        }
      } catch (err) {
        console.error('Error fetching plans:', err);
        // Fallback to static pricing
        setPlans(PLAN_PRICING);
      }
    };

    fetchPlans();
  }, []);

  const handleSubscribe = async (tier: string, interval: BillingInterval) => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/subscriptions/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier,
          interval,
          successUrl: `${window.location.origin}/dashboard/subscription?success=true`,
          cancelUrl: `${window.location.origin}/pricing`,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (result.data.url) {
        window.location.href = result.data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err: any) {
      console.error('Subscription error:', err);
      error(err.message || '구독 처리 중 오류가 발생했습니다');
      setIsLoading(false);
    }
  };

  const yearlyDiscount = plans[1]?.monthlyPrice
    ? Math.round(
        ((plans[1].monthlyPrice * 12 - plans[1].yearlyPrice) /
          (plans[1].monthlyPrice * 12)) *
          100
      )
    : 17;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">요금제 선택</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          비즈니스에 맞는 완벽한 플랜을 선택하세요
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center">
        <Card className="inline-flex p-1">
          <CardContent className="p-0 flex gap-1">
            <Button
              variant={
                billingInterval === BillingInterval.MONTHLY ? 'default' : 'ghost'
              }
              onClick={() => setBillingInterval(BillingInterval.MONTHLY)}
              className="px-6"
            >
              월간 결제
            </Button>
            <Button
              variant={
                billingInterval === BillingInterval.YEARLY ? 'default' : 'ghost'
              }
              onClick={() => setBillingInterval(BillingInterval.YEARLY)}
              className="px-6"
            >
              연간 결제
              {yearlyDiscount > 0 && (
                <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                  {yearlyDiscount}% 절약
                </span>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin" />
              <p className="text-lg">결제 페이지로 이동 중...</p>
            </div>
          </Card>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {plans
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((plan) => (
            <SubscriptionPricingCard
              key={plan.tier}
              plan={plan}
              billingInterval={billingInterval}
              currentTier={showCurrentPlan ? currentTier : undefined}
              onSubscribe={handleSubscribe}
              isPopular={plan.tier === 'PRO'}
            />
          ))}
      </div>

      {/* FAQ or Features Comparison */}
      <div className="max-w-4xl mx-auto mt-16">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-2xl font-bold mb-6 text-center">
              모든 플랜 공통 기능
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                <div>
                  <h4 className="font-semibold">안전한 결제</h4>
                  <p className="text-sm text-gray-600">
                    Stripe를 통한 안전한 결제 처리
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                <div>
                  <h4 className="font-semibold">에스크로 보호</h4>
                  <p className="text-sm text-gray-600">
                    모든 거래는 에스크로로 보호됩니다
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                <div>
                  <h4 className="font-semibold">언제든 취소</h4>
                  <p className="text-sm text-gray-600">
                    약정 없이 언제든 취소 가능
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                <div>
                  <h4 className="font-semibold">24/7 모니터링</h4>
                  <p className="text-sm text-gray-600">
                    플랫폼 안정성 보장
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CTA */}
      <div className="text-center space-y-4 pt-8">
        <p className="text-gray-600">
          아직 고민 중이신가요?{' '}
          <a href="/contact" className="text-primary hover:underline font-medium">
            문의하기
          </a>
        </p>
      </div>
    </div>
  );
}
