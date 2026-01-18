import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '고객 지원 센터 - AI Marketplace',
  description: '도움을 받고 자주 묻는 질문에 대한 답변을 찾으세요',
}

export default function HelpPage() {
  const faqs = [
    {
      category: '시작하기',
      questions: [
        {
          q: '계정은 어떻게 만드나요?',
          a: '오른쪽 상단의 "회원가입" 버튼을 클릭하고 등록 절차를 따라하세요. 구매자, 판매자 또는 검증자로 가입할 수 있습니다.',
        },
        {
          q: '어떤 종류의 제품을 판매할 수 있나요?',
          a: 'N8N 워크플로우, Make.com 시나리오, Zapier 자동화 및 맞춤형 AI 자동화 솔루션을 판매할 수 있습니다.',
        },
      ],
    },
    {
      category: '판매자 안내',
      questions: [
        {
          q: '플랫폼 수수료는 얼마인가요?',
          a: '일반 판매자는 15% 플랫폼 수수료를 지불합니다. 검증된 판매자(레벨 2 이상)는 12%만 지불합니다.',
        },
        {
          q: '검증은 어떻게 받나요?',
          a: '제품에 대한 검증을 요청하세요. 전문 검증자가 작업을 검토하고 검증 레벨(0-3)을 지정합니다.',
        },
        {
          q: '언제 대금을 받나요?',
          a: '대금은 월별 정산 주기로 처리됩니다. 정산 기간 종료 후 영업일 기준 5일 이내에 수익을 받게 됩니다.',
        },
      ],
    },
    {
      category: '구매자 안내',
      questions: [
        {
          q: '제품은 어떻게 구매하나요?',
          a: '제품을 둘러보고 원하는 제품에서 "지금 구매"를 클릭한 다음 선호하는 결제 방법으로 결제 프로세스를 완료하세요.',
        },
        {
          q: '어떤 결제 방법을 사용할 수 있나요?',
          a: '안전한 결제 프로세서를 통해 모든 주요 신용카드, 직불카드 및 기타 결제 방법을 사용할 수 있습니다.',
        },
        {
          q: '환불받을 수 있나요?',
          a: '네, 제품이 설명과 일치하지 않거나 기술적 문제가 있는 경우 구매 후 14일 이내에 환불을 요청할 수 있습니다.',
        },
      ],
    },
    {
      category: '검증자 안내',
      questions: [
        {
          q: '검증자가 되려면 어떻게 해야 하나요?',
          a: '계정 설정에서 신청하세요. AI 자동화에 대한 전문성을 입증하고 검증자 자격 프로세스를 통과해야 합니다.',
        },
        {
          q: '얼마나 벌 수 있나요?',
          a: '검증자는 검증 수수료의 70%를 받습니다. 레벨 1: $7, 레벨 2: $35, 레벨 3: $140 (검증당)',
        },
      ],
    },
  ]

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">고객 지원 센터</h1>
          <p className="text-xl text-gray-600">
            자주 묻는 질문에 대한 답변을 찾으세요
          </p>
        </div>

        {/* Contact Support */}
        <div className="bg-primary text-white rounded-lg p-8 mb-12 text-center">
          <h2 className="text-2xl font-bold mb-4">더 많은 도움이 필요하신가요?</h2>
          <p className="mb-6 opacity-90">
            찾으시는 내용을 찾을 수 없나요? 고객 지원팀이 도와드리겠습니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@aimarketplace.com"
              className="bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              이메일 문의
            </a>
            <Link
              href="/docs"
              className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              문서 보기
            </Link>
          </div>
        </div>

        {/* FAQs */}
        {faqs.map((section) => (
          <div key={section.category} className="mb-12">
            <h2 className="text-3xl font-bold mb-6">{section.category}</h2>
            <div className="space-y-6">
              {section.questions.map((item, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-semibold mb-3">{item.q}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Additional Resources */}
        <div className="bg-gray-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6">추가 자료</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/features"
              className="p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold mb-2">플랫폼 기능</h3>
              <p className="text-sm text-gray-600">
                플랫폼에서 사용 가능한 모든 기능에 대해 알아보세요
              </p>
            </Link>
            <Link
              href="/pricing"
              className="p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold mb-2">가격 정보</h3>
              <p className="text-sm text-gray-600">
                가격 구조와 수수료를 확인하세요
              </p>
            </Link>
            <Link
              href="/about"
              className="p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold mb-2">회사 소개</h3>
              <p className="text-sm text-gray-600">
                우리의 사명과 가치에 대해 자세히 알아보세요
              </p>
            </Link>
            <Link
              href="/terms"
              className="p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold mb-2">이용약관</h3>
              <p className="text-sm text-gray-600">
                이용 약관 및 조건을 확인하세요
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
