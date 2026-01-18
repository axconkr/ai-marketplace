'use client';

import { Star } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

/**
 * RatingFilter Component
 * Star-based rating filter with clickable stars
 */

interface RatingFilterProps {
  minRating?: number;
  availableMin?: number;
  availableMax?: number;
  onChange: (rating?: number) => void;
}

export function RatingFilter({
  minRating,
  availableMin = 0,
  availableMax = 5,
  onChange,
}: RatingFilterProps) {
  const ratings = [5, 4, 3, 2, 1];

  const handleRatingClick = (rating: number) => {
    if (minRating === rating) {
      onChange(undefined);
    } else {
      onChange(rating);
    }
  };

  const clearRating = () => {
    onChange(undefined);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <Star className="w-4 h-4" />
          평점
        </Label>
        {minRating && (
          <button
            onClick={clearRating}
            className="text-xs text-blue-600 hover:underline"
          >
            초기화
          </button>
        )}
      </div>

      <div className="space-y-2">
        {ratings.map((rating) => (
          <button
            key={rating}
            onClick={() => handleRatingClick(rating)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
              minRating === rating
                ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-200'
                : 'hover:bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  className={`w-4 h-4 ${
                    index < rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium">{rating}점 이상</span>
            {minRating === rating && (
              <div className="ml-auto">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Info */}
      {availableMin !== undefined && availableMax !== undefined && (
        <p className="text-xs text-gray-500">
          평점 범위: {availableMin.toFixed(1)} - {availableMax.toFixed(1)}
        </p>
      )}

      {/* Selected Preview */}
      {minRating && (
        <div className="flex items-center gap-1 p-2 bg-yellow-50 border border-yellow-200 rounded">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              className={`w-3 h-3 ${
                index < minRating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          ))}
          <span className="text-xs ml-2 text-yellow-900 font-medium">
            {minRating}점 이상 선택됨
          </span>
        </div>
      )}
    </div>
  );
}
