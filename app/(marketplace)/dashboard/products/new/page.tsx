'use client';

import { ProductFormEnhanced } from '@/components/products/product-form-enhanced';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRequireRole } from '@/lib/auth/middleware-helper';
import { UserRole } from '@/src/lib/auth/types';

/**
 * Dashboard - Create Product Page
 * Allows sellers to create new products from dashboard
 * PROTECTED: Only SERVICE_PROVIDER and ADMIN can access
 *
 * Features:
 * - Step-by-step product registration wizard
 * - Real-time validation with Korean error messages
 * - File upload with drag & drop
 * - Markdown editor for descriptions
 * - Live preview
 * - Save as draft functionality
 */

export default function DashboardCreateProductPage() {
  // Require service provider or admin role
  useRequireRole([UserRole.SERVICE_PROVIDER, UserRole.ADMIN]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/dashboard/products">
            <ArrowLeft className="w-4 h-4 mr-2" />
            상품 관리로 돌아가기
          </Link>
        </Button>

        <div className="space-y-2">
          <h1 className="text-4xl font-bold">새 상품 등록</h1>
          <p className="text-muted-foreground text-lg">
            AI 마켓플레이스에 상품을 등록하고 수익을 창출하세요
          </p>
        </div>
      </div>

      {/* Enhanced Form */}
      <div className="max-w-5xl mx-auto">
        <ProductFormEnhanced mode="create" />
      </div>
    </div>
  );
}
