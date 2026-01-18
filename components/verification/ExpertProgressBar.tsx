'use client';

import { CheckCircle2, Circle, Loader2, XCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  EXPERT_TYPES,
  EXPERT_REVIEW_STATUS_INFO,
  type ExpertReview,
  type ExpertType,
} from '@/lib/types/verification-expert';

interface ExpertProgressBarProps {
  expertReviews: ExpertReview[];
}

export function ExpertProgressBar({ expertReviews }: ExpertProgressBarProps) {
  const expertTypes: ExpertType[] = ['DESIGN', 'PLANNING', 'DEVELOPMENT', 'DOMAIN'];

  // Calculate completion
  const completedCount = expertReviews.filter(
    (review) => review.status === 'COMPLETED'
  ).length;
  const totalCount = expertTypes.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  // Create map for quick lookup
  const reviewMap = new Map<ExpertType, ExpertReview>();
  expertReviews.forEach((review) => {
    reviewMap.set(review.expert_type, review);
  });

  return (
    <div className="space-y-4">
      {/* Overall Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">전문가 검수 진행률</span>
          <span className="text-gray-600">
            {completedCount}/{totalCount} 완료
          </span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Expert Grid */}
      <div className="grid grid-cols-2 gap-3">
        {expertTypes.map((type) => {
          const review = reviewMap.get(type);
          const expertInfo = EXPERT_TYPES[type];
          const statusInfo = review
            ? EXPERT_REVIEW_STATUS_INFO[review.status]
            : null;

          return (
            <div
              key={type}
              className={cn(
                'border rounded-lg p-3 transition-all',
                review?.status === 'COMPLETED' &&
                  'border-green-300 bg-green-50',
                review?.status === 'IN_PROGRESS' &&
                  'border-yellow-300 bg-yellow-50',
                review?.status === 'ASSIGNED' &&
                  'border-blue-300 bg-blue-50',
                review?.status === 'REJECTED' &&
                  'border-red-300 bg-red-50',
                !review && 'border-gray-200 bg-gray-50'
              )}
            >
              <div className="flex items-start gap-2">
                <div className="text-2xl">{expertInfo.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900">
                    {expertInfo.nameKo}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {review?.status === 'COMPLETED' && (
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                    )}
                    {review?.status === 'IN_PROGRESS' && (
                      <Loader2 className="h-3 w-3 text-yellow-600 animate-spin" />
                    )}
                    {review?.status === 'ASSIGNED' && (
                      <Circle className="h-3 w-3 text-blue-600" />
                    )}
                    {review?.status === 'REJECTED' && (
                      <XCircle className="h-3 w-3 text-red-600" />
                    )}
                    {!review && <Circle className="h-3 w-3 text-gray-400" />}
                    <span
                      className={cn(
                        'text-xs',
                        statusInfo?.color === 'green' && 'text-green-700',
                        statusInfo?.color === 'yellow' && 'text-yellow-700',
                        statusInfo?.color === 'blue' && 'text-blue-700',
                        statusInfo?.color === 'red' && 'text-red-700',
                        !statusInfo && 'text-gray-500'
                      )}
                    >
                      {statusInfo?.textKo || '대기중'}
                    </span>
                  </div>
                  {review?.score !== null && review?.score !== undefined && (
                    <div className="mt-1 text-xs font-semibold text-gray-700">
                      점수: {Math.round(review.score)}점
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Average Score if any completed */}
      {completedCount > 0 && (
        <div className="border-t pt-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">평균 점수</span>
            <span className="text-lg font-bold text-gray-900">
              {Math.round(
                expertReviews
                  .filter(
                    (r) =>
                      r.status === 'COMPLETED' &&
                      r.score !== null &&
                      r.score !== undefined
                  )
                  .reduce((sum, r) => sum + (r.score || 0), 0) / completedCount
              )}
              점
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
