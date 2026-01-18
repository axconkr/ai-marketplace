'use client';

import Image from 'next/image';
import { Calendar, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  VERIFICATION_LEVEL_INFO,
  type VerificationWithExperts,
} from '@/lib/types/verification-expert';

interface VerificationListCardProps {
  verification: VerificationWithExperts;
  onClick?: () => void;
}

const STATUS_INFO: Record<
  string,
  { label: string; color: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  PENDING: {
    label: '대기중',
    color: 'bg-yellow-100 text-yellow-800',
    variant: 'secondary',
  },
  ASSIGNED: {
    label: '배정됨',
    color: 'bg-blue-100 text-blue-800',
    variant: 'secondary',
  },
  IN_PROGRESS: {
    label: '진행중',
    color: 'bg-blue-100 text-blue-800',
    variant: 'default',
  },
  COMPLETED: {
    label: '완료',
    color: 'bg-green-100 text-green-800',
    variant: 'default',
  },
  APPROVED: {
    label: '승인됨',
    color: 'bg-green-100 text-green-800',
    variant: 'default',
  },
  REJECTED: {
    label: '거절됨',
    color: 'bg-red-100 text-red-800',
    variant: 'destructive',
  },
};

export function VerificationListCard({
  verification,
  onClick,
}: VerificationListCardProps) {
  const levelInfo = VERIFICATION_LEVEL_INFO[verification.level as 0 | 1 | 2 | 3];
  const statusInfo = STATUS_INFO[verification.status] || STATUS_INFO.PENDING;
  const isLevel3 = verification.level === 3;
  const expertReviews = verification.expertReviews || [];

  // Calculate expert progress for Level 3
  const expertProgress = isLevel3
    ? {
        total: 4,
        completed: expertReviews.filter((r) => r.status === 'COMPLETED').length,
        percentage:
          (expertReviews.filter((r) => r.status === 'COMPLETED').length / 4) *
          100,
      }
    : null;

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-all hover:border-blue-300"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {/* Thumbnail */}
          {verification.product.thumbnail_url && (
            <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100 shrink-0">
              <Image
                src={verification.product.thumbnail_url}
                alt={verification.product.name}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate mb-1">
              {verification.product.name}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={cn(levelInfo.color, 'text-white text-xs')}>
                {levelInfo.name}
              </Badge>
              <Badge variant={statusInfo.variant} className="text-xs">
                {statusInfo.label}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Level 3: Expert Progress */}
        {isLevel3 && expertProgress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">전문가 검수</span>
              <span className="font-medium text-gray-900">
                {expertProgress.completed}/{expertProgress.total}
              </span>
            </div>
            <Progress value={expertProgress.percentage} className="h-1.5" />
          </div>
        )}

        {/* Score */}
        {verification.score !== null && verification.score !== undefined && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-gray-600">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>평가 점수</span>
            </div>
            <span className="font-semibold text-gray-900">
              {Math.round(verification.score)}점
            </span>
          </div>
        )}

        {/* Fee */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">검증 비용</span>
          <span className="font-medium text-gray-900">
            ${(verification.fee / 100).toFixed(2)}
          </span>
        </div>

        {/* Request Date */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Calendar className="h-3.5 w-3.5" />
          <span>
            {new Date(verification.requested_at).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>

        {/* Completion Date */}
        {verification.completed_at && (
          <div className="flex items-center gap-1.5 text-xs text-green-600">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>
              완료:{' '}
              {new Date(verification.completed_at).toLocaleDateString('ko-KR', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        )}

        {/* Estimated Time for Pending */}
        {verification.status === 'PENDING' && (
          <div className="flex items-center gap-1.5 text-xs text-amber-600">
            <Clock className="h-3.5 w-3.5" />
            <span>
              예상 소요시간:{' '}
              {isLevel3 ? '5-7일' : verification.level === 2 ? '3-5일' : '2-3일'}
            </span>
          </div>
        )}

        {/* Badges */}
        {verification.badges && verification.badges.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {verification.badges.slice(0, 3).map((badge) => (
              <Badge key={badge} variant="outline" className="text-xs">
                {badge}
              </Badge>
            ))}
            {verification.badges.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{verification.badges.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
