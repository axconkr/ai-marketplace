'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils';
import { format, differenceInDays, endOfMonth } from 'date-fns';
import { ko } from 'date-fns/locale';
import { DollarSign, TrendingUp, Calendar, Award } from 'lucide-react';

interface CurrentSettlementEstimate {
  totalSales: number;
  platformFee: number;
  netAmount: number;
  orderCount: number;
  verificationEarnings: number;
  verificationCount: number;
  currency: string;
  periodStart: Date;
  periodEnd: Date;
}

interface SettlementSummaryProps {
  estimate: CurrentSettlementEstimate | null;
  loading?: boolean;
}

export function SettlementSummary({ estimate, loading }: SettlementSummaryProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!estimate) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          현재 기간 정산 정보를 불러올 수 없습니다.
        </CardContent>
      </Card>
    );
  }

  const daysUntilSettlement = differenceInDays(
    endOfMonth(new Date()),
    new Date()
  );
  const daysInMonth = differenceInDays(
    endOfMonth(new Date()),
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const progressPercentage = ((daysInMonth - daysUntilSettlement) / daysInMonth) * 100;

  return (
    <div className="space-y-4">
      {/* Main Summary Card */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardHeader>
          <CardTitle className="text-lg opacity-90">
            {format(new Date(), 'yyyy년 M월', { locale: ko })} 예상 정산금
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-4xl font-bold mb-1">
                {formatCurrency(estimate.netAmount)}
              </p>
              <p className="text-sm opacity-90">
                다음 정산일까지 {daysUntilSettlement}일 남음
              </p>
            </div>

            <Progress value={progressPercentage} className="h-2 bg-white/20" />

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-sm opacity-90">총 판매액</p>
                <p className="text-lg font-semibold">
                  {formatCurrency(estimate.totalSales)}
                </p>
              </div>
              <div>
                <p className="text-sm opacity-90">주문 건수</p>
                <p className="text-lg font-semibold">{estimate.orderCount}건</p>
              </div>
              <div>
                <p className="text-sm opacity-90">플랫폼 수수료</p>
                <p className="text-lg font-semibold">
                  -{formatCurrency(estimate.platformFee)}
                </p>
              </div>
              <div>
                <p className="text-sm opacity-90">검증 수익</p>
                <p className="text-lg font-semibold">
                  {formatCurrency(estimate.verificationEarnings)}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-white/20">
              <p className="text-xs opacity-75">
                정산 예정일: {format(endOfMonth(new Date()).setDate(endOfMonth(new Date()).getDate() + 5), 'M월 d일 (eee)', { locale: ko })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 판매액</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(estimate.totalSales)}
            </div>
            <p className="text-xs text-muted-foreground">
              {estimate.orderCount}건의 주문
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">순 정산금</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(estimate.netAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              수수료 차감 후
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">검증 수익</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(estimate.verificationEarnings)}
            </div>
            <p className="text-xs text-muted-foreground">
              {estimate.verificationCount}건의 검증
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">다음 정산일</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {daysUntilSettlement}일
            </div>
            <p className="text-xs text-muted-foreground">
              {format(endOfMonth(new Date()), 'M월 d일', { locale: ko })} 마감
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
