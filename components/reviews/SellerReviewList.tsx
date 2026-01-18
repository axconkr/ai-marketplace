'use client';

import { SellerReviewCard } from './SellerReviewCard';
import { Button } from '@/components/ui/button';
import { Loader2, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Review {
  id: string;
  rating: number;
  title?: string;
  comment: string;
  images: string[];
  verified_purchase: boolean;
  seller_reply?: string;
  seller_replied_at?: string;
  helpful_count: number;
  not_helpful_count: number;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  product: {
    id: string;
    name: string;
  };
}

interface SellerReviewListProps {
  reviews: Review[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onReply: (reviewId: string, reply: string) => Promise<void>;
  onEditReply: (reviewId: string, reply: string) => Promise<void>;
  onDeleteReply: (reviewId: string) => Promise<void>;
  onReport: (reviewId: string) => void;
}

export function SellerReviewList({
  reviews,
  isLoading,
  hasMore,
  onLoadMore,
  onReply,
  onEditReply,
  onDeleteReply,
  onReport,
}: SellerReviewListProps) {
  if (isLoading && reviews.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!isLoading && reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <FileText className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          리뷰가 없습니다
        </h3>
        <p className="text-gray-500">
          현재 조건에 맞는 리뷰가 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <SellerReviewCard
          key={review.id}
          review={review}
          onReply={onReply}
          onEditReply={onEditReply}
          onDeleteReply={onDeleteReply}
          onReport={onReport}
        />
      ))}

      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isLoading}
            className="w-full md:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                로딩 중...
              </>
            ) : (
              '더보기'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
