'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: 'small' | 'default' | 'large';
}

const sizeClasses = {
  small: 'h-4 w-4',
  default: 'h-6 w-6',
  large: 'h-8 w-8',
};

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = 'default',
}: StarRatingProps) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={cn(
            'transition-colors',
            readonly && 'cursor-default',
            !readonly && 'hover:scale-110'
          )}
        >
          <Star
            className={cn(
              sizeClasses[size],
              hover >= star || value >= star
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-none text-gray-300'
            )}
          />
        </button>
      ))}
    </div>
  );
}
