'use client';

import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Download, Package, FileText } from 'lucide-react';

interface Order {
  id: string;
  product: {
    name: string;
    description?: string;
  };
  amount: number;
  currency: string;
  paid_at?: string;
  payment?: {
    payment_method?: string;
    card_brand?: string;
    card_last4?: string;
  };
  payment_provider?: string;
  download_url?: string;
  download_expires?: string;
}

interface OrderConfirmationEmailProps {
  order: Order;
}

/**
 * OrderConfirmationEmail - Email template component for order confirmation
 * Can be used for preview and actual email generation
 */
export function OrderConfirmationEmail({
  order,
}: OrderConfirmationEmailProps) {
  return (
    <div className="mx-auto max-w-2xl rounded-lg border bg-white p-8 font-sans">
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Payment Successful!
        </h1>
        <p className="text-gray-600">
          Thank you for your purchase. Your order has been confirmed.
        </p>
      </div>

      {/* Order Summary */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Package className="h-5 w-5" />
            Order Summary
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Order Number</span>
              <span className="font-mono font-medium">{order.id}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Product</span>
              <span className="font-medium">{order.product.name}</span>
            </div>

            {order.product.description && (
              <div className="text-gray-600">
                <p className="text-xs">{order.product.description}</p>
              </div>
            )}

            <div className="flex justify-between border-t pt-3">
              <span className="text-gray-600">Amount Paid</span>
              <span className="text-lg font-bold">
                {formatCurrency(order.amount, order.currency)}
              </span>
            </div>

            {order.payment && (
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method</span>
                <span>
                  {order.payment.payment_method === 'card'
                    ? `${order.payment.card_brand} •••• ${order.payment.card_last4}`
                    : order.payment_provider}
                </span>
              </div>
            )}

            {order.paid_at && (
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Date</span>
                <span>{new Date(order.paid_at).toLocaleString()}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Download Instructions */}
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-blue-900">
            <Download className="h-5 w-5" />
            Download Your Product
          </h2>

          <div className="space-y-3 text-sm text-blue-800">
            <p>Your product is ready to download! Click the link below:</p>

            {order.download_url ? (
              <div className="rounded-lg bg-white p-3">
                <a
                  href={order.download_url}
                  className="break-all font-medium text-blue-600 hover:underline"
                >
                  {order.download_url}
                </a>
              </div>
            ) : (
              <div className="rounded-lg bg-white p-3">
                <p className="text-gray-600">
                  Your download link will be available shortly. Please check
                  your account or refresh this page.
                </p>
              </div>
            )}

            {order.download_expires && (
              <p className="text-xs">
                <strong>Note:</strong> Download link expires on{' '}
                {new Date(order.download_expires).toLocaleDateString()}
              </p>
            )}

            <div className="mt-4 space-y-2 rounded-lg bg-blue-100 p-3 text-xs">
              <p className="font-semibold">Download Instructions:</p>
              <ol className="ml-4 list-decimal space-y-1">
                <li>Click the download link above</li>
                <li>Save the file to your computer</li>
                <li>Extract the files if they're in a ZIP archive</li>
                <li>Follow the included README for setup instructions</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support Information */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <FileText className="h-5 w-5" />
            Need Help?
          </h2>

          <div className="space-y-3 text-sm text-gray-600">
            <p>
              If you have any questions or need assistance with your download,
              our support team is here to help.
            </p>

            <div className="rounded-lg bg-gray-50 p-3">
              <p className="font-medium text-gray-900">Contact Support:</p>
              <p className="mt-1">
                Email:{' '}
                <a
                  href="mailto:support@aimarketplace.com"
                  className="font-medium text-blue-600 hover:underline"
                >
                  support@aimarketplace.com
                </a>
              </p>
              <p className="mt-1 text-xs text-gray-500">
                We typically respond within 24 hours
              </p>
            </div>

            <div className="mt-4 border-t pt-4">
              <p className="text-xs text-gray-500">
                You're receiving this email because you made a purchase at AI
                Marketplace. This is a transactional email and you cannot
                unsubscribe.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="mt-6 border-t pt-6 text-center text-xs text-gray-500">
        <p>&copy; 2026 AI Marketplace. All rights reserved.</p>
        <div className="mt-2 space-x-4">
          <a href="/terms" className="hover:underline">
            Terms of Service
          </a>
          <a href="/privacy" className="hover:underline">
            Privacy Policy
          </a>
          <a href="/support" className="hover:underline">
            Support
          </a>
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
