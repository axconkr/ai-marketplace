'use client';

import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  EXPERT_TYPES,
  EXPERT_REVIEW_STATUS_INFO,
  type ExpertReview,
} from '@/lib/types/verification-expert';

interface ExpertReviewCardProps {
  review: ExpertReview;
  showDetails?: boolean;
}

export function ExpertReviewCard({
  review,
  showDetails = false,
}: ExpertReviewCardProps) {
  const expertInfo = EXPERT_TYPES[review.expert_type];
  const statusInfo = EXPERT_REVIEW_STATUS_INFO[review.status];

  return (
    <Card className={cn('transition-all', expertInfo.bgColor)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{expertInfo.icon}</span>
            <div>
              <CardTitle className="text-base">{expertInfo.nameKo}</CardTitle>
              <p className="text-xs text-gray-600 mt-0.5">
                {expertInfo.description}
              </p>
            </div>
          </div>
          <Badge
            variant={
              statusInfo.color === 'green'
                ? 'default'
                : statusInfo.color === 'red'
                ? 'destructive'
                : 'secondary'
            }
            className="shrink-0"
          >
            {statusInfo.textKo}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Score */}
        {review.score !== null && review.score !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">평가 점수</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900">
                {Math.round(review.score)}
              </span>
              <span className="text-sm text-gray-500">/ 100점</span>
            </div>
          </div>
        )}

        {/* Fee */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">검수 비용</span>
          <span className="font-medium">${(review.fee / 100).toFixed(2)}</span>
        </div>

        {/* Date Info */}
        {review.completed_at && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">완료일</span>
            <span className="text-gray-900">
              {new Date(review.completed_at).toLocaleDateString('ko-KR')}
            </span>
          </div>
        )}

        {review.assigned_at && !review.completed_at && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">배정일</span>
            <span className="text-gray-900">
              {new Date(review.assigned_at).toLocaleDateString('ko-KR')}
            </span>
          </div>
        )}

        {/* Detailed Report */}
        {showDetails && review.report && (
          <>
            <Separator />
            <div className="space-y-3 text-sm">
              {/* Strengths */}
              {review.report.strengths &&
                review.report.strengths.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1 mb-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="font-semibold text-green-700">
                        강점
                      </span>
                    </div>
                    <ul className="space-y-1 ml-5">
                      {review.report.strengths.map((item, idx) => (
                        <li key={idx} className="text-gray-700 list-disc">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* Weaknesses */}
              {review.report.weaknesses &&
                review.report.weaknesses.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1 mb-2">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <span className="font-semibold text-amber-700">
                        개선사항
                      </span>
                    </div>
                    <ul className="space-y-1 ml-5">
                      {review.report.weaknesses.map((item, idx) => (
                        <li key={idx} className="text-gray-700 list-disc">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* Recommendations */}
              {review.report.recommendations &&
                review.report.recommendations.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1 mb-2">
                      <span className="font-semibold text-blue-700">
                        추천사항
                      </span>
                    </div>
                    <ul className="space-y-1 ml-5">
                      {review.report.recommendations.map((item, idx) => (
                        <li key={idx} className="text-gray-700 list-disc">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* Detailed Feedback */}
              {review.report.detailedFeedback && (
                <div>
                  <span className="font-semibold text-gray-900 block mb-2">
                    상세 피드백
                  </span>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {review.report.detailedFeedback}
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Simple Feedback */}
        {showDetails && review.feedback && !review.report && (
          <>
            <Separator />
            <div className="space-y-2 text-sm">
              <span className="font-semibold text-gray-900 block">피드백</span>
              <p className="text-gray-700 whitespace-pre-wrap">
                {review.feedback}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
