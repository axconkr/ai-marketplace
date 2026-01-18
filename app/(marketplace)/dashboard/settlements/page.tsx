'use client';

import { useState, useEffect } from 'react';
import { useRequireRole } from '@/lib/auth/middleware-helper';
import { UserRole } from '@/src/lib/auth/types';
import { SettlementSummary } from '@/components/settlements/SettlementSummary';
import { SettlementList } from '@/components/settlements/SettlementList';
import { SettlementDetailModal } from '@/components/settlements/SettlementDetailModal';
import { SettlementChart, OrderCountChart } from '@/components/settlements/SettlementChart';
import { RevenueBreakdownChart } from '@/components/settlements/RevenueBreakdownChart';
import { BankAccountCard, BankAccountWarning } from '@/components/settlements/BankAccountCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Download, HelpCircle, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Settlement } from '@prisma/client';

interface SettlementWithItems extends Settlement {
  items: any[];
}

interface SettlementWithDetails extends Settlement {
  items: any[];
  seller: any;
}

interface CurrentEstimate {
  totalSales: number;
  platformFee: number;
  netAmount: number;
  orderCount: number;
  verificationEarnings: number;
  verificationCount: number;
  currency: string;
  periodStart: Date;
  periodEnd: Date;
}

interface MonthlyData {
  month: string;
  totalAmount: number;
  platformFee: number;
  payoutAmount: number;
  verificationEarnings: number;
  orderCount: number;
}

interface RevenueBreakdown {
  productSales: number;
  verificationEarnings: number;
  totalRevenue: number;
}

/**
 * Seller Dashboard - Comprehensive Settlements Page
 * PROTECTED: Only SERVICE_PROVIDER and ADMIN can access
 */
export default function SellerSettlementsPage() {
  useRequireRole([UserRole.SERVICE_PROVIDER, UserRole.ADMIN]);

  const [settlements, setSettlements] = useState<SettlementWithItems[]>([]);
  const [currentEstimate, setCurrentEstimate] = useState<CurrentEstimate | null>(null);
  const [selectedSettlement, setSelectedSettlement] = useState<SettlementWithDetails | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [revenueBreakdown, setRevenueBreakdown] = useState<RevenueBreakdown | null>(null);
  const [bankInfo, setBankInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchSettlements(),
        fetchCurrentEstimate(),
        fetchMonthlyData(),
        fetchBankInfo(),
      ]);
    } catch (error) {
      console.error('Failed to fetch settlement data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettlements = async () => {
    try {
      const response = await fetch('/api/settlements', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      const data = await response.json();
      setSettlements(data.settlements || []);
    } catch (error) {
      console.error('Failed to fetch settlements:', error);
      setSettlements([]);
    }
  };

  const fetchCurrentEstimate = async () => {
    try {
      const response = await fetch('/api/settlements/current', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      const data = await response.json();
      setCurrentEstimate(data);
    } catch (error) {
      console.error('Failed to fetch current estimate:', error);
      setCurrentEstimate(null);
    }
  };

  const fetchMonthlyData = async () => {
    try {
      const response = await fetch('/api/settlements/summary', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      const data = await response.json();

      if (data.monthlyData) {
        setMonthlyData(data.monthlyData);
      }

      if (data.revenueBreakdown) {
        setRevenueBreakdown(data.revenueBreakdown);
      }
    } catch (error) {
      console.error('Failed to fetch monthly data:', error);
      setMonthlyData([]);
      setRevenueBreakdown(null);
    }
  };

  const fetchBankInfo = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      const data = await response.json();
      setBankInfo({
        bank_name: data.bank_name,
        bank_account: data.bank_account,
        account_holder: data.account_holder,
        bank_verified: data.bank_verified,
      });
    } catch (error) {
      console.error('Failed to fetch bank info:', error);
      setBankInfo(null);
    }
  };

  const handleViewDetails = async (settlementId: string) => {
    try {
      const response = await fetch(`/api/settlements/${settlementId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      const data = await response.json();
      setSelectedSettlement(data);
      setDetailModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch settlement details:', error);
    }
  };

  const handleDownloadStatement = async (settlementId: string) => {
    try {
      const response = await fetch(`/api/settlements/${settlementId}/statement`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to download statement');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `settlement-${settlementId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download statement:', error);
      alert('정산 명세서 다운로드에 실패했습니다.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">정산 관리</h1>
        <p className="text-gray-600">
          판매 수익과 정산 내역을 관리하고 확인하세요
        </p>
      </div>

      {/* Bank Account Warning */}
      <BankAccountWarning bankInfo={bankInfo} />

      {/* Current Period Summary */}
      <div className="mb-8">
        <SettlementSummary estimate={currentEstimate} loading={loading} />
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="settlements" className="space-y-6">
        <TabsList>
          <TabsTrigger value="settlements" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            정산 내역
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            분석
          </TabsTrigger>
        </TabsList>

        {/* Settlements List Tab */}
        <TabsContent value="settlements" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">과거 정산 내역</h2>
            <p className="text-sm text-gray-600">
              총 {settlements.length}건의 정산
            </p>
          </div>

          <SettlementList
            settlements={settlements}
            loading={loading}
            onViewDetails={handleViewDetails}
            onDownloadStatement={handleDownloadStatement}
          />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Monthly Trend Chart */}
            <div className="lg:col-span-2">
              <SettlementChart data={monthlyData} loading={loading} />
            </div>

            {/* Revenue Breakdown */}
            {revenueBreakdown && <RevenueBreakdownChart data={revenueBreakdown} loading={loading} />}

            {/* Order Count Chart */}
            <OrderCountChart data={monthlyData} loading={loading} />

            {/* Bank Account Info */}
            <div className="lg:col-span-2">
              <BankAccountCard bankInfo={bankInfo} loading={loading} />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Help Section */}
      <Card className="mt-8 bg-gradient-to-br from-blue-50 to-purple-50 border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <HelpCircle className="h-5 w-5" />
            정산 안내
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">정산 일정</h4>
              <p className="text-sm text-gray-700">
                매월 1일에 전월 매출에 대한 정산이 자동으로 처리됩니다. 정산금은
                등록된 계좌로 영업일 기준 3-5일 내에 입금됩니다.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">플랫폼 수수료</h4>
              <p className="text-sm text-gray-700">
                기본 수수료율은 15%이며, 판매 실적에 따라 조정될 수 있습니다.
                현재 적용 수수료율은 계정 설정에서 확인하실 수 있습니다.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">검증 수익</h4>
              <p className="text-sm text-gray-700">
                검증 전문가로 활동하여 얻은 수익도 함께 정산됩니다. 검증 수익은
                플랫폼 수수료 없이 100% 지급됩니다.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">문의하기</h4>
              <p className="text-sm text-gray-700 mb-2">
                정산 관련 문의사항이 있으시면 언제든지 연락 주세요.
              </p>
              <Link href="/support" className="text-blue-600 hover:underline text-sm font-medium">
                고객지원 문의 →
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settlement Detail Modal */}
      <SettlementDetailModal
        settlement={selectedSettlement}
        open={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedSettlement(null);
        }}
        onDownloadStatement={handleDownloadStatement}
      />
    </div>
  );
}
