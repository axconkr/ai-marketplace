'use client';

import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, AlertCircle, Pause } from 'lucide-react';

/**
 * SubscriptionStatusBadge Component
 * Displays subscription status with appropriate styling
 */

interface SubscriptionStatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const STATUS_CONFIG = {
  ACTIVE: {
    label: '활성',
    color: 'bg-green-500 text-white',
    icon: CheckCircle,
  },
  CANCELLED: {
    label: '취소됨',
    color: 'bg-red-500 text-white',
    icon: XCircle,
  },
  PAST_DUE: {
    label: '결제 지연',
    color: 'bg-orange-500 text-white',
    icon: AlertCircle,
  },
  PAUSED: {
    label: '일시중지',
    color: 'bg-gray-500 text-white',
    icon: Pause,
  },
  TRIALING: {
    label: '체험 중',
    color: 'bg-blue-500 text-white',
    icon: Clock,
  },
};

export function SubscriptionStatusBadge({
  status,
  size = 'md',
  showIcon = true,
}: SubscriptionStatusBadgeProps) {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || {
    label: status,
    color: 'bg-gray-500 text-white',
    icon: AlertCircle,
  };

  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <Badge className={`${config.color} ${sizeClasses[size]} flex items-center gap-1`}>
      {showIcon && <Icon className={iconSizes[size]} />}
      {config.label}
    </Badge>
  );
}
