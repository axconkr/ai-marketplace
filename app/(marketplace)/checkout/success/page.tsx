'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  Download,
  Mail,
  FileText,
  ArrowRight,
  Home,
  Package,
} from 'lucide-react';

/**
 * Checkout Success Page
 * Order confirmation and download links
 */

// Mock order data - replace with actual order data
const mockOrderData = {
  id: 'mock-order-123',
  date: new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }),
  items: [
    {
      id: '1',
      title: 'AI Content Generator Pro',
      price: 49.99,
      currency: 'USD',
      verification_level: 3,
      downloadUrl: '#',
      documentationUrl: '#',
      licenseKey: 'XXXX-XXXX-XXXX-XXXX',
    },
  ],
  subtotal: 49.99,
  platformFee: 5.99,
  total: 55.98,
  email: 'customer@example.com',
};

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id') || mockOrderData.id;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-20 w-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold mb-2">결제 완료!</h1>
          <p className="text-lg text-muted-foreground">
            구매해 주셔서 감사합니다. 주문이 확인되었습니다.
          </p>
        </div>

        {/* Order Details */}
        <div className="space-y-6">
          {/* Order Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>주문 확인</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  완료
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b">
                <div>
                  <p className="text-sm text-muted-foreground">주문 번호</p>
                  <p className="font-mono font-semibold">{orderId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">주문 날짜</p>
                  <p className="font-semibold">{mockOrderData.date}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">확인 이메일 발송</p>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="font-semibold">{mockOrderData.email}</p>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  주문 상세 정보와 다운로드 링크는 이메일을 확인해 주세요
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Products & Downloads */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                구매하신 상품
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {mockOrderData.items.map((item) => (
                <div key={item.id} className="space-y-4 pb-6 border-b last:border-0 last:pb-0">
                  {/* Product Info */}
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{item.title}</h3>
                      {item.verification_level > 0 && (
                        <Badge variant="secondary" className="mt-2">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          레벨 {item.verification_level} 검증됨
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* License Key */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">라이선스 키</p>
                        <p className="font-mono text-sm font-semibold mt-1">
                          {item.licenseKey}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(item.licenseKey);
                        }}
                      >
                        복사
                      </Button>
                    </div>
                  </div>

                  {/* Download Links */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Button
                      variant="default"
                      className="w-full"
                      onClick={() => window.open(item.downloadUrl, '_blank')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      상품 다운로드
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open(item.documentationUrl, '_blank')}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      문서 보기
                    </Button>
                  </div>

                  {/* Important Notes */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                    <p className="font-medium text-blue-900 mb-1">중요 안내</p>
                    <ul className="list-disc list-inside text-blue-700 space-y-1">
                      <li>다운로드 링크는 30일간 유효합니다</li>
                      <li>주문 내역에서 언제든지 다운로드할 수 있습니다</li>
                      <li>라이선스 키를 안전한 곳에 보관하세요</li>
                      <li>설치 방법은 문서를 확인해 주세요</li>
                    </ul>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>주문 요약</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">소계</span>
                <span>${mockOrderData.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">플랫폼 수수료</span>
                <span>${mockOrderData.platformFee.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between font-bold text-lg">
                  <span>총 결제 금액</span>
                  <span>${mockOrderData.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-purple-900">다음 단계</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-bold text-purple-600">1</span>
                </div>
                <div>
                  <p className="font-medium text-purple-900">상품 다운로드</p>
                  <p className="text-sm text-purple-700">
                    위의 다운로드 버튼을 클릭하여 상품을 받으세요
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-bold text-purple-600">2</span>
                </div>
                <div>
                  <p className="font-medium text-purple-900">설치 가이드 확인</p>
                  <p className="text-sm text-purple-700">
                    설치 방법은 문서를 읽어주세요
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-bold text-purple-600">3</span>
                </div>
                <div>
                  <p className="font-medium text-purple-900">도움이 필요하신가요?</p>
                  <p className="text-sm text-purple-700">
                    주문 페이지에서 판매자에게 문의하거나 고객센터를 방문하세요
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => (window.location.href = '/profile/orders')}
            >
              <Package className="h-4 w-4 mr-2" />
              주문 내역 보기
            </Button>
            <Button
              variant="default"
              size="lg"
              className="w-full"
              onClick={() => (window.location.href = '/products')}
            >
              <Home className="h-4 w-4 mr-2" />
              쇼핑 계속하기
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* Support Info */}
          <div className="text-center text-sm text-muted-foreground mt-8 pb-4">
            <p>
              주문에 대해 문의사항이 있으신가요?{' '}
              <Link href="/support" className="text-primary hover:underline font-medium">
                고객센터 문의
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center h-20 w-20 bg-gray-100 rounded-full mb-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-600" />
            </div>
            <h1 className="text-2xl font-bold">주문 정보를 불러오는 중...</h1>
          </div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
