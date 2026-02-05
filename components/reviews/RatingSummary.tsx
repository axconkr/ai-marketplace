'use client';

import { Card, CardContent } from '@/components/ui/card';
import { StarRating } from './StarRating';
import { Progress } from '@/components/ui/progress';

interface RatingSummaryProps {
  ratingAverage: number;
  ratingCount: number;
  ratingDistribution: Record<number, number>;
}

export function RatingSummary({
  ratingAverage,
  ratingCount,
  ratingDistribution,
}: RatingSummaryProps) {
  if (!ratingCount) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            No reviews yet. Be the first to review!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Average Rating */}
          <div className="text-center">
            <div className="text-5xl font-bold">{ratingAverage.toFixed(1)}</div>
            <StarRating
              value={Math.round(ratingAverage)}
              readonly
              size="default"
            />
            <div className="text-sm text-muted-foreground mt-1">
              {ratingCount} {ratingCount === 1 ? 'review' : 'reviews'}
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = ratingDistribution[rating] || 0;
              const percentage = ratingCount > 0 ? (count / ratingCount) * 100 : 0;

              return (
                <div key={rating} className="flex items-center gap-2">
                  <div className="text-sm w-12 flex items-center gap-1">
                    {rating}
                    <span className="text-yellow-400">★</span>
                  </div>
                  <div className="flex-1">
                    <Progress value={percentage} className="h-2" />
                  </div>
                  <div className="text-sm w-12 text-right">{count}</div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
