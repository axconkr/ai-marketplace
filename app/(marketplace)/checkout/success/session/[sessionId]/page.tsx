'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useOrdersByCheckoutSession, useDownloadOrderFiles } from '@/hooks/use-orders';
import { useCart } from '@/contexts/cart-context';
import {
  CheckCircle,
  Download,
  Package,
  Share2,
  Star,
  ShoppingBag,
} from 'lucide-react';

export default function CheckoutSessionSuccessPage({
  params,
}: {
  params: { sessionId: string };
}) {
  const router = useRouter();
  const [showConfetti, setShowConfetti] = useState(true);
  const { clearCart } = useCart();
  const { data: orders, isLoading, isError } = useOrdersByCheckoutSession(params.sessionId);
  const downloadFilesMutation = useDownloadOrderFiles();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleDownload = (orderId: string) => {
    downloadFilesMutation.mutate(orderId);
  };

  const totalAmount = orders?.reduce((sum, order) => sum + order.amount, 0) ?? 0;
  const currency = orders?.[0]?.currency ?? 'USD';

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16">
        <div className="animate-pulse space-y-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-gray-200"></div>
          <div className="h-8 rounded bg-gray-200"></div>
          <div className="h-64 rounded-lg bg-gray-200"></div>
        </div>
      </div>
    );
  }

  if (isError || !orders || orders.length === 0) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">주문을 찾을 수 없습니다</p>
            <Button onClick={() => router.push('/products')} className="mt-4">
              상품 둘러보기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-16">
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="animate-bounce">
            <CheckCircle className="h-32 w-32 text-green-500" />
          </div>
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center text-white">
          <CheckCircle className="mx-auto mb-4 h-16 w-16" />
          <h1 className="mb-2 text-3xl font-bold">결제가 완료되었습니다!</h1>
          <p className="text-green-100">
            {orders.length}개의 상품을 구매해 주셔서 감사합니다.
          </p>
        </div>

        <CardContent className="p-8">
          <div className="mb-6 rounded-lg border bg-gray-50 p-6">
            <h2 className="mb-4 text-lg font-semibold">주문 내역</h2>
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center">
                      <ShoppingBag className="h-6 w-6 text-primary/40" />
                    </div>
                    <div>
                      <p className="font-medium">{order.product.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(order.amount, order.currency)}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload(order.id)}
                    disabled={downloadFilesMutation.isPending || !order.access_granted}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    다운로드
                  </Button>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t flex justify-between items-center">
              <span className="text-lg font-semibold">총 결제금액</span>
              <span className="text-2xl font-bold">
                {formatCurrency(totalAmount, currency)}
              </span>
            </div>
          </div>

          <div className="mb-6 space-y-4">
            <h3 className="font-semibold">리뷰 작성하기</h3>
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <Star className="h-6 w-6 text-yellow-600 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="mb-1 font-semibold text-yellow-900">
                      구매한 상품은 어떠셨나요?
                    </h4>
                    <p className="mb-3 text-sm text-yellow-800">
                      리뷰를 남겨 다른 사용자에게 도움을 주세요!
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {orders.map((order) => (
                        <Link
                          key={order.id}
                          href={`/products/${order.product_id}?review=true`}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-white"
                          >
                            {order.product.name} 리뷰
                          </Button>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-2">
            <Link href="/orders" className="block">
              <Button variant="outline" className="w-full">
                <Package className="mr-2 h-4 w-4" />
                주문 내역 보기
              </Button>
            </Link>

            <Link href="/products" className="block">
              <Button variant="ghost" className="w-full">
                쇼핑 계속하기
              </Button>
            </Link>
          </div>

          <div className="mt-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
            <p className="font-semibold">도움이 필요하신가요?</p>
            <p className="mt-1">
              다운로드에 문제가 있거나 궁금한 점이 있으시면{' '}
              <a
                href="/support"
                className="font-semibold underline hover:text-blue-900"
              >
                고객센터
              </a>
              로 문의해 주세요.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function formatCurrency(amount: number, currency: string): string {
  if (currency === 'KRW') {
    return `₩${amount.toLocaleString('ko-KR')}`;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}
