'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useOrder } from '@/hooks/use-orders';
import { useDownloadOrderFiles, useDownloadReceipt } from '@/hooks/use-orders';
import { OrderConfirmationEmail } from '@/components/email/OrderConfirmationEmail';
import {
  CheckCircle,
  Download,
  FileText,
  Package,
  Share2,
  Star,
  Twitter,
  Facebook,
  Linkedin,
  Mail,
} from 'lucide-react';

export default function CheckoutSuccessPage({
  params,
}: {
  params: { orderId: string };
}) {
  const router = useRouter();
  const [showConfetti, setShowConfetti] = useState(true);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const { data: order, isLoading } = useOrder(params.orderId);
  const downloadFilesMutation = useDownloadOrderFiles();
  const downloadReceiptMutation = useDownloadReceipt();

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleDownload = () => {
    downloadFilesMutation.mutate(params.orderId);
  };

  const handleDownloadReceipt = () => {
    downloadReceiptMutation.mutate(params.orderId);
  };

  const handleShare = (platform: string) => {
    if (!order) return;

    const shareUrl = `${window.location.origin}/products/${order.product_id}`;
    const shareText = `I just purchased ${order.product.name} from AI Marketplace!`;

    switch (platform) {
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
          '_blank'
        );
        break;
      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
          '_blank'
        );
        break;
      case 'linkedin':
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
          '_blank'
        );
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(shareUrl)}`;
        break;
    }

    setShowShareOptions(false);
  };

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

  if (!order) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">Order not found</p>
            <Button onClick={() => router.push('/products')} className="mt-4">
              Browse Products
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-16">
      {/* Success Animation */}
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
          <h1 className="mb-2 text-3xl font-bold">Payment Successful!</h1>
          <p className="text-green-100">
            Thank you for your purchase. Your order is ready.
          </p>
        </div>

        <CardContent className="p-8">
          {/* Order Summary */}
          <div className="mb-6 rounded-lg border bg-gray-50 p-6">
            <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID</span>
                <span className="font-mono">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Product</span>
                <span className="font-medium">{order.product.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid</span>
                <span className="font-bold">
                  {formatCurrency(order.amount, order.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method</span>
                <span>
                  {order.payment?.payment_method === 'card'
                    ? `${order.payment.card_brand} •••• ${order.payment.card_last4}`
                    : order.payment_provider}
                </span>
              </div>
              {order.paid_at && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Date</span>
                  <span>{new Date(order.paid_at).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Download Section */}
          <div className="mb-6 space-y-3">
            <h3 className="font-semibold">Your Product</h3>

            <Button
              onClick={handleDownload}
              className="w-full"
              size="lg"
              disabled={
                downloadFilesMutation.isPending || !order.access_granted
              }
            >
              <Download className="mr-2 h-4 w-4" />
              {downloadFilesMutation.isPending
                ? 'Preparing download...'
                : 'Download Files'}
            </Button>

            {!order.access_granted && (
              <p className="text-sm text-yellow-600">
                Access is being granted. Please wait a moment and refresh the
                page.
              </p>
            )}

            {order.download_url && order.download_expires && (
              <p className="text-xs text-gray-500">
                Download link expires on{' '}
                {new Date(order.download_expires).toLocaleString()}
              </p>
            )}
          </div>

          {/* Receipt */}
          <div className="mb-6">
            <Button
              onClick={handleDownloadReceipt}
              variant="outline"
              className="w-full"
              disabled={downloadReceiptMutation.isPending}
            >
              <FileText className="mr-2 h-4 w-4" />
              {downloadReceiptMutation.isPending
                ? 'Generating...'
                : 'Download Receipt'}
            </Button>
          </div>

          {/* Share & Review Section */}
          <div className="mb-6 space-y-4">
            <h3 className="font-semibold">Share Your Purchase</h3>

            {!showShareOptions ? (
              <Button
                onClick={() => setShowShareOptions(true)}
                variant="outline"
                className="w-full"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share with Friends
              </Button>
            ) : (
              <div className="rounded-lg border bg-gray-50 p-4">
                <p className="mb-3 text-sm text-gray-600">
                  Share your purchase on social media:
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <Button
                    onClick={() => handleShare('twitter')}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Twitter className="h-4 w-4" />
                    Twitter
                  </Button>
                  <Button
                    onClick={() => handleShare('facebook')}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Facebook className="h-4 w-4" />
                    Facebook
                  </Button>
                  <Button
                    onClick={() => handleShare('linkedin')}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </Button>
                  <Button
                    onClick={() => handleShare('email')}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </Button>
                </div>
              </div>
            )}

            {/* Review Prompt */}
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <Star className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="mb-1 font-semibold text-yellow-900">
                      Enjoying your purchase?
                    </h4>
                    <p className="mb-3 text-sm text-yellow-800">
                      Help others discover great products by leaving a review!
                    </p>
                    <Link
                      href={`/products/${order?.product_id}?review=true`}
                      className="block"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-white"
                      >
                        Write a Review
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Email Preview */}
          <div className="mb-6">
            <Button
              onClick={() => setShowEmailPreview(!showEmailPreview)}
              variant="ghost"
              className="w-full"
            >
              <FileText className="mr-2 h-4 w-4" />
              {showEmailPreview
                ? 'Hide Email Preview'
                : 'Preview Confirmation Email'}
            </Button>

            {showEmailPreview && order && (
              <div className="mt-4 rounded-lg border bg-gray-50 p-4">
                <OrderConfirmationEmail order={order} />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Link href="/orders" className="block">
              <Button variant="outline" className="w-full">
                <Package className="mr-2 h-4 w-4" />
                View All Orders
              </Button>
            </Link>

            <Link href="/products" className="block">
              <Button variant="ghost" className="w-full">
                Continue Shopping
              </Button>
            </Link>
          </div>

          {/* Support */}
          <div className="mt-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
            <p className="font-semibold">Need help?</p>
            <p className="mt-1">
              If you have any questions or issues with your download, please{' '}
              <a
                href="/support"
                className="font-semibold underline hover:text-blue-900"
              >
                contact our support team
              </a>
              .
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
