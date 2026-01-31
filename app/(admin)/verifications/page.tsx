'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminVerificationsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            대시보드로 돌아가기
          </Button>
        </Link>
      </div>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-indigo-600" />
          </div>
          <CardTitle className="text-2xl">검증 시스템 관리</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-4">
            이 기능은 현재 개발 중입니다.
          </p>
          <p className="text-sm text-gray-500">
            전문가 그룹 관리 및 검증 진행 모니터링 기능이 곧 추가됩니다.
          </p>
          <p className="text-xs text-indigo-600 mt-2">
            디자인·기획·개발·도메인 전문가
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
