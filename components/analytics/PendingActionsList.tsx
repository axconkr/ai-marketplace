'use client';

import Link from 'next/link';
import { AlertCircle, FileText, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PendingAction {
  type: string;
  title: string;
  description: string;
  action: string;
  priority: 'low' | 'medium' | 'high';
}

interface PendingActionsListProps {
  actions: PendingAction[];
}

const priorityConfig = {
  low: { color: 'bg-gray-100 text-gray-700', badge: 'secondary' as const },
  medium: { color: 'bg-yellow-100 text-yellow-700', badge: 'outline' as const },
  high: { color: 'bg-red-100 text-red-700', badge: 'destructive' as const },
};

const iconMap: Record<string, any> = {
  draft_products: FileText,
  pending_settlement: DollarSign,
  verification_failed: AlertCircle,
};

export function PendingActionsList({ actions }: PendingActionsListProps) {
  if (actions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-lg font-medium text-green-600">All caught up!</p>
        <p className="text-sm mt-1">No pending actions at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {actions.map((action, index) => {
        const Icon = iconMap[action.type] || AlertCircle;
        const priorityStyle = priorityConfig[action.priority];

        return (
          <Link
            key={index}
            href={action.action}
            className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
          >
            <div className={`p-2 rounded-lg ${priorityStyle.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-gray-900">{action.title}</h4>
                <Badge variant={priorityStyle.badge} className="text-xs">
                  {action.priority}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{action.description}</p>
            </div>
            <svg
              className="w-5 h-5 text-gray-400 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        );
      })}
    </div>
  );
}
