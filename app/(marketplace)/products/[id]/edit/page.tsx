'use client';

import { use } from 'react';
import { useProduct } from '@/hooks/use-products';
import { ProductForm } from '@/components/products/product-form';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

/**
 * Edit Product Page
 * Allows sellers to edit their existing products
 */

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: PageProps) {
  const { id } = use(params);
  const { data: product, isLoading, error } = useProduct(id);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-12 w-full max-w-md mb-8" />
        <div className="space-y-4 max-w-4xl">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
          <p className="text-muted-foreground mb-4">
            {error?.message || 'The product you are trying to edit does not exist.'}
          </p>
          <Button asChild>
            <Link href="/dashboard/products">Back to Dashboard</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href={`/products/${id}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Product
          </Link>
        </Button>

        <h1 className="text-4xl font-bold mb-2">Edit Product</h1>
        <p className="text-muted-foreground text-lg">
          Update your product information
        </p>
      </div>

      {/* Form */}
      <div className="max-w-4xl">
        <ProductForm mode="edit" product={product} />
      </div>
    </div>
  );
}
