'use client';

import { Card, CardContent } from '@/components/ui/card';

interface PriceBreakdownProps {
  productPrice: number;
  platformFee?: number;
  currency: string;
  showFeeDetails?: boolean;
}

/**
 * Price breakdown component
 * Shows product price, platform fee, and total
 */
export function PriceBreakdown({
  productPrice,
  platformFee = 0,
  currency,
  showFeeDetails = false,
}: PriceBreakdownProps) {
  const total = productPrice + platformFee;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-3">
          <h3 className="font-semibold">Order Summary</h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Product Price</span>
              <span className="font-medium">
                {formatCurrency(productPrice, currency)}
              </span>
            </div>

            {showFeeDetails && platformFee > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Platform Fee</span>
                <span>{formatCurrency(platformFee, currency)}</span>
              </div>
            )}

            <div className="border-t pt-2">
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span>{formatCurrency(total, currency)}</span>
              </div>
            </div>
          </div>

          {currency === 'KRW' && (
            <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-800">
              <p>부가세(VAT) 포함 금액입니다.</p>
            </div>
          )}

          <div className="space-y-1 text-xs text-gray-500">
            <p>✓ Instant access after payment</p>
            <p>✓ 7-day refund policy</p>
            <p>✓ Secure payment processing</p>
          </div>
        </div>
      </CardContent>
    </Card>
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
