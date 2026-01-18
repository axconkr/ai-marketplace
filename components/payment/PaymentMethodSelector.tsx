'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Smartphone } from 'lucide-react';

interface PaymentMethodSelectorProps {
  currency: string;
  selectedProvider: 'stripe' | 'toss';
  onSelect?: (provider: 'stripe' | 'toss') => void;
}

/**
 * Payment method selector component
 * Auto-selects based on currency (KRW → Toss, others → Stripe)
 */
export function PaymentMethodSelector({
  currency,
  selectedProvider,
  onSelect,
}: PaymentMethodSelectorProps) {
  const isKRW = currency === 'KRW';
  const canChangeProvider = !isKRW; // Only allow change for non-KRW

  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 text-sm font-medium">결제 수단</h3>
        <p className="text-xs text-gray-500">
          {isKRW
            ? '원화(KRW) 결제는 토스페이먼츠를 사용합니다'
            : '해외 결제는 Stripe를 사용합니다'}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {/* Stripe Option */}
        <Card
          className={`cursor-pointer transition-all ${
            selectedProvider === 'stripe'
              ? 'border-blue-600 ring-2 ring-blue-600'
              : 'border-gray-200 hover:border-gray-300'
          } ${isKRW ? 'opacity-50' : ''}`}
          onClick={() => !isKRW && onSelect?.('stripe')}
        >
          <CardContent className="flex items-start gap-3 p-4">
            <div className="rounded-lg bg-blue-50 p-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">Stripe</h4>
                {selectedProvider === 'stripe' && (
                  <Badge variant="default" className="text-xs">
                    선택됨
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                신용/체크카드, Apple Pay, Google Pay
              </p>
              <div className="mt-2 flex gap-1">
                <img
                  src="/images/cards/visa.svg"
                  alt="Visa"
                  className="h-4"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <img
                  src="/images/cards/mastercard.svg"
                  alt="Mastercard"
                  className="h-4"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <img
                  src="/images/cards/amex.svg"
                  alt="Amex"
                  className="h-4"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* TossPayments Option */}
        <Card
          className={`cursor-pointer transition-all ${
            selectedProvider === 'toss'
              ? 'border-blue-600 ring-2 ring-blue-600'
              : 'border-gray-200 hover:border-gray-300'
          } ${!isKRW ? 'opacity-50' : ''}`}
          onClick={() => isKRW && onSelect?.('toss')}
        >
          <CardContent className="flex items-start gap-3 p-4">
            <div className="rounded-lg bg-blue-50 p-2">
              <Smartphone className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">토스페이먼츠</h4>
                {selectedProvider === 'toss' && (
                  <Badge variant="default" className="text-xs">
                    선택됨
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                카드, 계좌이체, 간편결제
              </p>
              <div className="mt-2 text-xs text-gray-400">
                토스페이 · 카카오페이 · 네이버페이
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Badges */}
      <div className="flex items-center justify-center gap-4 rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <svg
            className="h-4 w-4 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <span>SSL 암호화</span>
        </div>
        <div className="flex items-center gap-1">
          <svg
            className="h-4 w-4 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <span>PCI DSS 준수</span>
        </div>
      </div>
    </div>
  );
}
