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
            검증 목록으로
          </Button>
        </Link>
        <Card>
          <CardContent className="py-6">
            <p className="text-center text-red-600">
              {error
                ? `검증 정보를 불러오는데 실패했습니다: ${(error as Error).message}`
                : '검증 정보를 찾을 수 없습니다'}
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
            검증 목록으로
          </Button>
        </Link>
        <VerificationBadge level={verification.level} />
      </div>

      <div>
        <h1 className="text-3xl font-bold">제품 검증</h1>
        <p className="text-gray-600 mt-2">
          {verification.product.name} 제품을 검증해 주세요
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Product Info */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>제품 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-gray-600">제품명</div>
                <div className="font-medium">{verification.product.name}</div>
              </div>

              <div>
                <div className="text-sm text-gray-600">검증 레벨</div>
                <div className="font-medium">{levelInfo.name}</div>
              </div>

              <div>
                <div className="text-sm text-gray-600">검증 수익</div>
                <div className="font-medium text-green-600">
                  ₩{verification.verifier_share.toLocaleString()}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 mb-2">
                  검증 항목
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
                    자동 검사 결과
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>파일 형식:</span>
                      <span
                        className={
                          verification.report.checks.fileFormat.passed
                            ? 'text-green-600'
                            : 'text-red-600'
                        }
                      >
                        {verification.report.checks.fileFormat.passed
                          ? '통과'
                          : '실패'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>바이러스 검사:</span>
                      <span
                        className={
                          verification.report.checks.virusScan.passed
                            ? 'text-green-600'
                            : 'text-red-600'
                        }
                      >
                        {verification.report.checks.virusScan.passed
                          ? '통과'
                          : '실패'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>메타데이터:</span>
                      <span
                        className={
                          verification.report.checks.metadata.passed
                            ? 'text-green-600'
                            : 'text-red-600'
                        }
                      >
                        {verification.report.checks.metadata.passed
                          ? '통과'
                          : '실패'}
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
