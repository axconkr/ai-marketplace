'use client';

import { useRouter } from 'next/navigation';
import { Clock, DollarSign, User, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { RequestWithDetails } from '@/src/lib/requests/types';

/**
 * RequestCard Component
 * Displays a single development request in card format
 */

interface RequestCardProps {
  request: RequestWithDetails;
}

const CATEGORY_LABELS: Record<string, string> = {
  n8n: 'n8n Workflow',
  make: 'Make.com',
  ai_agent: 'AI Agent',
  app: 'Application',
  api: 'API',
  prompt: 'Prompt',
};

const STATUS_LABELS: Record<string, string> = {
  OPEN: '모집 중',
  IN_PROGRESS: '진행 중',
  COMPLETED: '완료',
  CANCELLED: '취소됨',
};

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-green-500',
  IN_PROGRESS: 'bg-blue-500',
  COMPLETED: 'bg-gray-500',
  CANCELLED: 'bg-red-500',
};

export function RequestCard({ request }: RequestCardProps) {
  const router = useRouter();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return '방금 전';
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    if (diffInHours < 48) return '어제';
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}일 전`;

    return new Date(date).toLocaleDateString('ko-KR');
  };

  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => router.push(`/requests/${request.id}`)}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge variant="secondary">{CATEGORY_LABELS[request.category] || request.category}</Badge>
          <Badge className={`${STATUS_COLORS[request.status]} text-white`}>
            {STATUS_LABELS[request.status]}
          </Badge>
        </div>
        <h3 className="text-lg font-semibold line-clamp-2 hover:text-primary">
          {request.title}
        </h3>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-gray-600 line-clamp-3">{request.description}</p>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <span className="font-medium">
              {formatCurrency(request.budgetMin)} - {formatCurrency(request.budgetMax)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>{request.timeline}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="w-4 h-4 text-gray-400" />
            <span>{request.buyer.name}</span>
          </div>

          {request.proposals && request.proposals.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MessageSquare className="w-4 h-4 text-gray-400" />
              <span>{request.proposals.length}개의 제안</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="text-xs text-gray-500">
        {formatDate(request.createdAt)}
      </CardFooter>
    </Card>
  );
}
