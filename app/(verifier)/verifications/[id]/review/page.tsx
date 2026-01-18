'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ReviewForm } from '@/components/verification/ReviewForm';
import { VerificationBadge } from '@/components/verification/VerificationBadge';
import { useVerification } from '@/hooks/use-verifications';
import { VERIFICATION_LEVELS } from '@/lib/types/verification';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function VerificationReviewPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: verification, isLoading, error } = useVerification(id);

  const handleSuccess = () => {
    router.push('/verifications');
  };

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
        <Link href="/verifications">
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

  const levelInfo = VERIFICATION_LEVELS[verification.level];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/verifications">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Verifications
          </Button>
        </Link>
        <VerificationBadge level={verification.level} />
      </div>

      <div>
        <h1 className="text-3xl font-bold">Review Product</h1>
        <p className="text-gray-600 mt-2">
          Provide detailed feedback for {verification.product.name}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Product Info */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-gray-600">Product Name</div>
                <div className="font-medium">{verification.product.name}</div>
              </div>

              <div>
                <div className="text-sm text-gray-600">Verification Level</div>
                <div className="font-medium">{levelInfo.name}</div>
              </div>

              <div>
                <div className="text-sm text-gray-600">Your Earnings</div>
                <div className="font-medium text-green-600">
                  ${(verification.verifier_share / 100).toFixed(2)}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 mb-2">
                  Requirements
                </div>
                <ul className="space-y-1 text-sm">
                  {levelInfo.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {verification.report?.checks && (
                <div>
                  <div className="text-sm text-gray-600 mb-2">
                    Automated Checks
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>File Format:</span>
                      <span
                        className={
                          verification.report.checks.fileFormat.passed
                            ? 'text-green-600'
                            : 'text-red-600'
                        }
                      >
                        {verification.report.checks.fileFormat.passed
                          ? 'Passed'
                          : 'Failed'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Virus Scan:</span>
                      <span
                        className={
                          verification.report.checks.virusScan.passed
                            ? 'text-green-600'
                            : 'text-red-600'
                        }
                      >
                        {verification.report.checks.virusScan.passed
                          ? 'Passed'
                          : 'Failed'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Metadata:</span>
                      <span
                        className={
                          verification.report.checks.metadata.passed
                            ? 'text-green-600'
                            : 'text-red-600'
                        }
                      >
                        {verification.report.checks.metadata.passed
                          ? 'Passed'
                          : 'Failed'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Review Form */}
        <div className="lg:col-span-2">
          <ReviewForm verificationId={id} onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  );
}
