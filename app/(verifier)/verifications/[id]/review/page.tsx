'use client';

import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Calendar, User, Tag, CheckCircle2, XCircle, Info } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ReviewForm } from '@/components/verification/ReviewForm';
import { SourceCodeViewer } from '@/components/verification/SourceCodeViewer';
import { VerificationBadge } from '@/components/verification/VerificationBadge';
import { useVerification } from '@/hooks/use-verifications';
import { VERIFICATION_LEVELS } from '@/lib/types/verification';
import { cn } from '@/lib/utils';

interface PageProps {
  params: { id: string };
}

export default function VerificationReviewPage({ params }: PageProps) {
  const { id } = params;
  const router = useRouter();
  const { data: verification, isLoading, error } = useVerification(id);

  const handleSuccess = () => {
    router.push('/verifications');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 lg:grid-cols-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
        <Skeleton className="h-[400px]" />
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
          <CardContent className="py-12">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-600 text-lg font-medium">
                {error
                  ? `검증 정보를 불러오는데 실패했습니다`
                  : '검증 정보를 찾을 수 없습니다'}
              </p>
              {error && (
                <p className="text-gray-500 text-sm mt-2">{(error as Error).message}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const levelInfo = VERIFICATION_LEVELS[verification.level];
  const productFiles = verification.product.files || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/verifications">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            검증 목록으로
          </Button>
        </Link>
        <VerificationBadge level={verification.level} />
      </div>

      <div>
        <h1 className="text-3xl font-bold">제품 검증 리뷰</h1>
        <p className="text-gray-600 mt-2">
          <span className="font-medium text-gray-900">{verification.product.name}</span> 제품의 소스코드를 검토하고 기술 검증을 수행해주세요
        </p>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Tag className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">검증 레벨</p>
                <p className="font-semibold">{levelInfo.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-green-600 text-lg font-bold">₩</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">검증 수익 (70%)</p>
                <p className="font-semibold text-green-600">₩{verification.verifier_share.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">요청일</p>
                <p className="font-semibold">{new Date(verification.requested_at).toLocaleDateString('ko-KR')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <User className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">판매자</p>
                <p className="font-semibold">{verification.product.seller?.name || '알 수 없음'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Automated Checks */}
      {verification.report?.checks && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              자동 검사 결과
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              <AutoCheckResult label="파일 형식" check={verification.report.checks.fileFormat} />
              <AutoCheckResult label="바이러스 검사" check={verification.report.checks.virusScan} />
              <AutoCheckResult label="메타데이터" check={verification.report.checks.metadata} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Verification Items */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>검증 항목</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2">
            {levelInfo.features.map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-sm p-2 rounded-lg bg-gray-50">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Source Code Viewer */}
      <SourceCodeViewer files={productFiles} />

      {/* Review Form (includes Technical Checklist, Score, Approve/Reject, Comments) */}
      <div className="border-t-4 border-blue-500 pt-8">
        <h2 className="text-2xl font-bold mb-6">검증 리뷰 작성</h2>
        <ReviewForm verificationId={id} onSuccess={handleSuccess} />
      </div>
    </div>
  );
}

function AutoCheckResult({ label, check }: { label: string; check: { passed: boolean; message: string } }) {
  return (
    <div className={cn(
      'flex items-center gap-3 p-3 rounded-lg border',
      check.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
    )}>
      {check.passed ? (
        <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
      ) : (
        <XCircle className="h-5 w-5 text-red-600 shrink-0" />
      )}
      <div>
        <p className={cn('font-medium text-sm', check.passed ? 'text-green-700' : 'text-red-700')}>
          {label}
        </p>
        <p className="text-xs text-gray-500">{check.passed ? '통과' : '실패'}</p>
      </div>
    </div>
  );
}
