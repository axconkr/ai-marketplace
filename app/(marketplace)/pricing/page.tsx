import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '가격 안내 - AI 마켓플레이스',
  description: '판매자를 위한 간단하고 투명한 가격 정책',
}

export default function PricingPage() {
  const pricingPlans = [
    {
      name: '판매자',
      price: '15%',
      description: '판매당 플랫폼 수수료',
      features: [
        '무제한 상품 등록',
        '모든 상품 카테고리 접근',
        '기본 분석 대시보드',
        '고객 지원',
        '안전한 결제 처리',
      ],
    },
    {
      name: '인증 판매자',
      price: '12%',
      description: '레벨 2+ 인증 시 플랫폼 수수료',
      features: [
        '모든 판매자 기능',
        '할인된 플랫폼 수수료 (12%)',
        '프리미엄 등록 배지',
        '우선 고객 지원',
        '고급 분석 기능',
        '마케팅 도구',
      ],
      highlighted: true,
    },
    {
      name: '검증자',
      price: '70%',
      description: '검증 작업으로 수익 창출',
      features: [
        '검증 수수료의 70% 획득',
        '유연한 작업 일정',
        '다단계 검증 레벨',
        '성과 대시보드',
        '월간 지급',
      ],
    },
  ]

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            간단하고 투명한 가격 정책
          </h1>
          <p className="text-xl text-gray-600">
            당신에게 가장 적합한 플랜을 선택하세요
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-lg p-8 ${
                plan.highlighted
                  ? 'bg-primary text-white shadow-xl scale-105'
                  : 'bg-white border-2 border-gray-200'
              }`}
            >
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.name !== '검증자' && (
                  <span className={plan.highlighted ? 'text-white/80' : 'text-gray-600'}>
                    {' '}수수료
                  </span>
                )}
              </div>
              <p
                className={`mb-6 ${
                  plan.highlighted ? 'text-white/90' : 'text-gray-600'
                }`}
              >
                {plan.description}
              </p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <svg
                      className={`w-5 h-5 mr-2 mt-0.5 ${
                        plan.highlighted ? 'text-white' : 'text-primary'
                      }`}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className={plan.highlighted ? 'text-white/90' : ''}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition-colors ${
                  plan.highlighted
                    ? 'bg-white text-primary hover:bg-gray-100'
                    : 'bg-primary text-white hover:bg-primary/90'
                }`}
              >
                시작하기
              </Link>
            </div>
          ))}
        </div>

        {/* Verification Pricing */}
        <div className="bg-gray-50 rounded-lg p-8">
          <h2 className="text-3xl font-bold mb-6 text-center">
            검증 가격
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { level: 0, price: '무료', description: '자동 검증' },
              { level: 1, price: '$10', description: '기본 수동 검수' },
              { level: 2, price: '$50', description: '표준 리뷰' },
              { level: 3, price: '$200', description: '종합 감사' },
            ].map((tier) => (
              <div key={tier.level} className="bg-white rounded-lg p-6 text-center">
                <div className="text-sm text-gray-600 mb-2">레벨 {tier.level}</div>
                <div className="text-2xl font-bold mb-2">{tier.price}</div>
                <div className="text-sm text-gray-600">{tier.description}</div>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-600 mt-6">
            * 검증자는 검증 수수료의 70%를 획득합니다 (레벨 1-3)
          </p>
        </div>
      </div>
    </div>
  )
}
