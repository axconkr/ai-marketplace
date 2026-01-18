'use client';

import { Order } from '@/lib/api/orders';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, RefreshCw, X } from 'lucide-react';
import { format } from 'date-fns';

interface OrderDetailsModalProps {
  order: Order | null;
  open: boolean;
  onClose: () => void;
  onDownload?: (orderId: string) => void;
  onRequestRefund?: (orderId: string) => void;
}

export function OrderDetailsModal({
  order,
  open,
  onClose,
  onDownload,
  onRequestRefund,
}: OrderDetailsModalProps) {
  if (!order) return null;

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    PAID: 'bg-green-100 text-green-800',
    COMPLETED: 'bg-blue-100 text-blue-800',
    REFUNDED: 'bg-gray-100 text-gray-800',
    CANCELLED: 'bg-red-100 text-red-800',
    FAILED: 'bg-red-100 text-red-800',
  };

  const canDownload = order.status === 'PAID' || order.status === 'COMPLETED';
  const canRefund =
    (order.status === 'PAID' || order.status === 'COMPLETED') &&
    !order.refund_requested &&
    order.paid_at &&
    getDaysSincePaid(order.paid_at) <= 7;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Order Details</span>
            <Badge className={statusColors[order.status]}>
              {order.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Order #{order.id.slice(0, 8)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Information */}
          <div>
            <h3 className="mb-3 font-semibold">Product</h3>
            <div className="rounded-lg border bg-gray-50 p-4">
              <h4 className="font-medium">{order.product.name}</h4>
              {order.product.description && (
                <p className="mt-1 text-sm text-gray-600">
                  {order.product.description}
                </p>
              )}
              {order.product.files && order.product.files.length > 0 && (
                <div className="mt-3 space-y-1">
                  <p className="text-sm font-medium">Files:</p>
                  {order.product.files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <FileText className="h-4 w-4" />
                      <span>{file.original_name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Order Information */}
          <div>
            <h3 className="mb-3 font-semibold">Order Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID</span>
                <span className="font-mono">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order Date</span>
                <span>{format(new Date(order.createdAt), 'PPpp')}</span>
              </div>
              {order.paid_at && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Date</span>
                  <span>{format(new Date(order.paid_at), 'PPpp')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Product Price</span>
                <span>{formatCurrency(order.amount - order.platform_fee, order.currency)}</span>
              </div>
              {order.platform_fee > 0 && (
                <div className="flex justify-between text-gray-500">
                  <span>Platform Fee</span>
                  <span>{formatCurrency(order.platform_fee, order.currency)}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 font-bold">
                <span>Total Paid</span>
                <span>{formatCurrency(order.amount, order.currency)}</span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          {order.payment && (
            <div>
              <h3 className="mb-3 font-semibold">Payment Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Provider</span>
                  <span className="capitalize">{order.payment.provider}</span>
                </div>
                {order.payment.payment_method && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="capitalize">
                      {order.payment.payment_method}
                    </span>
                  </div>
                )}
                {order.payment.card_brand && order.payment.card_last4 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Card</span>
                    <span>
                      {order.payment.card_brand} •••• {order.payment.card_last4}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Refund Information */}
          {order.refund_requested && (
            <div className="rounded-lg bg-yellow-50 p-4">
              <h3 className="mb-2 font-semibold text-yellow-900">
                Refund Requested
              </h3>
              {order.refund_reason && (
                <p className="text-sm text-yellow-800">
                  Reason: {order.refund_reason}
                </p>
              )}
              {order.refunded_at && (
                <p className="mt-1 text-sm text-yellow-800">
                  Refunded on {format(new Date(order.refunded_at), 'PPpp')}
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 border-t pt-4">
            {canDownload && (
              <Button
                onClick={() => {
                  onDownload?.(order.id);
                  onClose();
                }}
                className="flex-1"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Files
              </Button>
            )}

            {canRefund && (
              <Button
                variant="outline"
                onClick={() => {
                  onRequestRefund?.(order.id);
                  onClose();
                }}
                className="flex-1"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Request Refund
              </Button>
            )}

            {!canDownload && !canRefund && (
              <Button variant="outline" onClick={onClose} className="flex-1">
                <X className="mr-2 h-4 w-4" />
                Close
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getDaysSincePaid(paidAt: string): number {
  const paid = new Date(paidAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - paid.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
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
