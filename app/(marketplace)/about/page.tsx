import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '회사 소개 - AI Marketplace',
  description: 'AI 자동화 민주화를 위한 우리의 사명을 알아보세요',
}

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-8">AI Marketplace 소개</h1>

        <div className="prose prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">우리의 사명</h2>
            <p className="text-gray-700 leading-relaxed">
              AI Marketplace는 강력한 자동화 솔루션이 필요한 사용자와 크리에이터를 연결하여
              AI 자동화를 민주화하는 데 전념하고 있습니다. 우리는 모든 사람이 고품질의 검증된
              AI 자동화 도구에 접근할 수 있어야 한다고 믿습니다.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">우리가 하는 일</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              우리는 다음과 같은 신뢰할 수 있는 플랫폼을 제공합니다:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>크리에이터가 N8N, Make.com, Zapier 템플릿을 판매할 수 있습니다</li>
              <li>구매자가 검증된 고품질 자동화 솔루션을 찾을 수 있습니다</li>
              <li>전문 검증자가 제품 품질과 진정성을 보장합니다</li>
              <li>모든 거래가 안전하고 투명합니다</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">우리의 가치</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-2">🎯 품질 우선</h3>
                <p className="text-gray-600">
                  모든 제품은 엄격한 검증 프로세스를 거칩니다
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-2">🤝 신뢰</h3>
                <p className="text-gray-600">
                  구매자, 판매자, 검증자 간의 신뢰 구축
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-2">💡 혁신</h3>
                <p className="text-gray-600">
                  플랫폼과 프로세스를 지속적으로 개선
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-2">🌍 커뮤니티</h3>
                <p className="text-gray-600">
                  자동화 애호가들의 지원 커뮤니티 육성
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">함께 하세요</h2>
            <p className="text-gray-700 leading-relaxed">
              자동화 전문 지식을 수익화하려는 크리에이터, 완벽한 솔루션을 찾는 구매자,
              검증자로 기여하고 싶은 전문가 등 누구든 우리 커뮤니티에서 여러분의 자리가 있습니다.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
