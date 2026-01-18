'use client';

import { useState, FormEvent } from 'react';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Lock } from 'lucide-react';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface StripeCheckoutFormProps {
  clientSecret: string;
  orderId: string;
  amount: number;
  currency: string;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: string) => void;
}

/**
 * Wrapper component with Stripe Elements provider
 */
export function StripeCheckoutForm({
  clientSecret,
  orderId,
  amount,
  currency,
  onSuccess,
  onError,
}: StripeCheckoutFormProps) {
  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#000000',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm
        orderId={orderId}
        amount={amount}
        currency={currency}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  );
}

/**
 * Inner checkout form component
 */
function CheckoutForm({
  orderId,
  amount,
  currency,
  onSuccess,
  onError,
}: Omit<StripeCheckoutFormProps, 'clientSecret'>) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success/${orderId}`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message || 'An error occurred during payment');
        onError(error.message || 'Payment failed');
      } else if (paymentIntent) {
        if (paymentIntent.status === 'succeeded') {
          onSuccess(paymentIntent);
        } else if (paymentIntent.status === 'requires_action') {
          // 3D Secure or other authentication required
          setErrorMessage('Additional authentication required');
        } else {
          setErrorMessage('Payment processing...');
        }
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'An unexpected error occurred';
      setErrorMessage(message);
      onError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <PaymentElement
            options={{
              layout: 'tabs',
            }}
          />
        </CardContent>
      </Card>

      {errorMessage && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
          {errorMessage}
        </div>
      )}

      <div className="space-y-4">
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={!stripe || !elements || isProcessing}
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
              Processing...
            </span>
          ) : (
            `Pay ${formatCurrency(amount, currency)}`
          )}
        </Button>

        <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Lock className="h-3 w-3" />
            <span>Secure Payment</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            <span>PCI DSS Compliant</span>
          </div>
        </div>
      </div>
    </form>
  );
}

/**
 * Format currency amount
 */
function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}
