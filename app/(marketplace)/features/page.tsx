import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '기능 소개 - AI 마켓플레이스',
  description: '판매자와 구매자를 위한 강력한 기능을 확인하세요',
}

export default function FeaturesPage() {
  const features = [
    {
      category: '판매자를 위한',
      items: [
        {
          title: '간편한 상품 등록',
          description: '직관적인 인터페이스로 AI 자동화 템플릿을 업로드하고 관리하세요.',
          icon: '📝',
        },
        {
          title: '다단계 인증',
          description: '4단계 인증 시스템(0-3)을 통해 구매자와의 신뢰를 구축하세요.',
          icon: '✅',
        },
        {
          title: '자동 정산',
          description: '안전한 정산 시스템으로 자동으로 대금을 수령하세요.',
          icon: '💰',
        },
        {
          title: '분석 대시보드',
          description: '실시간으로 판매, 조회수, 성과 지표를 추적하세요.',
          icon: '📊',
        },
        {
          title: '고객 리뷰',
          description: '검증된 고객 리뷰와 평점을 통해 평판을 구축하세요.',
          icon: '⭐',
        },
      ],
    },
    {
      category: '구매자를 위한',
      items: [
        {
          title: '검증된 상품',
          description: '전문 검증자가 검토한 상품으로 안심하고 쇼핑하세요.',
          icon: '🔍',
        },
        {
          title: '즉시 다운로드',
          description: '구매한 템플릿과 자동화 도구에 즉시 접근하세요.',
          icon: '⚡',
        },
        {
          title: '안전한 결제',
          description: '업계 표준 결제 처리 시스템으로 안전하게 결제하세요.',
          icon: '🔒',
        },
        {
          title: '환불 보호',
          description: '기대에 미치지 못하는 상품에 대해 환불을 요청하세요.',
          icon: '↩️',
        },
        {
          title: '검색 및 필터',
          description: '고급 검색 및 필터링으로 필요한 것을 정확히 찾으세요.',
          icon: '🔎',
        },
      ],
    },
    {
      category: '검증자를 위한',
      items: [
        {
          title: '유연한 작업',
          description: '당신의 전문성과 일정에 맞는 검증 작업을 선택하세요.',
          icon: '⏰',
        },
        {
          title: '70% 수익',
          description: '전문 리뷰에 대한 검증 수수료의 70%를 획득하세요.',
          icon: '💵',
        },
        {
          title: '성과 추적',
          description: '검증 통계와 승인율을 모니터링하세요.',
          icon: '📈',
        },
        {
          title: '월간 지급',
          description: '완료된 검증에 대해 정기적인 월간 지급을 받으세요.',
          icon: '💳',
        },
      ],
    },
  ]

  const platformFeatures = [
    {
      title: 'N8N 템플릿',
      description: '워크플로우 자동화 템플릿의 광범위한 컬렉션',
      icon: '🔄',
    },
    {
      title: 'Make.com 시나리오',
      description: '사전 구축된 자동화 시나리오 및 통합',
      icon: '⚙️',
    },
    {
      title: 'Zapier 워크플로우',
      description: '즉시 사용 가능한 Zap 템플릿으로 즉각적인 자동화',
      icon: '⚡',
    },
    {
      title: '맞춤형 솔루션',
      description: '전문 크리에이터의 독특한 자동화 솔루션',
      icon: '🎨',
    },
  ]

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            모두를 위한 강력한 기능
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            AI 자동화 제품을 구매, 판매, 검증하는 데 필요한 모든 것
          </p>
          <Link
            href="/register"
            className="inline-block bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            무료로 시작하기
          </Link>
        </div>

        {/* Platform Categories */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">상품 카테고리</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {platformFeatures.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-lg p-6 text-center border-2 border-gray-200 hover:border-primary transition-colors"
              >
                <div className="text-4xl mb-3">{feature.icon}</div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Categories */}
        {features.map((section) => (
          <div key={section.category} className="mb-16">
            <h2 className="text-3xl font-bold mb-8">{section.category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {section.items.map((item) => (
                <div
                  key={item.title}
                  className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start">
                    <div className="text-3xl mr-4">{item.icon}</div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* CTA Section */}
        <div className="bg-primary text-white rounded-lg p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">시작할 준비가 되셨나요?</h2>
          <p className="text-xl mb-8 opacity-90">
            플랫폼에서 수천 명의 판매자, 구매자, 검증자와 함께하세요
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              지금 가입하기
            </Link>
            <Link
              href="/products"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              상품 둘러보기
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
