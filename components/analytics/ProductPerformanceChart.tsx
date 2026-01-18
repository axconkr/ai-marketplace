'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
  Legend
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface ProductPerformance {
  name: string;
  revenue: number;
  views: number;
  downloads: number;
}

interface ProductPerformanceChartProps {
  data: ProductPerformance[];
  height?: number;
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm text-gray-600">
            {entry.name === 'revenue' ? '수익' : entry.name === 'views' ? '조회수' : '다운로드'}:{' '}
            <span className="font-semibold" style={{ color: entry.color }}>
              {entry.name === 'revenue'
                ? formatCurrency(entry.value as number)
                : entry.value}
            </span>
          </p>
        ))}
      </div>
    );
  }

  return null;
}

export function ProductPerformanceChart({
  data,
  height = 300
}: ProductPerformanceChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="name"
          stroke="#6b7280"
          fontSize={12}
          angle={-15}
          textAnchor="end"
          height={60}
        />
        <YAxis stroke="#6b7280" fontSize={12} />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="top"
          height={36}
          formatter={(value) => {
            if (value === 'revenue') return '수익';
            if (value === 'views') return '조회수';
            if (value === 'downloads') return '다운로드';
            return value;
          }}
        />
        <Bar dataKey="views" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="downloads" fill="#10b981" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
