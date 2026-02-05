import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header, Footer } from '@/components/layout';
import {
  ArrowRight,
  Bot,
  Workflow,
  Code2,
  Shield,
  Zap,
  Users,
  TrendingUp,
  CheckCircle2,
  Star
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-20 sm:py-32">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl text-center">
              <Badge className="mb-4 px-4 py-1.5" variant="secondary">
                <Zap className="mr-1.5 h-3.5 w-3.5" />
                신뢰할 수 있는 AI 솔루션 마켓플레이스
              </Badge>
              <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                AI 자동화 솔루션을
                <br />
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  쉽고 안전하게
                </span>
              </h1>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground sm:text-xl">
                검증된 n8n 워크플로우, AI 에이전트, 바이브코딩 앱을 찾아보세요.
                <br />
                전문가가 검증한 솔루션으로 업무를 자동화하고 생산성을 높이세요.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Button asChild size="lg" className="group">
                  <Link href="/products">
                    제품 둘러보기
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/register">시작하기</Link>
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-8">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-primary">1,000+</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">검증된 제품</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-primary">500+</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">활성 판매자</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-primary">10,000+</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">다운로드</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-primary">4.8</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">평균 평점</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 sm:py-24">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
                어떤 솔루션을 찾고 계신가요?
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                다양한 카테고리에서 필요한 AI 자동화 솔루션을 찾아보세요
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Link href="/products?category=workflow" className="block">
                <Card className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary/50">
                  <CardHeader>
                    <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary">
                      <Workflow className="h-6 w-6" />
                    </div>
                    <CardTitle>n8n 워크플로우</CardTitle>
                    <CardDescription>
                      자동화된 비즈니스 프로세스와 통합 워크플로우 템플릿
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      인기 상승 중
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/products?category=agent" className="block">
                <Card className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary/50">
                  <CardHeader>
                    <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary">
                      <Bot className="h-6 w-6" />
                    </div>
                    <CardTitle>AI 에이전트</CardTitle>
                    <CardDescription>
                      지능형 작업 수행을 위한 AI 에이전트와 챗봇
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Star className="mr-2 h-4 w-4 fill-yellow-400 text-yellow-400" />
                      최고 평점
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/products?category=tool" className="block">
                <Card className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary/50">
                  <CardHeader>
                    <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary">
                      <Code2 className="h-6 w-6" />
                    </div>
                    <CardTitle>바이브코딩 앱</CardTitle>
                    <CardDescription>
                      즉시 사용 가능한 노코드/로우코드 애플리케이션
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Zap className="mr-2 h-4 w-4" />
                      빠른 배포
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-muted/50 py-16 sm:py-24">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
                왜 AI Marketplace인가요?
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                안전하고 신뢰할 수 있는 거래 환경을 제공합니다
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 rounded-full bg-primary/10 p-4 text-primary">
                  <Shield className="h-8 w-8" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">3단계 검증 시스템</h3>
                <p className="text-muted-foreground">
                  모든 제품은 엄격한 검증 과정을 거쳐 품질을 보장합니다
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="mb-4 rounded-full bg-primary/10 p-4 text-primary">
                  <Users className="h-8 w-8" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">전문가 커뮤니티</h3>
                <p className="text-muted-foreground">
                  검증된 판매자와 활발한 커뮤니티가 함께합니다
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="mb-4 rounded-full bg-primary/10 p-4 text-primary">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">구매 후 지원</h3>
                <p className="text-muted-foreground">
                  전문가로 구성된 집단에서 안정적이고 안전한 서비스를 받으세요
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-24">
          <div className="container mx-auto px-4">
            <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-background">
              <CardContent className="p-8 sm:p-12">
                <div className="mx-auto max-w-3xl text-center">
                  <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
                    지금 시작하세요
                  </h2>
                  <p className="mb-8 text-lg text-muted-foreground">
                    검증된 AI 솔루션으로 업무를 자동화하고,
                    <br className="hidden sm:block" />
                    직접 만든 솔루션을 판매하여 수익을 창출하세요
                  </p>
                  <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                    <Button asChild size="lg">
                      <Link href="/products">제품 탐색하기</Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                      <Link href="/register">판매자로 시작하기</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
