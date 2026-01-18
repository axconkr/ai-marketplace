'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';

interface RevenueBreakdown {
  productSales: number;
  verificationEarnings: number;
  totalRevenue: number;
}

interface RevenueBreakdownChartProps {
  data: RevenueBreakdown;
  loading?: boolean;
}

const COLORS = {
  productSales: '#3b82f6',
  verificationEarnings: '#8b5cf6',
};

export function RevenueBreakdownChart({
  data,
  loading,
}: RevenueBreakdownChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>수익 구성</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse text-gray-400">
              데이터를 불러오는 중...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.totalRevenue === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>수익 구성</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-gray-400">
            수익 데이터가 없습니다
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = [
    {
      name: '상품 판매',
      value: data.productSales,
      color: COLORS.productSales,
    },
  ];

  if (data.verificationEarnings > 0) {
    chartData.push({
      name: '검증 수익',
      value: data.verificationEarnings,
      color: COLORS.verificationEarnings,
    });
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const percentage = ((payload[0].value / data.totalRevenue) * 100).toFixed(1);
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-semibold mb-1">{payload[0].name}</p>
          <p className="text-sm">
            {formatCurrency(payload[0].value)} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>수익 구성</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={CustomLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: COLORS.productSales }}
                />
                <span className="font-medium">상품 판매</span>
              </div>
              <div className="text-right">
                <p className="font-bold">{formatCurrency(data.productSales)}</p>
                <p className="text-xs text-gray-600">
                  {((data.productSales / data.totalRevenue) * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            {data.verificationEarnings > 0 && (
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: COLORS.verificationEarnings }}
                  />
                  <span className="font-medium">검증 수익</span>
                </div>
                <div className="text-right">
                  <p className="font-bold">
                    {formatCurrency(data.verificationEarnings)}
                  </p>
                  <p className="text-xs text-gray-600">
                    {((data.verificationEarnings / data.totalRevenue) * 100).toFixed(
                      1
                    )}
                    %
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg border-t-2 border-gray-300">
              <span className="font-semibold">총 수익</span>
              <p className="font-bold text-lg">
                {formatCurrency(data.totalRevenue)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
