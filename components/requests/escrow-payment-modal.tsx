'use client';

import { useState, useEffect } from 'react';
import { X, Shield, Lock, CreditCard, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

/**
 * EscrowPaymentModal Component
 * Modal for secure escrow payment processing
 */

interface EscrowPaymentModalProps {
  proposalId: string;
  amount: number;
  sellerName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function EscrowPaymentModal({
  proposalId,
  amount,
  sellerName,
  onClose,
  onSuccess,
}: EscrowPaymentModalProps) {
  const { error } = useToast();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoadingIntent, setIsLoadingIntent] = useState(true);

  // Create PaymentIntent on mount
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const response = await fetch('/api/proposals/payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ proposalId }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Failed to create payment intent');
        }

        setClientSecret(result.data.clientSecret);
      } catch (err: any) {
        console.error('Error creating payment intent:', err);
        error(err.message || '결제 준비 중 오류가 발생했습니다');
      } finally {
        setIsLoadingIntent(false);
      }
    };

    createPaymentIntent();
  }, [proposalId]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(value);
  };

  const options: StripeElementsOptions | undefined = clientSecret
    ? {
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#000000',
          },
        },
      }
    : undefined;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-2xl font-bold">에스크로 결제</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isLoadingIntent}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Escrow Info */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h3 className="font-semibold text-blue-900">
                    안전한 에스크로 결제
                  </h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• 결제 금액은 안전하게 보관됩니다</li>
                    <li>• 프로젝트 완료 후 판매자에게 전달됩니다</li>
                    <li>• 문제 발생 시 환불이 가능합니다</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Details */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">판매자</span>
              <span className="font-medium">{sellerName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">프로젝트 금액</span>
              <span className="font-medium">{formatCurrency(amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">수수료 (5%)</span>
              <span className="font-medium">
                {formatCurrency(Math.floor(amount * 0.05))}
              </span>
            </div>
            <div className="border-t pt-3 flex justify-between">
              <span className="font-semibold">총 결제 금액</span>
              <span className="font-bold text-lg">
                {formatCurrency(Math.floor(amount * 1.05))}
              </span>
            </div>
          </div>

          {/* Payment Form */}
          {isLoadingIntent ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-3">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-gray-600">결제 준비 중...</p>
              </div>
            </div>
          ) : clientSecret && options ? (
            <Elements stripe={stripePromise} options={options}>
              <PaymentForm
                amount={Math.floor(amount * 1.05)}
                onSuccess={onSuccess}
                onClose={onClose}
              />
            </Elements>
          ) : (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-red-900 mb-1">
                      결제 준비 실패
                    </h3>
                    <p className="text-sm text-red-800">
                      결제를 준비하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Notice */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Lock className="w-4 h-4" />
            <span>모든 결제 정보는 SSL로 암호화되어 안전하게 처리됩니다</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Inner Payment Form Component
 */
interface PaymentFormProps {
  amount: number;
  onSuccess: () => void;
  onClose: () => void;
}

function PaymentForm({ amount, onSuccess, onClose }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { success, error } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const { error: submitError, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
        confirmParams: {
          return_url: `${window.location.origin}/requests`,
        },
      });

      if (submitError) {
        setErrorMessage(submitError.message || '결제 처리 중 오류가 발생했습니다');
        error(submitError.message || '결제에 실패했습니다');
      } else if (paymentIntent) {
        if (paymentIntent.status === 'requires_capture') {
          // Escrow payment held successfully
          success('결제가 완료되었습니다! 금액은 에스크로에 안전하게 보관됩니다.');
          onSuccess();
        } else if (paymentIntent.status === 'succeeded') {
          success('결제가 완료되었습니다!');
          onSuccess();
        } else {
          setErrorMessage('결제 상태를 확인해주세요');
        }
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setErrorMessage(err.message || '결제 처리 중 오류가 발생했습니다');
      error(err.message || '결제에 실패했습니다');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <CreditCard className="w-5 h-5" />
          <span>결제 수단</span>
        </div>
        <PaymentElement />
      </div>

      {errorMessage && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{errorMessage}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isProcessing}
          className="flex-1"
        >
          취소
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1"
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              처리 중...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {new Intl.NumberFormat('ko-KR', {
                style: 'currency',
                currency: 'KRW',
              }).format(amount)}{' '}
              결제하기
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
