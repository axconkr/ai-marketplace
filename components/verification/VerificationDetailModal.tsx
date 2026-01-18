'use client';

import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VerificationTimeline } from './VerificationTimeline';
import { ExpertProgressBar } from './ExpertProgressBar';
import { ExpertReviewCard } from './ExpertReviewCard';
import {
  VERIFICATION_LEVEL_INFO,
  type VerificationWithExperts,
} from '@/lib/types/verification-expert';

interface VerificationDetailModalProps {
  verification: VerificationWithExperts | null;
  open: boolean;
  onClose: () => void;
}

export function VerificationDetailModal({
  verification,
  open,
  onClose,
}: VerificationDetailModalProps) {
  if (!verification) return null;

  const levelInfo = VERIFICATION_LEVEL_INFO[verification.level as 0 | 1 | 2 | 3];
  const isLevel3 = verification.level === 3;
  const expertReviews = verification.expertReviews || [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl">
                {verification.product.name}
              </DialogTitle>
              <p className="text-sm text-gray-600 mt-1">
                검증 요청 세부사항
              </p>
            </div>
            <Badge
              className={cn(levelInfo.color, 'text-white shrink-0')}
            >
              {levelInfo.name}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">상품명</span>
              <p className="font-medium mt-1">{verification.product.name}</p>
            </div>
            <div>
              <span className="text-gray-600">검증 레벨</span>
              <p className="font-medium mt-1">{levelInfo.name}</p>
            </div>
            <div>
              <span className="text-gray-600">검증 비용</span>
              <p className="font-medium mt-1">
                ${(verification.fee / 100).toFixed(2)}
              </p>
            </div>
            <div>
              <span className="text-gray-600">요청일</span>
              <p className="font-medium mt-1">
                {new Date(verification.requested_at).toLocaleDateString('ko-KR')}
              </p>
            </div>
          </div>

          <Separator />

          {/* Timeline */}
          <div>
            <h3 className="font-semibold text-sm text-gray-900 mb-3">
              검증 진행 상황
            </h3>
            <VerificationTimeline verification={verification} />
          </div>

          <Separator />

          {/* Level 3: Expert Reviews */}
          {isLevel3 && expertReviews.length > 0 && (
            <>
              <div>
                <h3 className="font-semibold text-sm text-gray-900 mb-3">
                  전문가 검수 현황
                </h3>
                <ExpertProgressBar expertReviews={expertReviews} />
              </div>

              <Separator />

              {/* Tabs for Expert Reviews */}
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="all">전체</TabsTrigger>
                  <TabsTrigger value="DESIGN">디자인</TabsTrigger>
                  <TabsTrigger value="PLANNING">기획</TabsTrigger>
                  <TabsTrigger value="DEVELOPMENT">개발</TabsTrigger>
                  <TabsTrigger value="DOMAIN">도메인</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-3 mt-4">
                  {expertReviews.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8">
                      아직 배정된 전문가가 없습니다.
                    </p>
                  ) : (
                    <div className="grid gap-3">
                      {expertReviews.map((review) => (
                        <ExpertReviewCard
                          key={review.id}
                          review={review}
                          showDetails
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>

                {['DESIGN', 'PLANNING', 'DEVELOPMENT', 'DOMAIN'].map((type) => {
                  const review = expertReviews.find(
                    (r) => r.expert_type === type
                  );
                  return (
                    <TabsContent
                      key={type}
                      value={type}
                      className="space-y-3 mt-4"
                    >
                      {review ? (
                        <ExpertReviewCard review={review} showDetails />
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-8">
                          아직 배정된 전문가가 없습니다.
                        </p>
                      )}
                    </TabsContent>
                  );
                })}
              </Tabs>
            </>
          )}

          {/* Fee Breakdown */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-sm text-gray-900 mb-3">
              비용 내역
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">검증 비용</span>
                <span className="font-medium">
                  ${(verification.fee / 100).toFixed(2)}
                </span>
              </div>
              {isLevel3 && expertReviews.length > 0 && (
                <>
                  <Separator className="my-2" />
                  <div className="text-xs text-gray-500 mb-2">
                    전문가별 비용 분배
                  </div>
                  {expertReviews.map((review) => (
                    <div
                      key={review.id}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-gray-500">
                        {
                          EXPERT_TYPES[review.expert_type as keyof typeof EXPERT_TYPES]
                            .nameKo
                        }
                      </span>
                      <span className="text-gray-600">
                        ${(review.fee / 100).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </>
              )}
              <Separator className="my-2" />
              <div className="flex items-center justify-between">
                <span className="text-gray-600">플랫폼 수수료 (30%)</span>
                <span className="font-medium">
                  ${(verification.platform_share / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">검증자 수익 (70%)</span>
                <span className="font-medium text-green-600">
                  ${(verification.verifier_share / 100).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Badges Earned */}
          {verification.badges && verification.badges.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm text-gray-900 mb-3">
                획득한 배지
              </h3>
              <div className="flex flex-wrap gap-2">
                {verification.badges.map((badge) => (
                  <Badge key={badge} variant="outline">
                    {badge}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Import statement needed at top
import { cn } from '@/lib/utils';
import { EXPERT_TYPES } from '@/lib/types/verification-expert';
