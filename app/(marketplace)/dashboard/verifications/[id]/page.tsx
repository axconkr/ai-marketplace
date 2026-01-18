'use client';

import { use } from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { VerificationStatus } from '@/components/verification/VerificationStatus';
import { VerificationReport } from '@/components/verification/VerificationReport';
import { VerificationBadge } from '@/components/verification/VerificationBadge';
import { useVerification } from '@/hooks/use-verifications';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function VerificationDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { data: verification, isLoading, error } = useVerification(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-48" />
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !verification) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard/verifications">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Verifications
          </Button>
        </Link>
        <Card>
          <CardContent className="py-6">
            <p className="text-center text-red-600">
              {error
                ? `Failed to load verification: ${(error as Error).message}`
                : 'Verification not found'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/verifications">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Verifications
          </Button>
        </Link>
        <VerificationBadge level={verification.level} score={verification.score} />
      </div>

      <div>
        <h1 className="text-3xl font-bold">{verification.product.name}</h1>
        <p className="text-gray-600 mt-2">Verification Details</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <VerificationStatus verification={verification} />
        </div>

        <div className="lg:col-span-2">
          <VerificationReport verification={verification} />
        </div>
      </div>
    </div>
  );
}
