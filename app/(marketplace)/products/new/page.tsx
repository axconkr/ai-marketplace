'use client';

import { ProductForm } from '@/components/products/product-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

/**
 * Create Product Page
 * Allows sellers to create new products
 */

export default function CreateProductPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/dashboard/products">
            <ArrowLeft className="w-4 h-4 mr-2" />
            대시보드로 돌아가기
          </Link>
        </Button>

        <h1 className="text-4xl font-bold mb-2">새 상품 등록</h1>
        <p className="text-muted-foreground text-lg">
          AI 마켓플레이스에 상품을 등록하세요
        </p>
      </div>

      {/* Form */}
      <div className="max-w-4xl">
        <ProductForm mode="create" />
      </div>
    </div>
  );
}
