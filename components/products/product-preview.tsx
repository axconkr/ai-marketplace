'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MarkdownPreview } from './markdown-preview';
import { CATEGORY_LABELS, PRICING_MODEL_LABELS } from '@/lib/validations/product';
import { ExternalLink, FileText } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

/**
 * ProductPreview component
 * Shows how the product will look when published
 */

interface ProductPreviewData {
  name: string;
  short_description?: string | null;
  description: string;
  category: string;
  tags?: string[];
  price: number;
  currency?: string;
  pricing_model?: string;
  thumbnail_url?: string | null;
  image_urls?: string[];
  demo_url?: string | null;
  documentation_url?: string | null;
}

interface ProductPreviewProps {
  data: Partial<ProductPreviewData>;
  className?: string;
}

export function ProductPreview({ data, className }: ProductPreviewProps) {
  const {
    name = '상품명 미입력',
    short_description,
    description = '상세 설명 미입력',
    category,
    tags = [],
    price = 0,
    currency = 'KRW',
    pricing_model,
    thumbnail_url,
    image_urls = [],
    demo_url,
    documentation_url,
  } = data;

  const formatPrice = (price: number, currency: string) => {
    const symbol = currency === 'USD' ? '$' : '₩';
    const formatted = new Intl.NumberFormat('ko-KR').format(price);
    return currency === 'USD' ? `${symbol}${formatted}` : `${formatted}${symbol}`;
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="space-y-4">
        {/* Thumbnail */}
        {thumbnail_url && (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
            <Image
              src={thumbnail_url}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 600px"
            />
          </div>
        )}

        {/* Title and Category */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold tracking-tight">{name}</h1>
            {category && (
              <Badge variant="secondary">
                {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] || category}
              </Badge>
            )}
          </div>

          {short_description && (
            <p className="text-muted-foreground">{short_description}</p>
          )}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-primary">
            {formatPrice(price, currency)}
          </span>
          {pricing_model && (
            <span className="text-sm text-muted-foreground">
              {PRICING_MODEL_LABELS[pricing_model as keyof typeof PRICING_MODEL_LABELS] || pricing_model}
            </span>
          )}
        </div>

        {/* Links */}
        {(demo_url || documentation_url) && (
          <div className="flex flex-wrap gap-2">
            {demo_url && (
              <a
                href={demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                데모 보기
              </a>
            )}
            {documentation_url && (
              <a
                href={documentation_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <FileText className="w-4 h-4" />
                문서 보기
              </a>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Additional Images */}
        {image_urls.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {image_urls.map((url, index) => (
              <div
                key={index}
                className="relative aspect-video rounded-lg overflow-hidden bg-muted"
              >
                <Image
                  src={url}
                  alt={`${name} - Image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </div>
            ))}
          </div>
        )}

        {/* Description */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">상세 설명</h2>
          <div className="rounded-lg border bg-muted/50 p-4">
            <MarkdownPreview content={description} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * ProductPreviewCard component
 * Compact card preview for lists
 */

interface ProductPreviewCardProps {
  data: Partial<ProductPreviewData>;
  className?: string;
}

export function ProductPreviewCard({ data, className }: ProductPreviewCardProps) {
  const {
    name = '상품명 미입력',
    short_description,
    category,
    price = 0,
    currency = 'KRW',
    thumbnail_url,
  } = data;

  const formatPrice = (price: number, currency: string) => {
    const symbol = currency === 'USD' ? '$' : '₩';
    const formatted = new Intl.NumberFormat('ko-KR').format(price);
    return currency === 'USD' ? `${symbol}${formatted}` : `${formatted}${symbol}`;
  };

  return (
    <Card className={cn('overflow-hidden hover:shadow-lg transition-shadow', className)}>
      {/* Thumbnail */}
      {thumbnail_url ? (
        <div className="relative w-full aspect-video bg-muted">
          <Image
            src={thumbnail_url}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 300px"
          />
        </div>
      ) : (
        <div className="w-full aspect-video bg-muted flex items-center justify-center">
          <FileText className="w-12 h-12 text-muted-foreground" />
        </div>
      )}

      <CardContent className="p-4 space-y-3">
        {/* Category Badge */}
        {category && (
          <Badge variant="secondary" className="text-xs">
            {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] || category}
          </Badge>
        )}

        {/* Title */}
        <h3 className="font-semibold line-clamp-2">{name}</h3>

        {/* Short Description */}
        {short_description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {short_description}
          </p>
        )}

        {/* Price */}
        <div className="text-lg font-bold text-primary">
          {formatPrice(price, currency)}
        </div>
      </CardContent>
    </Card>
  );
}
