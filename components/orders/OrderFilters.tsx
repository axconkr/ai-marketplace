'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Search, Calendar as CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export interface OrderFilterState {
  search: string;
  status: string;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface OrderFiltersProps {
  filters: OrderFilterState;
  onFiltersChange: (filters: OrderFilterState) => void;
}

const STATUS_OPTIONS = [
  { value: 'all', label: '전체 상태' },
  { value: 'PENDING', label: '대기 중' },
  { value: 'PAID', label: '결제 완료' },
  { value: 'COMPLETED', label: '완료' },
  { value: 'REFUNDED', label: '환불됨' },
  { value: 'CANCELLED', label: '취소됨' },
];

const DATE_PRESETS = [
  { value: '7d', label: '최근 7일' },
  { value: '30d', label: '최근 30일' },
  { value: '90d', label: '최근 90일' },
  { value: 'custom', label: '사용자 지정' },
];

const SORT_OPTIONS = [
  { value: 'createdAt', label: '주문 날짜' },
  { value: 'amount', label: '금액' },
  { value: 'status', label: '상태' },
];

export function OrderFilters({ filters, onFiltersChange }: OrderFiltersProps) {
  const [datePreset, setDatePreset] = useState('30d');
  const [showCustomDate, setShowCustomDate] = useState(false);

  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search });
  };

  const handleStatusChange = (status: string) => {
    onFiltersChange({ ...filters, status });
  };

  const handleDatePresetChange = (preset: string) => {
    setDatePreset(preset);

    if (preset === 'custom') {
      setShowCustomDate(true);
      return;
    }

    setShowCustomDate(false);

    const now = new Date();
    const from = new Date();

    switch (preset) {
      case '7d':
        from.setDate(now.getDate() - 7);
        break;
      case '30d':
        from.setDate(now.getDate() - 30);
        break;
      case '90d':
        from.setDate(now.getDate() - 90);
        break;
      default:
        from.setFullYear(2000);
    }

    onFiltersChange({
      ...filters,
      dateRange: { from, to: now },
    });
  };

  const handleCustomDateChange = (range: { from: Date | undefined; to: Date | undefined }) => {
    onFiltersChange({
      ...filters,
      dateRange: range,
    });
  };

  const handleSortChange = (sortBy: string) => {
    onFiltersChange({ ...filters, sortBy });
  };

  const handleSortOrderToggle = () => {
    onFiltersChange({
      ...filters,
      sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc',
    });
  };

  const handleClearFilters = () => {
    setDatePreset('30d');
    setShowCustomDate(false);
    const now = new Date();
    const from = new Date();
    from.setDate(now.getDate() - 30);

    onFiltersChange({
      search: '',
      status: 'all',
      dateRange: { from, to: now },
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.status !== 'all' ||
    datePreset !== '30d' ||
    filters.sortBy !== 'createdAt' ||
    filters.sortOrder !== 'desc';

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Search and Status Row */}
          <div className="flex flex-col gap-4 md:flex-row">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="주문 ID, 상품명, 고객 이메일로 검색..."
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={filters.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="상태 선택" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range and Sort Row */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            {/* Date Range Preset */}
            <Select value={datePreset} onValueChange={handleDatePresetChange}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="기간 선택" />
              </SelectTrigger>
              <SelectContent>
                {DATE_PRESETS.map((preset) => (
                  <SelectItem key={preset.value} value={preset.value}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Custom Date Range */}
            {showCustomDate && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal md:w-[300px]',
                      !filters.dateRange.from && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange.from ? (
                      filters.dateRange.to ? (
                        <>
                          {format(filters.dateRange.from, 'PPP', { locale: ko })} -{' '}
                          {format(filters.dateRange.to, 'PPP', { locale: ko })}
                        </>
                      ) : (
                        format(filters.dateRange.from, 'PPP', { locale: ko })
                      )
                    ) : (
                      <span>날짜 선택</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={filters.dateRange.from}
                    selected={{
                      from: filters.dateRange.from,
                      to: filters.dateRange.to,
                    }}
                    onSelect={(range) =>
                      handleCustomDateChange({
                        from: range?.from,
                        to: range?.to,
                      })
                    }
                    numberOfMonths={2}
                    locale={ko}
                  />
                </PopoverContent>
              </Popover>
            )}

            {/* Sort Options */}
            <div className="flex gap-2">
              <Select value={filters.sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="정렬" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={handleSortOrderToggle}
                title={filters.sortOrder === 'asc' ? '오름차순' : '내림차순'}
              >
                {filters.sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={handleClearFilters}
                className="w-full md:w-auto"
              >
                <X className="mr-2 h-4 w-4" />
                필터 초기화
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
