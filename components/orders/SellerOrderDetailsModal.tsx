'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Download,
  FileText,
  RefreshCw,
  CheckCircle2,
  User,
  CreditCard,
  Package,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { formatCurrency } from '@/lib/utils';
import { OrderData } from './OrderTable';

interface SellerOrderDetailsModalProps {
  order: OrderData | null;
  open: boolean;
  onClose: () => void;
  onDownloadInvoice?: (orderId: string) => void;
  onProcessRefund?: (orderId: string) => void;
  onMarkCompleted?: (orderId: string) => void;
}

const STATUS_CONFIG = {
  PENDING: { label: '대기 중', variant: 'outline' as const, color: 'bg-yellow-50 text-yellow-800' },
  PAID: { label: '결제 완료', variant: 'default' as const, color: 'bg-blue-50 text-blue-800' },
  COMPLETED: { label: '완료', variant: 'secondary' as const, color: 'bg-green-50 text-green-800' },
  REFUNDED: { label: '환불됨', variant: 'destructive' as const, color: 'bg-red-50 text-red-800' },
  CANCELLED: { label: '취소됨', variant: 'destructive' as const, color: 'bg-gray-50 text-gray-800' },
  FAILED: { label: '실패', variant: 'destructive' as const, color: 'bg-red-50 text-red-800' },
};

export function SellerOrderDetailsModal({
  order,
  open,
  onClose,
  onDownloadInvoice,
  onProcessRefund,
  onMarkCompleted,
}: SellerOrderDetailsModalProps) {
  if (!order) return null;

  const statusConfig = STATUS_CONFIG[order.status];
  const canMarkCompleted = order.status === 'PAID' && onMarkCompleted;
  const canProcessRefund =
    order.refund_requested &&
    order.status !== 'REFUNDED' &&
    onProcessRefund;

  // Calculate timeline steps
  const timelineSteps = [
    {
      label: '주문 생성',
      date: order.createdAt,
      completed: true,
      icon: Package,
    },
    {
      label: '결제 완료',
      date: order.paid_at,
      completed: !!order.paid_at,
      icon: CreditCard,
    },
    {
      label: '완료',
      date: order.status === 'COMPLETED' ? order.createdAt : undefined,
      completed: order.status === 'COMPLETED',
      icon: CheckCircle2,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">주문 상세 정보</DialogTitle>
            <Badge variant={statusConfig.variant} className="text-sm">
              {statusConfig.label}
            </Badge>
          </div>
          <DialogDescription>
            주문 번호: <span className="font-mono">#{order.id.slice(0, 8)}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Refund Warning */}
          {order.refund_requested && (
            <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
              <div className="flex items-start gap-3">
                <RefreshCw className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-yellow-900">
                    환불 요청됨
                  </h4>
                  <p className="mt-1 text-sm text-yellow-800">
                    고객이 이 주문에 대한 환불을 요청했습니다. 검토 후 처리해주세요.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Clock className="h-5 w-5" />
              주문 타임라인
            </h3>
            <div className="space-y-4">
              {timelineSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          step.completed
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      {index < timelineSteps.length - 1 && (
                        <div
                          className={`h-12 w-0.5 ${
                            step.completed ? 'bg-green-200' : 'bg-gray-200'
                          }`}
                        />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="font-medium text-gray-900">
                        {step.label}
                      </div>
                      {step.date && (
                        <div className="text-sm text-gray-600">
                          {format(new Date(step.date), 'PPP p', { locale: ko })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Customer Information */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <User className="h-5 w-5" />
              고객 정보
            </h3>
            <div className="rounded-lg border bg-gray-50 p-4">
              <div className="grid gap-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">이름</span>
                  <span className="font-medium text-gray-900">
                    {order.buyer.name || '익명 사용자'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">이메일</span>
                  <span className="font-medium text-gray-900">
                    {order.buyer.email}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">고객 ID</span>
                  <span className="font-mono text-xs text-gray-600">
                    {order.buyer.id.slice(0, 16)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Package className="h-5 w-5" />
              상품 정보
            </h3>
            <div className="rounded-lg border bg-gray-50 p-4">
              <h4 className="font-semibold text-gray-900">{order.product.name}</h4>
              <div className="mt-3 text-sm text-gray-600">
                상품 ID: <span className="font-mono">{order.product.id}</span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <CreditCard className="h-5 w-5" />
              결제 정보
            </h3>
            <div className="rounded-lg border p-4">
              <div className="space-y-3">
                {order.payment_provider && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">결제 제공자</span>
                    <span className="font-medium capitalize text-gray-900">
                      {order.payment_provider}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">상품 가격</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(
                      order.amount - order.platform_fee,
                      order.currency
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">플랫폼 수수료</span>
                  <span className="font-medium text-red-600">
                    -{formatCurrency(order.platform_fee, order.currency)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">총 결제 금액</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(order.amount, order.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-900">판매자 수익</span>
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(order.seller_amount, order.currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 border-t pt-4">
            {onDownloadInvoice && (
              <Button
                variant="outline"
                onClick={() => {
                  onDownloadInvoice(order.id);
                }}
                className="flex-1"
              >
                <Download className="mr-2 h-4 w-4" />
                송장 다운로드
              </Button>
            )}

            {canMarkCompleted && (
              <Button
                variant="default"
                onClick={() => {
                  onMarkCompleted(order.id);
                  onClose();
                }}
                className="flex-1"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                완료 처리
              </Button>
            )}

            {canProcessRefund && (
              <Button
                variant="destructive"
                onClick={() => {
                  onProcessRefund(order.id);
                  onClose();
                }}
                className="flex-1"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                환불 처리
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
