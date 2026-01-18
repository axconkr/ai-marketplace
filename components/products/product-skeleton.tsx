import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * ProductSkeleton component
 * Loading skeleton for product cards
 */

export function ProductSkeleton() {
  return (
    <Card className="h-full">
      {/* Image skeleton */}
      <Skeleton className="aspect-video w-full rounded-t-lg" />

      <CardContent className="p-4">
        {/* Category badge */}
        <Skeleton className="h-5 w-20 mb-2" />

        {/* Title */}
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-3/4 mb-3" />

        {/* Description */}
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-5/6 mb-3" />

        {/* Stats */}
        <div className="flex gap-4 mb-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>

        {/* Seller */}
        <div className="flex items-center gap-2">
          <Skeleton className="w-6 h-6 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        {/* Price */}
        <Skeleton className="h-8 w-32" />
      </CardFooter>
    </Card>
  );
}
