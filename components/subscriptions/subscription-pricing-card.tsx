'use client';

import { useState } from 'react';
import { Check, Zap, Crown, Building2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import type { PlanPricing } from '@/src/lib/subscriptions/types';
import { BillingInterval } from '@/src/lib/subscriptions/types';

/**
 * SubscriptionPricingCard Component
 * Displays a single subscription plan with features and CTA
 */

interface SubscriptionPricingCardProps {
  plan: PlanPricing;
  billingInterval: BillingInterval;
  currentTier?: string;
  onSubscribe?: (tier: string, interval: BillingInterval) => Promise<void>;
  isPopular?: boolean;
}

const TIER_ICONS = {
  FREE: null,
  BASIC: Zap,
  PRO: Crown,
  ENTERPRISE: Building2,
};

const TIER_COLORS = {
  FREE: 'bg-gray-100 text-gray-900',
  BASIC: 'bg-blue-100 text-blue-900',
  PRO: 'bg-purple-100 text-purple-900',
  ENTERPRISE: 'bg-orange-100 text-orange-900',
};

export function SubscriptionPricingCard({
  plan,
  billingInterval,
  currentTier,
  onSubscribe,
  isPopular = false,
}: SubscriptionPricingCardProps) {
  const { success, error } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const Icon = TIER_ICONS[plan.tier as keyof typeof TIER_ICONS];
  const isCurrentPlan = currentTier === plan.tier;
  const isFree = plan.tier === 'FREE';

  const price = billingInterval === BillingInterval.MONTHLY
    ? plan.monthlyPrice
    : plan.yearlyPrice;

  const monthlyEquivalent = billingInterval === BillingInterval.YEARLY
    ? Math.floor(plan.yearlyPrice / 12)
    : plan.monthlyPrice;

  const yearlyDiscount = plan.monthlyPrice > 0
    ? Math.round(((plan.monthlyPrice * 12 - plan.yearlyPrice) / (plan.monthlyPrice * 12)) * 100)
    : 0;

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubscribe = async () => {
    if (!onSubscribe || isFree || isCurrentPlan) return;

    try {
      setIsLoading(true);
      await onSubscribe(plan.tier, billingInterval);
      success('구독이 시작되었습니다!');
    } catch (err: any) {
      console.error('Subscription error:', err);
      error(err.message || '구독 처리 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      className={`relative flex flex-col h-full ${
        isPopular ? 'border-2 border-purple-500 shadow-lg' : ''
      } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
    >
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-purple-500 text-white px-4 py-1">인기</Badge>
        </div>
      )}

      {/* Current Plan Badge */}
      {isCurrentPlan && (
        <div className="absolute -top-4 right-4">
          <Badge className="bg-green-500 text-white">현재 플랜</Badge>
        </div>
      )}

      <CardHeader>
        {/* Icon & Name */}
        <div className="flex items-center gap-3 mb-2">
          {Icon && (
            <div className={`p-2 rounded-lg ${TIER_COLORS[plan.tier as keyof typeof TIER_COLORS]}`}>
              <Icon className="w-6 h-6" />
            </div>
          )}
          <CardTitle className="text-2xl">{plan.name}</CardTitle>
        </div>
        <CardDescription>{plan.description}</CardDescription>

        {/* Price */}
        <div className="mt-4">
          {isFree ? (
            <div className="text-4xl font-bold">무료</div>
          ) : (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{formatPrice(monthlyEquivalent)}</span>
                <span className="text-gray-500">/월</span>
              </div>
              {billingInterval === BillingInterval.YEARLY && yearlyDiscount > 0 && (
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    연간 결제 시 {yearlyDiscount}% 절약
                  </Badge>
                </div>
              )}
              <div className="mt-2 text-sm text-gray-600">
                {billingInterval === BillingInterval.MONTHLY
                  ? `월간 ${formatPrice(price)}`
                  : `연간 ${formatPrice(price)}`}
              </div>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        {/* Features */}
        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>

        {/* Additional Feature Details */}
        <div className="mt-6 pt-6 border-t space-y-2">
          <div className="text-xs text-gray-600">
            <div className="flex justify-between">
              <span>상품 등록</span>
              <span className="font-medium">
                {plan.featureDetails.maxProducts === 'unlimited'
                  ? '무제한'
                  : `최대 ${plan.featureDetails.maxProducts}개`}
              </span>
            </div>
          </div>
          {plan.featureDetails.verificationDiscount > 0 && (
            <div className="text-xs text-gray-600">
              <div className="flex justify-between">
                <span>검증 수수료 할인</span>
                <span className="font-medium text-green-600">
                  {plan.featureDetails.verificationDiscount}%
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          variant={isCurrentPlan ? 'outline' : isPopular ? 'default' : 'outline'}
          onClick={handleSubscribe}
          disabled={isLoading || isCurrentPlan || isFree}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              처리 중...
            </>
          ) : isCurrentPlan ? (
            '현재 사용 중'
          ) : isFree ? (
            '무료 플랜'
          ) : (
            '시작하기'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
