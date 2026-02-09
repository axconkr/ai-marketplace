'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

interface CurrentEarnings {
  currentMonth: {
    totalEarnings: number;
    verificationCount: number;
    averagePerVerification: number;
    periodStart: string;
    periodEnd: string;
  };
  pending: {
    totalAmount: number;
    count: number;
  };
}

interface EarningsBreakdown {
  level: number;
  count: number;
  earnings: number;
}

interface Settlement {
  id: string;
  periodStart: string;
  periodEnd: string;
  totalEarnings: number;
  verificationCount: number;
  status: string;
  payoutDate: string | null;
  currency: string;
}

export default function VerifierEarningsDashboard() {
  const [currentEarnings, setCurrentEarnings] = useState<CurrentEarnings | null>(null);
  const [breakdown, setBreakdown] = useState<EarningsBreakdown[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem('accessToken');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      try {
        const currentRes = await fetch('/api/verifier/earnings/current', {
          headers,
          credentials: 'include',
        });
        if (!currentRes.ok) {
          if (currentRes.status === 403) {
            setError('인증 전문가만 접근할 수 있습니다.');
            return;
          }
          throw new Error('Failed to fetch earnings');
        }
        const currentData = await currentRes.json();
        setCurrentEarnings(currentData);

        const breakdownRes = await fetch('/api/verifier/earnings/breakdown?period=current', {
          headers,
          credentials: 'include',
        });
        if (breakdownRes.ok) {
          const breakdownData = await breakdownRes.json();
          setBreakdown(breakdownData.breakdown || []);
        }

        const settlementsRes = await fetch('/api/verifier/settlements', {
          headers,
          credentials: 'include',
        });
        if (settlementsRes.ok) {
          const settlementsData = await settlementsRes.json();
          setSettlements(settlementsData.settlements || []);
        }
      } catch (err) {
        console.error('Failed to fetch earnings data:', err);
        setError('수익 데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-6">로딩 중...</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">검증 수익</h1>
        <p className="text-muted-foreground">
          검증 수익 및 정산 내역을 확인하세요
        </p>
      </div>

      {/* Current Month Summary */}
      {currentEarnings && (
        <Card>
          <CardHeader>
            <CardTitle>이번 달 수익</CardTitle>
            <p className="text-sm text-muted-foreground">
              {new Date(currentEarnings.currentMonth.periodStart).toLocaleDateString()} -{' '}
              {new Date(currentEarnings.currentMonth.periodEnd).toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                label="검증 건수"
                value={currentEarnings.currentMonth.verificationCount.toString()}
              />
              <StatCard
                label="총 수익"
                value={formatCurrency(currentEarnings.currentMonth.totalEarnings)}
                highlight
              />
              <StatCard
                label="건당 평균"
                value={formatCurrency(currentEarnings.currentMonth.averagePerVerification)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Payouts */}
      {currentEarnings && currentEarnings.pending.count > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>미정산 금액</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                label="미정산 건수"
                value={currentEarnings.pending.count.toString()}
              />
              <StatCard
                label="미정산 금액"
                value={formatCurrency(currentEarnings.pending.totalAmount)}
                highlight
              />
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              다음 월 정산에 포함될 예정입니다
            </p>
          </CardContent>
        </Card>
      )}

      {/* Verification Breakdown by Level */}
      {breakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>레벨별 수익 (이번 달)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>레벨</TableHead>
                  <TableHead className="text-right">검증 건수</TableHead>
                  <TableHead className="text-right">수익</TableHead>
                  <TableHead className="text-right">건당 평균</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {breakdown.map((item) => (
                  <TableRow key={item.level}>
                    <TableCell>
                      <Badge variant="outline">Level {item.level}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{item.count}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.earnings)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatCurrency(Math.round(item.earnings / item.count))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Settlement History */}
      <Card>
        <CardHeader>
          <CardTitle>정산 내역</CardTitle>
          <p className="text-sm text-muted-foreground">
            월 정산은 매월 1일에 처리됩니다
          </p>
        </CardHeader>
        <CardContent>
          {settlements.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>기간</TableHead>
                  <TableHead className="text-right">검증 건수</TableHead>
                  <TableHead className="text-right">수익</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>지급일</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settlements.map((settlement) => (
                  <TableRow key={settlement.id}>
                    <TableCell>
                      {new Date(settlement.periodStart).toLocaleDateString('ko-KR', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      {settlement.verificationCount}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(settlement.totalEarnings)}
                    </TableCell>
                    <TableCell>
                      <SettlementStatusBadge status={settlement.status} />
                    </TableCell>
                    <TableCell>
                      {settlement.payoutDate
                        ? new Date(settlement.payoutDate).toLocaleDateString()
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              정산 내역이 없습니다
            </p>
          )}
        </CardContent>
      </Card>

      {/* Payment Method Settings */}
      <Card>
        <CardHeader>
          <CardTitle>결제 수단</CardTitle>
          <p className="text-sm text-muted-foreground">
            검증 수익을 받을 방법을 설정하세요
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">계좌 이체</h3>
                <p className="text-sm text-muted-foreground">
                  은행 계좌로 직접 입금
                </p>
              </div>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                설정
              </button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Stripe Connect</h3>
                <p className="text-sm text-muted-foreground">
                  Stripe를 통한 빠른 지급
                </p>
              </div>
              <button className="px-4 py-2 border rounded-md hover:bg-accent">
                연결
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper Components

function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold ${highlight ? 'text-primary' : ''}`}>
        {value}
      </p>
    </div>
  );
}

function SettlementStatusBadge({ status }: { status: string }) {
  const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    PENDING: 'secondary',
    PROCESSING: 'default',
    PAID: 'outline',
    FAILED: 'destructive',
  };

  return (
    <Badge variant={variants[status] || 'secondary'}>
      {status}
    </Badge>
  );
}
