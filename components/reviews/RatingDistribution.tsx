'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingDistributionProps {
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  totalReviews: number;
}

export function RatingDistribution({ distribution, totalReviews }: RatingDistributionProps) {
  const getRatingColor = (rating: number) => {
    switch (rating) {
      case 5:
        return 'bg-green-500';
      case 4:
        return 'bg-green-400';
      case 3:
        return 'bg-yellow-400';
      case 2:
        return 'bg-orange-400';
      case 1:
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getRatingPercentage = (count: number) => {
    if (totalReviews === 0) return 0;
    return (count / totalReviews) * 100;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">평점 분포</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = distribution[rating as keyof typeof distribution] || 0;
          const percentage = getRatingPercentage(count);

          return (
            <div key={rating} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-16">
                <span className="text-sm font-medium">{rating}</span>
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              </div>

              <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full transition-all duration-300',
                    getRatingColor(rating)
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className="w-20 text-right">
                <span className="text-sm font-medium">{count}개</span>
                <span className="text-xs text-gray-500 ml-1">
                  ({percentage.toFixed(0)}%)
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
