'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { StripeCheckoutForm } from '@/components/payment/StripeCheckoutForm';
import { TossCheckoutForm } from '@/components/payment/TossCheckoutForm';
import { PaymentMethodSelector } from '@/components/payment/PaymentMethodSelector';
import { PriceBreakdown } from '@/components/payment/PriceBreakdown';
import { CheckoutProgress, CheckoutStep } from '@/components/checkout/CheckoutProgress';
import { PaymentErrorHandler } from '@/components/checkout/PaymentErrorHandler';
import { useCreatePayment } from '@/hooks/use-payment';
import { ArrowLeft, ShoppingCart, Lock, Shield, CreditCard } from 'lucide-react';

const checkoutSchema = z.object({
  buyerName: z.string().min(2, '이름은 최소 2자 이상이어야 합니다'),
  buyerEmail: z.string().email('유효한 이메일 주소를 입력해주세요'),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: '이용약관에 동의해야 합니다',
  }),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  files?: Array<{
    id: string;
    url: string;
    original_name: string;
  }>;
}

export default function CheckoutPage({
  params,
}: {
  params: { productId: string };
}) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('review');
  const [paymentData, setPaymentData] = useState<any>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const createPaymentMutation = useCreatePayment();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      agreeToTerms: false,
    },
  });

  const agreeToTerms = watch('agreeToTerms');

  // Load product data
  useEffect(() => {
    async function loadProduct() {
      try {
        const response = await fetch(`/api/products/${params.productId}`);
        if (!response.ok) throw new Error('Product not found');
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error('Failed to load product:', error);
        router.push('/products');
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [params.productId, router]);

  const onSubmit = async (data: CheckoutFormData) => {
    if (!product) return;

    setPaymentError(null);

    try {
      const result = await createPaymentMutation.mutateAsync({
        productId: product.id,
        buyerName: data.buyerName,
        buyerEmail: data.buyerEmail,
        currency: product.currency,
      });

      setPaymentData(result);
      setCurrentStep('payment');
    } catch (error) {
      console.error('Payment creation failed:', error);
      setPaymentError(
        error instanceof Error ? error.message : '결제 생성에 실패했습니다'
      );
    }
  };

  const handlePaymentSuccess = (paymentIntent: any) => {
    if (!paymentData) return;
    setCurrentStep('confirmation');
    // Redirect to success page after brief delay
    setTimeout(() => {
      router.push(`/checkout/success/${paymentData.orderId}`);
    }, 1000);
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    setPaymentError(error);
    // Scroll to error message
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRetryPayment = () => {
    setPaymentError(null);
    setCurrentStep('review');
    setPaymentData(null);
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-16 w-full" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-96 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">상품을 찾을 수 없습니다</p>
            <Button onClick={() => router.push('/products')} className="mt-4">
              상품 둘러보기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 -ml-3"
          size="sm"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          뒤로
        </Button>
        <h1 className="flex items-center gap-2 text-2xl sm:text-3xl font-bold">
          <ShoppingCart className="h-6 w-6 sm:h-8 sm:w-8" />
          결제하기
        </h1>
      </div>

      {/* Progress Indicator */}
      <div className="mb-6 sm:mb-8">
        <CheckoutProgress currentStep={currentStep} />
      </div>

      {/* Error Display */}
      {paymentError && (
        <div className="mb-6">
          <PaymentErrorHandler
            error={paymentError}
            onRetry={handleRetryPayment}
          />
        </div>
      )}

      <div className="grid gap-6 lg:gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          {currentStep === 'review' ? (
            <Card>
              <CardHeader>
                <CardTitle>구매자 정보</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Product Summary */}
                  <div className="rounded-lg border bg-gray-50 p-3 sm:p-4">
                    <h3 className="mb-2 font-semibold text-sm sm:text-base">{product.name}</h3>
                    {product.description && (
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                  </div>

                  {/* Buyer Name */}
                  <div className="space-y-2">
                    <Label htmlFor="buyerName">이름 *</Label>
                    <Input
                      id="buyerName"
                      {...register('buyerName')}
                      placeholder="홍길동"
                      className={errors.buyerName ? 'border-red-500' : ''}
                    />
                    {errors.buyerName && (
                      <p className="text-sm text-red-500">
                        {errors.buyerName.message}
                      </p>
                    )}
                  </div>

                  {/* Buyer Email */}
                  <div className="space-y-2">
                    <Label htmlFor="buyerEmail">이메일 주소 *</Label>
                    <Input
                      id="buyerEmail"
                      type="email"
                      {...register('buyerEmail')}
                      placeholder="hong@example.com"
                      className={errors.buyerEmail ? 'border-red-500' : ''}
                    />
                    {errors.buyerEmail && (
                      <p className="text-sm text-red-500">
                        {errors.buyerEmail.message}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      영수증과 다운로드 링크가 이 이메일로 전송됩니다
                    </p>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="terms"
                        checked={agreeToTerms}
                        onCheckedChange={(checked) =>
                          setValue('agreeToTerms', checked === true)
                        }
                      />
                      <label
                        htmlFor="terms"
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        <a
                          href="/terms"
                          target="_blank"
                          className="text-blue-600 hover:underline"
                        >
                          이용약관
                        </a>{' '}
                        및{' '}
                        <a
                          href="/privacy"
                          target="_blank"
                          className="text-blue-600 hover:underline"
                        >
                          개인정보 처리방침
                        </a>에 동의합니다
                      </label>
                    </div>
                    {errors.agreeToTerms && (
                      <p className="text-sm text-red-500">
                        {errors.agreeToTerms.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={createPaymentMutation.isPending}
                  >
                    {createPaymentMutation.isPending ? (
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
                        주문 생성 중...
                      </span>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        결제 진행
                      </>
                    )}
                  </Button>

                  {/* Trust Indicators */}
                  <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      <span>보안 결제</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      <span>구매자 보호</span>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : currentStep === 'payment' ? (
            <Card>
              <CardHeader>
                <CardTitle>결제 정보</CardTitle>
              </CardHeader>
              <CardContent>
                <PaymentMethodSelector
                  currency={paymentData.currency}
                  selectedProvider={paymentData.provider}
                />

                <div className="mt-6">
                  {paymentData.provider === 'stripe' && paymentData.clientSecret ? (
                    <StripeCheckoutForm
                      clientSecret={paymentData.clientSecret}
                      orderId={paymentData.orderId}
                      amount={paymentData.amount}
                      currency={paymentData.currency}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                    />
                  ) : paymentData.provider === 'toss' ? (
                    <TossCheckoutForm
                      amount={paymentData.amount}
                      orderId={paymentData.orderId}
                      orderName={product.name}
                      currency={paymentData.currency}
                      onError={handlePaymentError}
                    />
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ) : (
            // Confirmation Step
            <Card>
              <CardContent className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="mb-2 text-2xl font-bold">결제 처리 중...</h2>
                <p className="text-gray-600">
                  잠시 후 결제 완료 페이지로 이동합니다.
                </p>
                <div className="mt-6">
                  <div className="mx-auto h-1 w-48 overflow-hidden rounded-full bg-gray-200">
                    <div className="h-full w-full animate-pulse bg-green-600"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Sticky on desktop */}
        <div className="lg:col-span-1 order-1 lg:order-2">
          <div className="lg:sticky lg:top-6">
            <PriceBreakdown
              productPrice={product.price}
              currency={product.currency}
              showFeeDetails={false}
            />

            {/* Security Information */}
            {currentStep === 'payment' && (
              <Card className="mt-4">
                <CardContent className="pt-6">
                  <h3 className="mb-3 text-sm font-semibold">안전한 결제</h3>
                  <div className="space-y-2 text-xs text-gray-600">
                    <div className="flex items-start gap-2">
                      <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                      <span>모든 결제 정보는 암호화되어 안전하게 처리됩니다</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Lock className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                      <span>PCI DSS 준수 결제 시스템 사용</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CreditCard className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                      <span>카드 정보는 저장되지 않습니다</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
