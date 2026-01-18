'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface MonthlySettlement {
  month: string;
  totalAmount: number;
  platformFee: number;
  payoutAmount: number;
  verificationEarnings: number;
  orderCount: number;
}

interface SettlementChartProps {
  data: MonthlySettlement[];
  loading?: boolean;
}

export function SettlementChart({ data, loading }: SettlementChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>월별 정산 추이</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse text-gray-400">
              차트 데이터를 불러오는 중...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>월별 정산 추이</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-gray-400">
            표시할 데이터가 없습니다
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format data for chart
  const chartData = data.map((item) => ({
    ...item,
    month: format(new Date(item.month), 'yy년 M월', { locale: ko }),
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border">
          <p className="font-semibold mb-2">{payload[0].payload.month}</p>
          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-blue-600">총 판매액:</span>
              <span className="font-medium">
                {formatCurrency(payload[0].payload.totalAmount)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-600">플랫폼 수수료:</span>
              <span className="font-medium">
                {formatCurrency(payload[0].payload.platformFee)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-green-600">정산금:</span>
              <span className="font-medium">
                {formatCurrency(payload[0].payload.payoutAmount)}
              </span>
            </div>
            {payload[0].payload.verificationEarnings > 0 && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-purple-600">검증 수익:</span>
                <span className="font-medium">
                  {formatCurrency(payload[0].payload.verificationEarnings)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between gap-4 pt-1 border-t">
              <span className="text-gray-500">주문 건수:</span>
              <span className="font-medium">{payload[0].payload.orderCount}건</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>월별 정산 추이</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12 }}
              stroke="#888"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              stroke="#888"
              tickFormatter={(value) => `${(value / 10000).toFixed(0)}만원`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="totalAmount"
              name="총 판매액"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="payoutAmount"
              name="정산금"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981', r: 4 }}
              activeDot={{ r: 6 }}
            />
            {data.some((d) => d.verificationEarnings > 0) && (
              <Line
                type="monotone"
                dataKey="verificationEarnings"
                name="검증 수익"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface OrderCountChartProps {
  data: MonthlySettlement[];
  loading?: boolean;
}

export function OrderCountChart({ data, loading }: OrderCountChartProps) {
  if (loading || !data || data.length === 0) {
    return null;
  }

  const chartData = data.map((item) => ({
    month: format(new Date(item.month), 'yy년 M월', { locale: ko }),
    orderCount: item.orderCount,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>월별 주문 건수</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#888" />
            <YAxis tick={{ fontSize: 12 }} stroke="#888" />
            <Tooltip />
            <Bar dataKey="orderCount" name="주문 건수" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
