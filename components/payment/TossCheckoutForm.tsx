'use client';

import { useState } from 'react';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Lock } from 'lucide-react';

interface TossCheckoutFormProps {
  amount: number;
  orderId: string;
  orderName: string;
  currency: string;
  onError: (error: string) => void;
}

/**
 * TossPayments checkout form component
 */
export function TossCheckoutForm({
  amount,
  orderId,
  orderName,
  currency,
  onError,
}: TossCheckoutFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!;

  const handlePayment = async () => {
    if (!clientKey) {
      onError('TossPayments is not configured');
      return;
    }

    setIsProcessing(true);

    try {
      const tossPayments = await loadTossPayments(clientKey);

      await tossPayments.requestPayment('카드', {
        amount,
        orderId,
        orderName,
        successUrl: `${window.location.origin}/checkout/success/${orderId}`,
        failUrl: `${window.location.origin}/checkout/fail/${orderId}`,
        customerName: '',
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Payment failed';
      onError(message);
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="rounded-lg bg-blue-50 p-4">
              <h3 className="mb-2 font-semibold text-blue-900">
                토스페이먼츠로 안전하게 결제하세요
              </h3>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• 모든 카드사 지원</li>
                <li>• 간편결제 (토스페이, 카카오페이, 네이버페이)</li>
                <li>• 실시간 계좌이체</li>
                <li>• 안전한 결제 보안</li>
              </ul>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>주문명</span>
                <span className="font-medium">{orderName}</span>
              </div>
              <div className="flex justify-between">
                <span>주문번호</span>
                <span className="font-mono text-xs">{orderId}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span>결제금액</span>
                <span className="text-lg font-bold">
                  {formatCurrency(amount, currency)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Button
          onClick={handlePayment}
          className="w-full bg-blue-600 hover:bg-blue-700"
          size="lg"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <svg
                className="h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              결제 진행중...
            </span>
          ) : (
            `${formatCurrency(amount, currency)} 결제하기`
          )}
        </Button>

        <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Lock className="h-3 w-3" />
            <span>안전한 결제</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            <span>PG사 인증</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Format currency amount
 */
function formatCurrency(amount: number, currency: string): string {
  if (currency === 'KRW') {
    return `₩${amount.toLocaleString('ko-KR')}`;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}
