'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: LucideIcon;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export function StatsCard({
  title,
  value,
  change,
  trend = 'neutral',
  icon: Icon,
  className,
  prefix,
  suffix
}: StatsCardProps) {
  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  const getTrendIcon = () => {
    if (trend === 'up') return '↑';
    if (trend === 'down') return '↓';
    return '→';
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        {Icon && (
          <Icon className="h-4 w-4 text-gray-400" />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {prefix}
          {value}
          {suffix}
        </div>
        {change !== undefined && (
          <p className={cn('text-xs mt-1', getTrendColor())}>
            <span className="font-medium">
              {getTrendIcon()} {Math.abs(change).toFixed(1)}%
            </span>
            {' '}이전 기간 대비
          </p>
        )}
      </CardContent>
    </Card>
  );
}
