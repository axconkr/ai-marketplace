'use client';

import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Star,
  Download,
  DollarSign,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

/**
 * Enhanced Product Sort Select Component
 * Features:
 * - Sort icons
 * - Active sort indicator
 * - Better visual design
 */

interface ProductSortSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const SORT_OPTIONS = [
  {
    value: 'newest',
    label: '최신순',
    icon: Calendar,
  },
  {
    value: 'popular',
    label: '인기순 (다운로드)',
    icon: Download,
  },
  {
    value: 'rating',
    label: '평점 높은순',
    icon: Star,
  },
  {
    value: 'price_asc',
    label: '가격: 낮은순',
    icon: TrendingDown,
  },
  {
    value: 'price_desc',
    label: '가격: 높은순',
    icon: TrendingUp,
  },
];

export function ProductSortSelect({
  value,
  onChange,
  className,
}: ProductSortSelectProps) {
  const currentOption = SORT_OPTIONS.find((opt) => opt.value === value);
  const Icon = currentOption?.icon || Calendar;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-sm text-muted-foreground whitespace-nowrap">
        정렬:
      </span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[180px] gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => {
            const OptionIcon = option.icon;
            return (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  <OptionIcon className="h-4 w-4 text-muted-foreground" />
                  <span>{option.label}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
