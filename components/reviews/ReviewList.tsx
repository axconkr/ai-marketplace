'use client';

import { useState, useEffect, useMemo } from 'react';
import { ReviewCard } from './ReviewCard';
import { RatingSummary } from './RatingSummary';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

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
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface ReviewListProps {
  productId: string;
  currentUserId?: string;
  isProductSeller?: boolean;
}

export function ReviewList({
  productId,
  currentUserId,
  isProductSeller,
}: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingData, setRatingData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'rating'>('recent');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        productId,
        sortBy,
        page: page.toString(),
      });

      if (filterRating) {
        params.append('filterRating', filterRating.toString());
      }

      const response = await fetch(`/api/reviews?${params}`);
      const data = await response.json();

      setReviews(data.reviews);
      setTotalPages(data.totalPages);

      // Fetch rating summary
      const productResponse = await fetch(`/api/products/${productId}`);
      const productData = await productResponse.json();
      setRatingData({
        ratingAverage: productData.rating_average,
        ratingCount: productData.rating_count,
        ratingDistribution: productData.rating_distribution,
      });
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId, sortBy, filterRating, page]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      {ratingData && (
        <RatingSummary
          ratingAverage={ratingData.ratingAverage || 0}
          ratingCount={ratingData.ratingCount || 0}
          ratingDistribution={ratingData.ratingDistribution || {}}
        />
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Select
            value={sortBy}
            onValueChange={(value: any) => setSortBy(value)}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="helpful">Most Helpful</SelectItem>
              <SelectItem value="rating">Highest Rating</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button
            variant={filterRating === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterRating(null)}
          >
            All
          </Button>
          {[5, 4, 3, 2, 1].map((rating) => (
            <Button
              key={rating}
              variant={filterRating === rating ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterRating(rating)}
            >
              {rating}★
            </Button>
          ))}
        </div>
      </div>

      {/* Reviews */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No reviews found
          </div>
        ) : (
          reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              currentUserId={currentUserId}
              isProductSeller={isProductSeller}
              onReplyAdded={fetchReviews}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <div className="flex items-center px-4">
            Page {page} of {totalPages}
          </div>
          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
