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
        <h1 className="text-3xl font-bold">Verifier Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Review products and earn rewards
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Reviews
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
              Total Earnings
            </CardTitle>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold text-green-600">
                ${((stats?.totalEarnings || 0) / 100).toFixed(2)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Approval Rate
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
              Avg Score
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
            Available ({availableData?.total || 0})
          </TabsTrigger>
          <TabsTrigger value="in-progress">
            In Progress ({inProgress.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completed.length})
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
                  Failed to load available verifications
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
                    No available verifications
                  </h3>
                  <p className="text-gray-600">
                    Check back later for new verification requests
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
                    No verifications in progress
                  </h3>
                  <p className="text-gray-600">
                    Claim a verification from the Available tab to get started
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
                    No completed verifications
                  </h3>
                  <p className="text-gray-600">
                    Completed verifications will appear here
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
