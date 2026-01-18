import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { SubscriptionManager } from '@/components/subscriptions';
import { cookies } from 'next/headers';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: '구독 관리 | AI Marketplace',
  description: '구독 플랜 관리, 결제 정보, 사용 현황을 확인하세요',
};

async function getCurrentUser() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return null;
    }

    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Cookie: `token=${token}` },
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

export default async function SubscriptionDashboardPage({
  searchParams,
}: {
  searchParams: { success?: string };
}) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/login?redirect=/dashboard/subscription');
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">구독 관리</h1>
        <p className="text-lg text-gray-600">
          구독 플랜 및 결제 정보를 관리하세요
        </p>
      </div>

      {/* Success Message */}
      {searchParams.success === 'true' && (
        <Card className="mb-6 bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-900">
                  구독이 성공적으로 시작되었습니다!
                </h3>
                <p className="text-sm text-green-800 mt-1">
                  구독 플랜이 활성화되었습니다. 이제 모든 혜택을 이용하실 수 있습니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <SubscriptionManager userId={currentUser.id} />

      {/* Quick Links */}
      <div className="mt-8 flex gap-4">
        <Link href="/pricing">
          <Button variant="outline">플랜 변경하기</Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="outline">대시보드로</Button>
        </Link>
      </div>
    </div>
  );
}
