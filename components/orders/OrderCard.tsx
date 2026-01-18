'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Order } from '@/lib/api/orders';
import { Download, FileText, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface OrderCardProps {
  order: Order;
  onDownload?: (orderId: string) => void;
  onViewDetails?: (orderId: string) => void;
  onRequestRefund?: (orderId: string) => void;
}

export function OrderCard({
  order,
  onDownload,
  onViewDetails,
  onRequestRefund,
}: OrderCardProps) {
  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    PAID: 'bg-green-100 text-green-800',
    COMPLETED: 'bg-blue-100 text-blue-800',
    REFUNDED: 'bg-gray-100 text-gray-800',
    CANCELLED: 'bg-red-100 text-red-800',
    FAILED: 'bg-red-100 text-red-800',
  };

  const statusLabels = {
    PENDING: '대기 중',
    PAID: '결제 완료',
    COMPLETED: '완료',
    REFUNDED: '환불됨',
    CANCELLED: '취소됨',
    FAILED: '실패',
  };

  const canDownload = order.status === 'PAID' || order.status === 'COMPLETED';
  const canRefund =
    (order.status === 'PAID' || order.status === 'COMPLETED') &&
    !order.refund_requested &&
    order.paid_at &&
    getDaysSincePaid(order.paid_at) <= 7;

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-0">
        <div className="flex flex-col gap-4 p-6 sm:flex-row">
          {/* Product Image/Icon */}
          <div className="flex-shrink-0">
            <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-gray-100">
              <FileText className="h-10 w-10 text-gray-400" />
            </div>
          </div>

          {/* Order Details */}
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold">{order.product.name}</h3>
                <p className="text-sm text-gray-500">
                  주문 #{order.id.slice(0, 8)}
                </p>
              </div>
              <Badge className={statusColors[order.status]}>
                {statusLabels[order.status]}
              </Badge>
            </div>

            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <span className="text-gray-500">금액:</span>{' '}
                <span className="font-semibold">
                  {formatCurrency(order.amount, order.currency)}
                </span>
              </div>
              <div>
                <span className="text-gray-500">날짜:</span>{' '}
                {order.paid_at
                  ? formatDistanceToNow(new Date(order.paid_at), {
                      addSuffix: true,
                    })
                  : formatDistanceToNow(new Date(order.createdAt), {
                      addSuffix: true,
                    })}
              </div>
              {order.payment?.payment_method && (
                <div className="sm:col-span-2">
                  <span className="text-gray-500">결제수단:</span>{' '}
                  {order.payment.payment_method === 'card'
                    ? `${order.payment.card_brand} •••• ${order.payment.card_last4}`
                    : order.payment_provider}
                </div>
              )}
            </div>

            {order.refund_requested && (
              <div className="rounded-lg bg-yellow-50 p-2 text-sm text-yellow-800">
                환불 요청됨
                {order.refund_reason && `: ${order.refund_reason}`}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 border-t bg-gray-50 p-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails?.(order.id)}
            className="flex-1"
          >
            상세보기
          </Button>

          {canDownload && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onDownload?.(order.id)}
              className="flex-1"
            >
              <Download className="mr-2 h-4 w-4" />
              다운로드
            </Button>
          )}

          {canRefund && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRequestRefund?.(order.id)}
              className="flex-1"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              환불
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
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
