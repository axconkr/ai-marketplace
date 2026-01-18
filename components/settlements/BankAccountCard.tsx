'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, CheckCircle2, AlertCircle, Edit } from 'lucide-react';
import Link from 'next/link';

interface BankAccountInfo {
  bank_name: string | null;
  bank_account: string | null;
  account_holder: string | null;
  bank_verified: boolean;
}

interface BankAccountCardProps {
  bankInfo: BankAccountInfo | null;
  loading?: boolean;
}

export function BankAccountCard({ bankInfo, loading }: BankAccountCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            정산 계좌 정보
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasAccount =
    bankInfo?.bank_name && bankInfo?.bank_account && bankInfo?.account_holder;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            정산 계좌 정보
          </CardTitle>
          <Link href="/dashboard/settings/bank-account">
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-1" />
              {hasAccount ? '수정' : '등록'}
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {hasAccount ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm text-gray-600">은행명</span>
              <span className="font-medium">{bankInfo.bank_name}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm text-gray-600">계좌번호</span>
              <span className="font-medium font-mono">{bankInfo.bank_account}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm text-gray-600">예금주</span>
              <span className="font-medium">{bankInfo.account_holder}</span>
            </div>
            <div className="pt-2">
              {bankInfo.bank_verified ? (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  인증 완료
                </Badge>
              ) : (
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  인증 필요
                </Badge>
              )}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">계좌 정보 미등록</h3>
            <p className="text-sm text-gray-600 mb-4">
              정산금을 받으려면 계좌를 등록해야 합니다.
            </p>
            <Link href="/dashboard/settings/bank-account">
              <Button>
                <Building2 className="h-4 w-4 mr-2" />
                계좌 등록하기
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface BankAccountWarningProps {
  bankInfo: BankAccountInfo | null;
}

export function BankAccountWarning({ bankInfo }: BankAccountWarningProps) {
  const hasAccount =
    bankInfo?.bank_name && bankInfo?.bank_account && bankInfo?.account_holder;

  if (hasAccount && bankInfo.bank_verified) {
    return null;
  }

  return (
    <div
      className={`rounded-lg p-4 mb-6 border ${
        hasAccount
          ? 'bg-yellow-50 border-yellow-200'
          : 'bg-red-50 border-red-200'
      }`}
    >
      <div className="flex items-start gap-3">
        <AlertCircle
          className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
            hasAccount ? 'text-yellow-600' : 'text-red-600'
          }`}
        />
        <div className="flex-1">
          <h3
            className={`font-semibold mb-1 ${
              hasAccount ? 'text-yellow-900' : 'text-red-900'
            }`}
          >
            {hasAccount ? '계좌 인증이 필요합니다' : '계좌 등록이 필요합니다'}
          </h3>
          <p
            className={`text-sm mb-3 ${
              hasAccount ? 'text-yellow-700' : 'text-red-700'
            }`}
          >
            {hasAccount
              ? '정산금을 안전하게 받으려면 계좌 인증을 완료해주세요.'
              : '정산금을 받으려면 계좌를 먼저 등록해야 합니다.'}
          </p>
          <Link href="/dashboard/settings/bank-account">
            <Button size="sm" variant={hasAccount ? 'outline' : 'default'}>
              {hasAccount ? '계좌 인증하기' : '계좌 등록하기'}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
