'use client';

import { useState, useEffect } from 'react';
import { DollarSign } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

/**
 * PriceRangeSlider Component
 * Dual input price range filter with live validation
 */

interface PriceRangeSliderProps {
  minPrice?: number;
  maxPrice?: number;
  availableMin?: number;
  availableMax?: number;
  currency?: 'KRW' | 'USD';
  onChange: (min?: number, max?: number) => void;
}

export function PriceRangeSlider({
  minPrice,
  maxPrice,
  availableMin = 0,
  availableMax = 1000000,
  currency = 'KRW',
  onChange,
}: PriceRangeSliderProps) {
  const [min, setMin] = useState<string>(minPrice?.toString() || '');
  const [max, setMax] = useState<string>(maxPrice?.toString() || '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMin(minPrice?.toString() || '');
    setMax(maxPrice?.toString() || '');
  }, [minPrice, maxPrice]);

  const formatCurrency = (value: number) => {
    if (currency === 'KRW') {
      return new Intl.NumberFormat('ko-KR', {
        style: 'currency',
        currency: 'KRW',
        minimumFractionDigits: 0,
      }).format(value);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const handleMinChange = (value: string) => {
    setMin(value);
    setError(null);

    const numValue = value === '' ? undefined : parseFloat(value);
    const maxValue = max === '' ? undefined : parseFloat(max);

    if (numValue !== undefined && maxValue !== undefined && numValue > maxValue) {
      setError('최소 가격은 최대 가격보다 작아야 합니다');
      return;
    }

    onChange(numValue, maxValue);
  };

  const handleMaxChange = (value: string) => {
    setMax(value);
    setError(null);

    const minValue = min === '' ? undefined : parseFloat(min);
    const numValue = value === '' ? undefined : parseFloat(value);

    if (minValue !== undefined && numValue !== undefined && minValue > numValue) {
      setError('최대 가격은 최소 가격보다 커야 합니다');
      return;
    }

    onChange(minValue, numValue);
  };

  const clearRange = () => {
    setMin('');
    setMax('');
    setError(null);
    onChange(undefined, undefined);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          가격 범위
        </Label>
        {(min || max) && (
          <button
            onClick={clearRange}
            className="text-xs text-blue-600 hover:underline"
          >
            초기화
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="min-price" className="text-xs text-gray-600">
            최소
          </Label>
          <Input
            id="min-price"
            type="number"
            placeholder={formatCurrency(availableMin)}
            value={min}
            onChange={(e) => handleMinChange(e.target.value)}
            min={availableMin}
            max={availableMax}
            step={currency === 'KRW' ? 1000 : 1}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="max-price" className="text-xs text-gray-600">
            최대
          </Label>
          <Input
            id="max-price"
            type="number"
            placeholder={formatCurrency(availableMax)}
            value={max}
            onChange={(e) => handleMaxChange(e.target.value)}
            min={availableMin}
            max={availableMax}
            step={currency === 'KRW' ? 1000 : 1}
            className="mt-1"
          />
        </div>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {/* Range Preview */}
      {(min || max) && !error && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-3 pb-3">
            <p className="text-sm text-blue-900">
              {min && max
                ? `${formatCurrency(parseFloat(min))} - ${formatCurrency(parseFloat(max))}`
                : min
                ? `${formatCurrency(parseFloat(min))} 이상`
                : max
                ? `${formatCurrency(parseFloat(max))} 이하`
                : ''}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Available Range Info */}
      <p className="text-xs text-gray-500">
        사용 가능: {formatCurrency(availableMin)} - {formatCurrency(availableMax)}
      </p>
    </div>
  );
}
