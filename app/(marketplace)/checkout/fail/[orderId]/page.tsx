'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useOrder } from '@/hooks/use-orders';
import { PaymentErrorHandler } from '@/components/checkout/PaymentErrorHandler';
import { XCircle, RefreshCw, Mail, ArrowLeft, AlertTriangle } from 'lucide-react';

export default function CheckoutFailPage({
  params,
}: {
  params: { orderId: string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: order } = useOrder(params.orderId);
  const [retryCount, setRetryCount] = useState(0);

  const errorCode = searchParams.get('code');
  const errorMessage = searchParams.get('message');

  const getErrorDetails = () => {
    if (errorMessage) {
      return {
        title: '결제 실패',
        message: decodeURIComponent(errorMessage),
      };
    }

    switch (errorCode) {
      case 'CARD_DECLINED':
        return {
          title: '카드 승인 거부',
          message:
            '카드 승인이 거부되었습니다. 다른 결제 수단을 이용해 주세요.',
        };
      case 'INSUFFICIENT_FUNDS':
        return {
          title: '잔액 부족',
          message:
            '카드 잔액이 부족합니다. 다른 카드를 사용해 주세요.',
        };
      case 'EXPIRED_CARD':
        return {
          title: '카드 만료',
          message: '카드가 만료되었습니다. 다른 카드를 사용해 주세요.',
        };
      case 'AUTHENTICATION_FAILED':
        return {
          title: '3D 보안 인증 실패',
          message:
            '카드 인증에 실패했습니다. 다시 시도하거나 다른 카드를 사용해 주세요.',
        };
      case 'NETWORK_ERROR':
        return {
          title: '네트워크 오류',
          message:
            '네트워크 오류가 발생했습니다. 연결 상태를 확인하고 다시 시도해 주세요.',
        };
      default:
        return {
          title: '결제 실패',
          message:
            '결제 중 예기치 않은 오류가 발생했습니다. 다시 시도해 주세요.',
        };
    }
  };

  const { title, message } = getErrorDetails();

  const handleRetry = () => {
    if (order) {
      setRetryCount((prev) => prev + 1);
      router.push(`/checkout/${order.product_id}`);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-16">
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-red-500 to-rose-600 p-8 text-center text-white">
          <XCircle className="mx-auto mb-4 h-16 w-16" />
          <h1 className="mb-2 text-3xl font-bold">{title}</h1>
          <p className="text-red-100">{message}</p>
        </div>

        <CardContent className="p-8">
          {/* Enhanced Error Handler */}
          {errorMessage && (
            <div className="mb-6">
              <PaymentErrorHandler
                error={decodeURIComponent(errorMessage)}
                onRetry={handleRetry}
              />
            </div>
          )}

          {/* Error Details */}
          {order && (
            <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                주문 상세
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">주문 번호</span>
                  <span className="font-mono">{order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">상품</span>
                  <span className="font-medium">
                    {order.product.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">금액</span>
                  <span className="font-bold">
                    {formatCurrency(order.amount, order.currency)}
                  </span>
                </div>
                {errorCode && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">오류 코드</span>
                    <span className="font-mono text-xs">
                      {errorCode}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600">상태</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                    <XCircle className="h-3 w-3" />
                    결제 실패
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Retry Counter Notice */}
          {retryCount > 0 && (
            <div className="mb-6 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
              <p className="font-medium">
                {retryCount}번 재시도 하셨습니다.
              </p>
              <p className="mt-1">
                문제가 계속되면 은행이나 카드사에 문의하시거나 다른 결제 수단을 이용해 주세요.
              </p>
            </div>
          )}

          {/* Common Issues */}
          <div className="mb-6">
            <h3 className="mb-3 font-semibold">일반적인 문제 및 해결 방법</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex gap-2">
                <span className="text-blue-600">•</span>
                <span>
                  카드 정보가 정확한지, 카드가 만료되지 않았는지 확인하세요
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600">•</span>
                <span>
                  충분한 잔액 또는 한도가 있는지 확인하세요
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600">•</span>
                <span>
                  다른 카드나 결제 수단을 사용해 보세요
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600">•</span>
                <span>
                  문제가 계속되면 은행에 문의하세요
                </span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Button onClick={handleRetry} className="w-full" size="lg">
              <RefreshCw className="mr-2 h-4 w-4" />
              다시 시도
            </Button>

            <Link href="/products" className="block">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                상품 목록으로
              </Button>
            </Link>

            <Link href="/support" className="block">
              <Button variant="ghost" className="w-full">
                <Mail className="mr-2 h-4 w-4" />
                고객센터 문의
              </Button>
            </Link>
          </div>

          {/* Alternative Payment Methods */}
          <div className="mt-6 rounded-lg bg-blue-50 p-4">
            <h4 className="mb-2 font-semibold text-blue-900">
              다른 결제 수단
            </h4>
            <p className="text-sm text-blue-800">
              신용카드, 체크카드 및 다양한 간편결제를 지원합니다.
              현재 결제 수단에 문제가 있다면 다른 방법을 이용해 주세요.
            </p>
          </div>

          {/* Support Notice */}
          <div className="mt-4 border-t pt-4 text-center text-sm text-gray-500">
            <p>
              도움이 필요하신가요? 고객센터는 연중무휴 운영됩니다.
              <br />
              <a
                href="mailto:support@aimarketplace.com"
                className="font-semibold text-blue-600 hover:underline"
              >
                support@aimarketplace.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
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
