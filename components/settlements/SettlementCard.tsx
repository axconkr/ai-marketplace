'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Download, Eye, Calendar, DollarSign, Award } from 'lucide-react';
import { Settlement } from '@prisma/client';

interface SettlementWithItems extends Settlement {
  items: any[];
}

interface SettlementCardProps {
  settlement: SettlementWithItems;
  onViewDetails: (settlementId: string) => void;
  onDownloadStatement?: (settlementId: string) => void;
}

const statusConfig = {
  PENDING: {
    label: '대기 중',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  PROCESSING: {
    label: '처리 중',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  PAID: {
    label: '지급 완료',
    color: 'bg-green-100 text-green-800 border-green-200',
  },
  FAILED: {
    label: '실패',
    color: 'bg-red-100 text-red-800 border-red-200',
  },
  CANCELLED: {
    label: '취소됨',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
  },
};

export function SettlementCard({
  settlement,
  onViewDetails,
  onDownloadStatement,
}: SettlementCardProps) {
  const status = statusConfig[settlement.status] || statusConfig.PENDING;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">
              {format(new Date(settlement.period_start), 'yyyy년 M월', {
                locale: ko,
              })}
            </h3>
            <p className="text-sm text-gray-500">
              {format(new Date(settlement.period_start), 'M/d', { locale: ko })} -{' '}
              {format(new Date(settlement.period_end), 'M/d', { locale: ko })}
            </p>
          </div>
          <Badge
            variant="outline"
            className={`${status.color} border`}
          >
            {status.label}
          </Badge>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              총 판매액
            </span>
            <span className="font-medium">
              {formatCurrency(settlement.total_amount)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">플랫폼 수수료</span>
            <span className="text-gray-600">
              -{formatCurrency(settlement.platform_fee)}
            </span>
          </div>

          {settlement.verification_earnings > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <Award className="h-4 w-4" />
                검증 수익
              </span>
              <span className="font-medium text-blue-600">
                +{formatCurrency(settlement.verification_earnings)}
              </span>
            </div>
          )}

          <div className="pt-2 border-t flex items-center justify-between">
            <span className="font-semibold">정산금</span>
            <span className="text-lg font-bold text-green-600">
              {formatCurrency(settlement.payout_amount)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {settlement.items.length}건의 주문
          </span>
          {settlement.payout_date && (
            <span>
              지급일: {format(new Date(settlement.payout_date), 'yyyy-MM-dd')}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onViewDetails(settlement.id)}
          >
            <Eye className="h-4 w-4 mr-1" />
            상세보기
          </Button>
          {settlement.status === 'PAID' && onDownloadStatement && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownloadStatement(settlement.id)}
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
