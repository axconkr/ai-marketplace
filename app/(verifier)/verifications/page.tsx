'use client';

import { useState } from 'react';
import { Package, DollarSign, TrendingUp, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { VerificationCard } from '@/components/verification/VerificationCard';
import {
  useVerifications,
  useAssignedVerifications,
  useClaimVerification,
  useVerifierStats,
} from '@/hooks/use-verifications';

export default function VerifierDashboardPage() {
  const [activeTab, setActiveTab] = useState('available');

  // Fetch available verifications
  const {
    data: availableData,
    isLoading: availableLoading,
    error: availableError,
  } = useVerifications({ status: 'PENDING' });

  // Fetch assigned verifications
  const {
    data: assignedVerifications,
    isLoading: assignedLoading,
    error: assignedError,
  } = useAssignedVerifications();

  // Fetch verifier stats
  const {
    data: stats,
    isLoading: statsLoading,
  } = useVerifierStats();

  // Claim verification mutation
  const claimMutation = useClaimVerification();

  const handleClaim = async (id: string) => {
    try {
      await claimMutation.mutateAsync(id);
    } catch (error) {
      console.error('Failed to claim verification:', error);
    }
  };

  const inProgress =
    assignedVerifications?.filter(
      (v) => v.status === 'ASSIGNED' || v.status === 'IN_PROGRESS'
    ) || [];

  const completed =
    assignedVerifications?.filter(
      (v) =>
        v.status === 'COMPLETED' ||
        v.status === 'APPROVED' ||
        v.status === 'REJECTED'
    ) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">검증 대시보드</h1>
        <p className="text-gray-600 mt-2">
          제품을 검증하고 보상을 받으세요
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              전체 검증
            </CardTitle>
            <Package className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {stats?.totalVerifications || 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              총 수익
            </CardTitle>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold text-green-600">
                ₩{(stats?.totalEarnings || 0).toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              승인율
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {stats?.approvalRate?.toFixed(1) || 0}%
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              평균 점수
            </CardTitle>
            <Award className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {stats?.averageScore?.toFixed(1) || 0}%
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="available">
            대기중 ({availableData?.total || 0})
          </TabsTrigger>
          <TabsTrigger value="in-progress">
            진행중 ({inProgress.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            완료 ({completed.length})
          </TabsTrigger>
        </TabsList>

        {/* Available Verifications */}
        <TabsContent value="available" className="mt-6">
          {availableLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-32" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : availableError ? (
            <Card>
              <CardContent className="py-6">
                <p className="text-center text-red-600">
                  대기중인 검증을 불러오는데 실패했습니다
                </p>
              </CardContent>
            </Card>
          ) : !availableData?.verifications ||
            availableData.verifications.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    대기중인 검증이 없습니다
                  </h3>
                  <p className="text-gray-600">
                    나중에 새로운 검증 요청을 확인해 주세요
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {availableData.verifications.map((verification) => (
                <VerificationCard
                  key={verification.id}
                  verification={verification}
                  viewType="verifier"
                  onClaim={handleClaim}
                  isClaimPending={claimMutation.isPending}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* In Progress */}
        <TabsContent value="in-progress" className="mt-6">
          {assignedLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-32" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : inProgress.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    진행중인 검증이 없습니다
                  </h3>
                  <p className="text-gray-600">
                    대기중 탭에서 검증을 신청하세요
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {inProgress.map((verification) => (
                <VerificationCard
                  key={verification.id}
                  verification={verification}
                  viewType="verifier"
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Completed */}
        <TabsContent value="completed" className="mt-6">
          {assignedLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-32" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : completed.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    완료된 검증이 없습니다
                  </h3>
                  <p className="text-gray-600">
                    완료된 검증이 여기에 표시됩니다
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {completed.map((verification) => (
                <VerificationCard
                  key={verification.id}
                  verification={verification}
                  viewType="verifier"
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
