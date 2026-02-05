'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Mail, Phone, MessageCircle, Edit, Calendar, Shield, Lock, KeyRound } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=/profile')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const getRoleBadge = (role: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      admin: { label: '관리자', color: 'bg-red-100 text-red-800' },
      seller: { label: '판매자', color: 'bg-blue-100 text-blue-800' },
      service_provider: { label: '판매자', color: 'bg-blue-100 text-blue-800' },
      verifier: { label: '검증자', color: 'bg-green-100 text-green-800' },
      user: { label: '구매자', color: 'bg-gray-100 text-gray-800' },
    }
    return badges[role] || badges.user
  }

  const roleBadge = getRoleBadge(user.role)

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">내 프로필</h1>
          <p className="text-gray-600">계정 정보 및 설정</p>
        </div>
        <Button asChild>
          <Link href="/profile/edit">
            <Edit className="h-4 w-4 mr-2" />
            프로필 편집
          </Link>
        </Button>
      </div>

      <div className="space-y-6">
        {/* User Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              기본 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-semibold">{user.name || '이름 없음'}</h2>
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${roleBadge.color}`}>
                  {roleBadge.label}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">이메일</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>

              {user.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">전화번호</p>
                    <p className="font-medium">{user.phone}</p>
                  </div>
                </div>
              )}

              {user.kakao_id && (
                <div className="flex items-start gap-3">
                  <MessageCircle className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">카카오톡 ID</p>
                    <p className="font-medium">{user.kakao_id}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">가입일</p>
                  <p className="font-medium">
                    {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              보안 설정
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <KeyRound className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">비밀번호 변경</h3>
                  <p className="text-sm text-gray-600">
                    정기적으로 비밀번호를 변경하여 계정을 안전하게 보호하세요
                  </p>
                </div>
              </div>
              <Button asChild variant="outline">
                <Link href="/profile/password">
                  변경하기
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Features Grid - Admin은 제외 */}
        {user.role !== 'admin' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-xl font-semibold mb-2">대시보드</h3>
              <p className="text-gray-600 mb-4 text-sm">
                판매 분석, 수익 및 성과 지표를 확인하세요
              </p>
              <Link
                href="/dashboard"
                className="text-primary hover:underline font-medium text-sm"
              >
                대시보드로 이동 →
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-3xl mb-3">🛍️</div>
              <h3 className="text-xl font-semibold mb-2">내 상품</h3>
              <p className="text-gray-600 mb-4 text-sm">
                등록된 상품을 관리하고 새로운 상품을 만드세요
              </p>
              <Link
                href="/dashboard/products"
                className="text-primary hover:underline font-medium text-sm"
              >
                상품 보기 →
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-3xl mb-3">📦</div>
              <h3 className="text-xl font-semibold mb-2">주문</h3>
              <p className="text-gray-600 mb-4 text-sm">
                구매 내역을 추적하고 상품을 다운로드하세요
              </p>
              <Link
                href="/dashboard/orders"
                className="text-primary hover:underline font-medium text-sm"
              >
                주문 보기 →
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-3xl mb-3">⭐</div>
              <h3 className="text-xl font-semibold mb-2">검증</h3>
              <p className="text-gray-600 mb-4 text-sm">
                제품 검증을 요청하여 신뢰를 구축하고 판매를 늘리세요
              </p>
              <Link
                href="/dashboard/verification"
                className="text-primary hover:underline font-medium text-sm"
              >
                검증 받기 →
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-3xl mb-3">💰</div>
              <h3 className="text-xl font-semibold mb-2">수익</h3>
              <p className="text-gray-600 mb-4 text-sm">
                수익 내역 및 정산 보고서를 확인하세요
              </p>
              <Link
                href="/dashboard/earnings"
                className="text-primary hover:underline font-medium text-sm"
              >
                수익 보기 →
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-3xl mb-3">⚙️</div>
              <h3 className="text-xl font-semibold mb-2">설정</h3>
              <p className="text-gray-600 mb-4 text-sm">
                프로필, 결제 방법 및 환경설정을 업데이트하세요
              </p>
              <Link
                href="/dashboard/settings"
                className="text-primary hover:underline font-medium text-sm"
              >
                설정 관리 →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
