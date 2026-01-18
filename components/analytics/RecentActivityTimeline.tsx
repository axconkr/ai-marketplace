'use client';

import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  ShoppingCart,
  Package,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Activity {
  id: string;
  type: 'order' | 'product' | 'settlement' | 'verification' | 'refund';
  title: string;
  description: string;
  timestamp: Date | string;
  status?: 'success' | 'warning' | 'error' | 'info';
}

interface RecentActivityTimelineProps {
  activities: Activity[];
  limit?: number;
}

const iconMap = {
  order: ShoppingCart,
  product: Package,
  settlement: DollarSign,
  verification: FileText,
  refund: AlertCircle,
};

const statusConfig = {
  success: {
    bg: 'bg-green-100',
    text: 'text-green-600',
    icon: CheckCircle,
  },
  warning: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-600',
    icon: AlertCircle,
  },
  error: {
    bg: 'bg-red-100',
    text: 'text-red-600',
    icon: XCircle,
  },
  info: {
    bg: 'bg-blue-100',
    text: 'text-blue-600',
    icon: CheckCircle,
  },
};

export function RecentActivityTimeline({
  activities,
  limit = 10
}: RecentActivityTimelineProps) {
  const displayActivities = activities.slice(0, limit);

  if (displayActivities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>최근 활동이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

      {/* Activities */}
      <div className="space-y-6">
        {displayActivities.map((activity, index) => {
          const TypeIcon = iconMap[activity.type] || Package;
          const status = activity.status || 'info';
          const statusStyle = statusConfig[status];

          return (
            <div key={activity.id || index} className="relative flex items-start gap-4">
              {/* Icon */}
              <div
                className={cn(
                  'relative z-10 flex items-center justify-center w-12 h-12 rounded-full',
                  statusStyle.bg
                )}
              >
                <TypeIcon className={cn('w-5 h-5', statusStyle.text)} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {activity.description}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {formatDistanceToNow(new Date(activity.timestamp), {
                      addSuffix: true,
                      locale: ko,
                    })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
