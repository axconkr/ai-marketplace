'use client';

import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import {
  ShoppingCart,
  DollarSign,
  Clock,
  TrendingDown
} from 'lucide-react';

interface OrderStatsProps {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  refundRate: number;
  currency?: string;
}

export function OrderStats({
  totalOrders,
  totalRevenue,
  pendingOrders,
  refundRate,
  currency = 'KRW',
}: OrderStatsProps) {
  const stats = [
    {
      title: '전체 주문',
      value: totalOrders.toLocaleString(),
      icon: ShoppingCart,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: '총 수익',
      value: formatCurrency(totalRevenue, currency),
      icon: DollarSign,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: '대기 중 주문',
      value: pendingOrders.toLocaleString(),
      icon: Clock,
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: '환불율',
      value: `${refundRate.toFixed(1)}%`,
      icon: TrendingDown,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className={`rounded-lg p-3 ${stat.bgColor}`}>
                <Icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
