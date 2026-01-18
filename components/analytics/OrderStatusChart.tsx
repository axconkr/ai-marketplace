'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  Legend
} from 'recharts';

interface OrderStatusData {
  status: string;
  count: number;
  label: string;
}

interface OrderStatusChartProps {
  data: OrderStatusData[];
  height?: number;
}

const COLORS: Record<string, string> = {
  PENDING: '#f59e0b',
  PAID: '#3b82f6',
  COMPLETED: '#10b981',
  REFUNDED: '#ef4444',
  CANCELLED: '#6b7280',
  FAILED: '#dc2626',
};

function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-gray-900">{data.label}</p>
        <p className="text-sm text-gray-600 mt-1">
          주문 수: <span className="font-semibold">{data.count}</span>
        </p>
        <p className="text-sm text-gray-600">
          비율: <span className="font-semibold">{data.percentage}%</span>
        </p>
      </div>
    );
  }

  return null;
}

export function OrderStatusChart({ data, height = 300 }: OrderStatusChartProps) {
  // Calculate total and percentages
  const total = data.reduce((sum, item) => sum + item.count, 0);
  const chartData = data.map(item => ({
    ...item,
    percentage: total > 0 ? ((item.count / total) * 100).toFixed(1) : 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          fill="#8884d8"
          paddingAngle={2}
          dataKey="count"
          label={({ label, percentage }) => `${label} (${percentage}%)`}
          labelLine={{ stroke: '#6b7280', strokeWidth: 1 }}
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[entry.status] || '#6b7280'}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value, entry: any) => {
            const item = chartData.find(d => d.label === value);
            return `${value} (${item?.count || 0})`;
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
