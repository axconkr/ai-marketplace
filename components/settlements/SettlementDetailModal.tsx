'use client';

import { Dialog } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  X,
  Download,
  Calendar,
  CreditCard,
  Package,
  Award,
  Building2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Settlement, SettlementItem, Product, User } from '@prisma/client';

interface SettlementWithDetails extends Settlement {
  items: (SettlementItem & {
    product: Product;
  })[];
  seller: User;
}

interface SettlementDetailModalProps {
  settlement: SettlementWithDetails | null;
  open: boolean;
  onClose: () => void;
  onDownloadStatement?: (settlementId: string) => void;
}

const statusConfig = {
  PENDING: {
    label: '대기 중',
    color: 'bg-yellow-100 text-yellow-800',
    icon: AlertCircle,
  },
  PROCESSING: {
    label: '처리 중',
    color: 'bg-blue-100 text-blue-800',
    icon: AlertCircle,
  },
  PAID: {
    label: '지급 완료',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle2,
  },
  FAILED: {
    label: '실패',
    color: 'bg-red-100 text-red-800',
    icon: AlertCircle,
  },
  CANCELLED: {
    label: '취소됨',
    color: 'bg-gray-100 text-gray-800',
    icon: X,
  },
};

export function SettlementDetailModal({
  settlement,
  open,
  onClose,
  onDownloadStatement,
}: SettlementDetailModalProps) {
  if (!settlement) return null;

  const status = statusConfig[settlement.status] || statusConfig.PENDING;
  const StatusIcon = status.icon;

  // Group items by product
  const productSummary = settlement.items.reduce(
    (acc, item) => {
      const productId = item.product_id;
      if (!acc[productId]) {
        acc[productId] = {
          product: item.product,
          orderCount: 0,
          totalRevenue: 0,
          totalFee: 0,
          netAmount: 0,
        };
      }
      acc[productId].orderCount += 1;
      acc[productId].totalRevenue += item.amount;
      acc[productId].totalFee += item.platform_fee;
      acc[productId].netAmount += item.payout_amount;
      return acc;
    },
    {} as Record<
      string,
      {
        product: Product;
        orderCount: number;
        totalRevenue: number;
        totalFee: number;
        netAmount: number;
      }
    >
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {format(new Date(settlement.period_start), 'yyyy년 M월 정산', {
                  locale: ko,
                })}
              </h2>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(settlement.period_start), 'yyyy-MM-dd')} ~{' '}
                  {format(new Date(settlement.period_end), 'yyyy-MM-dd')}
                </span>
                <Badge className={status.color}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {status.label}
                </Badge>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">총 판매액</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(settlement.total_amount)}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">플랫폼 수수료</p>
                <p className="text-2xl font-bold text-gray-600">
                  -{formatCurrency(settlement.platform_fee)}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">정산금</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(settlement.payout_amount)}
                </p>
              </div>
            </div>

            {/* Verification Earnings */}
            {settlement.verification_earnings > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-blue-900">
                      검증 수익
                    </span>
                  </div>
                  <span className="text-xl font-bold text-blue-600">
                    {formatCurrency(settlement.verification_earnings)}
                  </span>
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  {settlement.verification_count}건의 검증 완료
                </p>
              </div>
            )}

            <Separator className="my-6" />

            {/* Product Sales Breakdown */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Package className="h-5 w-5" />
                상품별 판매 내역
              </h3>
              <div className="space-y-3">
                {Object.values(productSummary).map((item) => (
                  <div
                    key={item.product.id}
                    className="bg-gray-50 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">{item.product.name}</h4>
                        <p className="text-sm text-gray-600">
                          {item.orderCount}건 판매
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatCurrency(item.netAmount)}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                      <div>
                        판매액: {formatCurrency(item.totalRevenue)}
                      </div>
                      <div>수수료: -{formatCurrency(item.totalFee)}</div>
                      <div>
                        순수익: {formatCurrency(item.netAmount)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="my-6" />

            {/* Bank Account Info */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                입금 계좌 정보
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                {settlement.seller.bank_account ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">은행</span>
                      <span className="font-medium">
                        {settlement.seller.bank_name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">계좌번호</span>
                      <span className="font-medium">
                        {settlement.seller.bank_account}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">예금주</span>
                      <span className="font-medium">
                        {settlement.seller.account_holder}
                      </span>
                    </div>
                    {settlement.seller.bank_verified && (
                      <div className="flex items-center gap-1 text-green-600 text-sm pt-2">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>계좌 인증 완료</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">
                    등록된 계좌 정보가 없습니다
                  </p>
                )}
              </div>
            </div>

            {/* Payout Info */}
            {settlement.payout_date && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  지급 정보
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">지급일</span>
                    <span className="font-medium">
                      {format(new Date(settlement.payout_date), 'yyyy년 M월 d일', {
                        locale: ko,
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">지급 방법</span>
                    <span className="font-medium">
                      {settlement.payout_method === 'stripe'
                        ? 'Stripe Connect'
                        : '계좌이체'}
                    </span>
                  </div>
                  {settlement.payout_reference && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">거래 참조번호</span>
                      <span className="font-mono text-sm">
                        {settlement.payout_reference}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
            {settlement.status === 'PAID' && onDownloadStatement && (
              <Button
                variant="outline"
                onClick={() => onDownloadStatement(settlement.id)}
              >
                <Download className="h-4 w-4 mr-2" />
                정산 명세서 다운로드
              </Button>
            )}
            <Button onClick={onClose}>닫기</Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
