import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../.env.local') });

import { PrismaClient, UserRole, SellerTier, ProductCategory, PricingModel, ProductStatus, OrderStatus, VerificationStatus, Currency, PaymentProvider } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data (development only)
  await prisma.reviewVote.deleteMany();
  await prisma.review.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.verifierPayout.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.settlementItem.deleteMany();
  await prisma.settlement.deleteMany();
  await prisma.refund.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.file.deleteMany();
  await prisma.product.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Cleared existing data');

  // ============================================================================
  // USERS
  // ============================================================================

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@aimarket.com',
      password: hashedPassword,
      name: 'Admin User',
      role: UserRole.admin,
      email_verified: true,
      bio: 'AI Marketplace 관리자',
    },
  });

  // Sellers
  const seller1 = await prisma.user.create({
    data: {
      email: 'seller1@example.com',
      password: hashedPassword,
      name: '김개발',
      role: UserRole.seller,
      seller_tier: SellerTier.master,
      email_verified: true,
      bio: 'n8n 워크플로우 전문가 | 5년 경력',
      portfolio: {
        github: 'https://github.com/seller1',
        portfolio: 'https://portfolio.seller1.com',
      },
    },
  });

  const seller2 = await prisma.user.create({
    data: {
      email: 'seller2@example.com',
      password: hashedPassword,
      name: '이자동',
      role: UserRole.seller,
      seller_tier: SellerTier.pro,
      email_verified: true,
      bio: 'AI Agent 개발자 | LangChain 전문',
      portfolio: {
        github: 'https://github.com/seller2',
        linkedin: 'https://linkedin.com/in/seller2',
      },
    },
  });

  const seller3 = await prisma.user.create({
    data: {
      email: 'seller3@example.com',
      password: hashedPassword,
      name: '박바이브',
      role: UserRole.seller,
      seller_tier: SellerTier.verified,
      email_verified: true,
      bio: '바이브코딩으로 앱 제작 | 초보 개발자',
    },
  });

  const seller4 = await prisma.user.create({
    data: {
      email: 'seller4@example.com',
      password: hashedPassword,
      name: '최신규',
      role: UserRole.seller,
      seller_tier: SellerTier.new,
      email_verified: true,
      bio: '이제 막 시작한 판매자입니다',
    },
  });

  // Buyers
  const buyer1 = await prisma.user.create({
    data: {
      email: 'buyer1@example.com',
      password: hashedPassword,
      name: '정구매',
      role: UserRole.buyer,
      email_verified: true,
      bio: '스타트업 대표 | 업무 자동화 관심',
    },
  });

  const buyer2 = await prisma.user.create({
    data: {
      email: 'buyer2@example.com',
      password: hashedPassword,
      name: '홍마케팅',
      role: UserRole.buyer,
      email_verified: true,
      bio: '마케팅 담당자 | 자동화 솔루션 찾는 중',
    },
  });

  // Verifiers
  const verifier1 = await prisma.user.create({
    data: {
      email: 'verifier1@example.com',
      password: hashedPassword,
      name: '안검증',
      role: UserRole.verifier,
      email_verified: true,
      bio: '시니어 개발자 | 코드 리뷰 전문',
      portfolio: {
        certifications: ['AWS Certified', 'Google Cloud Professional'],
        experience: '10+ years',
      },
    },
  });

  const verifier2 = await prisma.user.create({
    data: {
      email: 'verifier2@example.com',
      password: hashedPassword,
      name: '강보안',
      role: UserRole.verifier,
      email_verified: true,
      bio: '보안 전문가 | 취약점 분석',
      portfolio: {
        certifications: ['CISSP', 'CEH'],
      },
    },
  });

  console.log('✅ Created users');

  // ============================================================================
  // PRODUCTS
  // ============================================================================

  const product1 = await prisma.product.create({
    data: {
      seller_id: seller1.id,
      title: '이메일 자동 분류 및 응답 워크플로우',
      description: `Gmail에서 받은 이메일을 AI로 자동 분류하고, 카테고리별로 자동 응답을 보내는 n8n 워크플로우입니다.

**주요 기능:**
- Gmail 이메일 자동 수신
- OpenAI GPT-4로 카테고리 분류
- 템플릿 기반 자동 응답
- Slack 알림 발송
- Google Sheets 로그 기록

**설치 방법:**
1. n8n 설치 (Docker 권장)
2. JSON 파일 import
3. Gmail, OpenAI, Slack Credential 설정
4. 워크플로우 활성화`,
      category: ProductCategory.n8n,
      tags: ['email', 'automation', 'gmail', 'ai', 'classification'],
      pricing_model: PricingModel.one_time,
      price: 29.99,
      currency: Currency.USD,
      verification_level: 3,
      status: ProductStatus.active,
      file_url: 'https://storage.example.com/products/email-workflow.json',
      demo_url: 'https://youtube.com/demo-email-workflow',
      view_count: 1234,
      download_count: 89,
      rating_avg: 4.8,
      review_count: 12,
      published_at: new Date('2024-01-15'),
    },
  });

  const product2 = await prisma.product.create({
    data: {
      seller_id: seller1.id,
      title: 'Slack 메시지 요약 AI Agent',
      description: `Slack 채널의 메시지를 실시간으로 모니터링하고 AI로 요약해주는 에이전트입니다.

**주요 기능:**
- 실시간 Slack 메시지 수집
- GPT-4 기반 요약
- 중요 메시지 자동 하이라이트
- 일일/주간 리포트 생성

**기술 스택:**
- LangChain
- OpenAI GPT-4
- Slack API
- Python 3.11`,
      category: ProductCategory.ai_agent,
      tags: ['slack', 'ai', 'summary', 'langchain', 'gpt4'],
      pricing_model: PricingModel.subscription,
      price: 19.99,
      currency: Currency.USD,
      verification_level: 2,
      status: ProductStatus.active,
      file_url: 'https://storage.example.com/products/slack-agent.zip',
      demo_url: 'https://demo.slack-agent.com',
      view_count: 567,
      download_count: 34,
      rating_avg: 4.5,
      review_count: 8,
      published_at: new Date('2024-02-01'),
    },
  });

  const product3 = await prisma.product.create({
    data: {
      seller_id: seller2.id,
      title: 'Customer Support Chatbot (RAG)',
      description: `회사 문서를 학습하여 고객 문의에 자동 응답하는 RAG 기반 챗봇입니다.

**주요 기능:**
- 문서 자동 임베딩 (PDF, DOCX, TXT)
- Vector DB 기반 검색 (Pinecone)
- 컨텍스트 기반 답변 생성
- 웹 위젯 제공

**기술 스택:**
- LangChain
- OpenAI Embeddings
- Pinecone Vector DB
- FastAPI
- React (웹 위젯)`,
      category: ProductCategory.ai_agent,
      tags: ['chatbot', 'rag', 'customer-support', 'langchain', 'vector-db'],
      pricing_model: PricingModel.license,
      price: 299.00,
      currency: Currency.USD,
      verification_level: 3,
      status: ProductStatus.active,
      file_url: 'https://storage.example.com/products/chatbot-rag.zip',
      demo_url: 'https://demo.chatbot-rag.com',
      view_count: 2345,
      download_count: 45,
      rating_avg: 4.9,
      review_count: 15,
      published_at: new Date('2024-01-20'),
    },
  });

  const product4 = await prisma.product.create({
    data: {
      seller_id: seller2.id,
      title: '소셜 미디어 자동 포스팅 도구',
      description: `블로그 글을 Twitter, Facebook, LinkedIn에 자동으로 배포하는 도구입니다.

**주요 기능:**
- RSS 피드 모니터링
- AI 기반 소셜 미디어 최적화
- 예약 포스팅
- 성과 분석 대시보드

**지원 플랫폼:**
- Twitter/X
- Facebook
- LinkedIn
- Instagram (예정)`,
      category: ProductCategory.app,
      tags: ['social-media', 'automation', 'marketing', 'rss'],
      pricing_model: PricingModel.subscription,
      price: 49.99,
      currency: Currency.USD,
      verification_level: 1,
      status: ProductStatus.active,
      file_url: 'https://storage.example.com/products/social-poster.zip',
      view_count: 890,
      download_count: 23,
      rating_avg: 4.2,
      review_count: 5,
      published_at: new Date('2024-03-01'),
    },
  });

  const product5 = await prisma.product.create({
    data: {
      seller_id: seller3.id,
      title: '간단한 To-Do 앱 (바이브코딩)',
      description: `Next.js + Supabase로 만든 간단한 할일 관리 앱입니다.

**주요 기능:**
- 할일 추가/수정/삭제
- 완료 체크
- 카테고리 분류
- 반응형 디자인

**기술 스택:**
- Next.js 14
- Supabase
- Tailwind CSS
- TypeScript`,
      category: ProductCategory.app,
      tags: ['todo', 'nextjs', 'supabase', 'beginner'],
      pricing_model: PricingModel.one_time,
      price: 9.99,
      currency: Currency.USD,
      verification_level: 0,
      status: ProductStatus.active,
      file_url: 'https://storage.example.com/products/todo-app.zip',
      view_count: 456,
      download_count: 12,
      rating_avg: 3.8,
      review_count: 3,
      published_at: new Date('2024-03-15'),
    },
  });

  const product6 = await prisma.product.create({
    data: {
      seller_id: seller4.id,
      title: 'Make 시나리오 - CRM 자동화',
      description: `Make.com으로 만든 CRM 자동화 시나리오입니다. (승인 대기 중)`,
      category: ProductCategory.make,
      tags: ['make', 'crm', 'automation'],
      pricing_model: PricingModel.one_time,
      price: 15.00,
      currency: Currency.USD,
      verification_level: 0,
      status: ProductStatus.pending,
      view_count: 45,
      download_count: 0,
      rating_avg: null,
      review_count: 0,
    },
  });

  const product7 = await prisma.product.create({
    data: {
      seller_id: seller1.id,
      title: '마케팅 자동화 프롬프트 템플릿 50선',
      description: `마케팅에 바로 사용할 수 있는 GPT 프롬프트 50개 모음집입니다.

**포함 내용:**
- 블로그 글 작성 (10개)
- SNS 콘텐츠 생성 (15개)
- 이메일 마케팅 (10개)
- SEO 최적화 (10개)
- 광고 카피 (5개)

**사용법:**
- ChatGPT, Claude, Gemini 모두 호환
- 변수만 바꿔서 즉시 사용
- 한글 + 영문 버전 제공`,
      category: ProductCategory.prompt,
      tags: ['prompt', 'marketing', 'chatgpt', 'seo', 'content'],
      pricing_model: PricingModel.one_time,
      price: 14.99,
      currency: Currency.USD,
      verification_level: 1,
      status: ProductStatus.active,
      file_url: 'https://storage.example.com/products/marketing-prompts.pdf',
      view_count: 1890,
      download_count: 156,
      rating_avg: 4.6,
      review_count: 28,
      published_at: new Date('2024-02-10'),
    },
  });

  console.log('✅ Created products');

  // ============================================================================
  // ORDERS & PAYMENTS
  // ============================================================================

  const payment1 = await prisma.payment.create({
    data: {
      buyer_id: buyer1.id,
      seller_id: seller1.id,
      amount: 29.99,
      currency: Currency.USD,
      platform_fee: 4.50,
      seller_amount: 25.49,
      provider: PaymentProvider.stripe,
      provider_payment_id: 'pi_1234567890',
      status: 'succeeded',
    },
  });

  const order1 = await prisma.order.create({
    data: {
      buyer_id: buyer1.id,
      product_id: product1.id,
      amount: 29.99,
      currency: Currency.USD,
      status: OrderStatus.completed,
      payment_id: payment1.id,
      completed_at: new Date('2024-03-10'),
    },
  });

  const payment2 = await prisma.payment.create({
    data: {
      buyer_id: buyer1.id,
      seller_id: seller2.id,
      amount: 299.00,
      currency: Currency.USD,
      platform_fee: 44.85,
      seller_amount: 254.15,
      provider: PaymentProvider.stripe,
      provider_payment_id: 'pi_0987654321',
      status: 'succeeded',
    },
  });

  const order2 = await prisma.order.create({
    data: {
      buyer_id: buyer1.id,
      product_id: product3.id,
      amount: 299.00,
      currency: Currency.USD,
      status: OrderStatus.completed,
      payment_id: payment2.id,
      completed_at: new Date('2024-03-12'),
    },
  });

  const payment3 = await prisma.payment.create({
    data: {
      buyer_id: buyer2.id,
      seller_id: seller1.id,
      amount: 14.99,
      currency: Currency.USD,
      platform_fee: 2.25,
      seller_amount: 12.74,
      provider: PaymentProvider.tosspayments,
      provider_payment_id: 'toss_abc123',
      status: 'succeeded',
    },
  });

  const order3 = await prisma.order.create({
    data: {
      buyer_id: buyer2.id,
      product_id: product7.id,
      amount: 14.99,
      currency: Currency.USD,
      status: OrderStatus.completed,
      payment_id: payment3.id,
      completed_at: new Date('2024-03-15'),
    },
  });

  // Pending order
  const order4 = await prisma.order.create({
    data: {
      buyer_id: buyer2.id,
      product_id: product2.id,
      amount: 19.99,
      currency: Currency.USD,
      status: OrderStatus.pending,
    },
  });

  console.log('✅ Created orders and payments');

  // ============================================================================
  // REVIEWS
  // ============================================================================

  await prisma.review.create({
    data: {
      order_id: order1.id,
      product_id: product1.id,
      buyer_id: buyer1.id,
      seller_id: seller1.id,
      rating: 5,
      comment: '정말 유용한 워크플로우입니다! 이메일 처리 시간이 80% 단축되었어요. 설치도 쉽고 문서도 친절합니다.',
      seller_reply: '좋은 리뷰 감사합니다! 앞으로도 더 좋은 제품으로 찾아뵙겠습니다.',
      replied_at: new Date('2024-03-11'),
    },
  });

  await prisma.review.create({
    data: {
      order_id: order2.id,
      product_id: product3.id,
      buyer_id: buyer1.id,
      seller_id: seller2.id,
      rating: 5,
      comment: 'RAG 챗봇 품질이 정말 훌륭합니다. 우리 회사 문서를 학습시켰더니 고객 문의 응답률이 90% 이상입니다. 강력 추천!',
      seller_reply: '고객님의 비즈니스에 도움이 되어 기쁩니다. 추가 문의사항 있으시면 언제든 연락주세요!',
      replied_at: new Date('2024-03-13'),
    },
  });

  await prisma.review.create({
    data: {
      order_id: order3.id,
      product_id: product7.id,
      buyer_id: buyer2.id,
      seller_id: seller1.id,
      rating: 4,
      comment: '프롬프트 품질이 좋습니다. 다만 좀 더 다양한 산업군별 예시가 있으면 좋겠어요.',
    },
  });

  console.log('✅ Created reviews');

  // ============================================================================
  // VERIFICATIONS
  // ============================================================================

  await prisma.verification.create({
    data: {
      product_id: product1.id,
      verifier_id: verifier1.id,
      level: 3,
      status: VerificationStatus.approved,
      fee: 500.00,
      currency: Currency.USD,
      report: {
        code_quality: {
          score: 95,
          comments: 'Clean code structure, well-documented',
        },
        security: {
          score: 98,
          comments: 'No security vulnerabilities found',
          scanned_with: 'Snyk, OWASP ZAP',
        },
        performance: {
          score: 92,
          comments: 'Optimized workflow, minimal API calls',
          load_test_results: 'Passed 1000 concurrent executions',
        },
        overall: {
          score: 95,
          recommendation: 'Approved - Excellent quality product',
        },
      },
      started_at: new Date('2024-01-12'),
      completed_at: new Date('2024-01-14'),
    },
  });

  await prisma.verification.create({
    data: {
      product_id: product2.id,
      verifier_id: verifier1.id,
      level: 2,
      status: VerificationStatus.approved,
      fee: 150.00,
      currency: Currency.USD,
      report: {
        code_quality: {
          score: 88,
          comments: 'Good code structure, could improve error handling',
        },
        security: {
          score: 85,
          comments: 'Basic security measures in place',
        },
        overall: {
          score: 87,
          recommendation: 'Approved with minor suggestions',
        },
      },
      started_at: new Date('2024-01-28'),
      completed_at: new Date('2024-01-30'),
    },
  });

  await prisma.verification.create({
    data: {
      product_id: product3.id,
      verifier_id: verifier2.id,
      level: 3,
      status: VerificationStatus.approved,
      fee: 500.00,
      currency: Currency.USD,
      report: {
        code_quality: {
          score: 96,
          comments: 'Excellent architecture and code organization',
        },
        security: {
          score: 99,
          comments: 'Comprehensive security measures, encryption in place',
          scanned_with: 'Snyk, SonarQube, Burp Suite',
        },
        performance: {
          score: 94,
          comments: 'Excellent performance, vector search optimized',
          load_test_results: 'Handled 500 concurrent users smoothly',
        },
        overall: {
          score: 96,
          recommendation: 'Highly recommended - Production ready',
        },
      },
      started_at: new Date('2024-01-18'),
      completed_at: new Date('2024-01-20'),
    },
  });

  await prisma.verification.create({
    data: {
      product_id: product4.id,
      verifier_id: verifier1.id,
      level: 1,
      status: VerificationStatus.approved,
      fee: 50.00,
      currency: Currency.USD,
      report: {
        code_quality: {
          score: 78,
          comments: 'Basic functionality works, could improve code organization',
        },
        automated_tests: {
          passed: true,
          comments: 'All automated tests passed',
        },
        overall: {
          score: 78,
          recommendation: 'Approved for basic use',
        },
      },
      started_at: new Date('2024-02-28'),
      completed_at: new Date('2024-03-01'),
    },
  });

  await prisma.verification.create({
    data: {
      product_id: product7.id,
      verifier_id: verifier1.id,
      level: 1,
      status: VerificationStatus.approved,
      fee: 50.00,
      currency: Currency.USD,
      report: {
        quality: {
          score: 82,
          comments: 'Well-written prompts, practical examples',
        },
        usability: {
          score: 85,
          comments: 'Easy to use, clear instructions',
        },
        overall: {
          score: 84,
          recommendation: 'Approved - Good quality prompts',
        },
      },
      started_at: new Date('2024-02-08'),
      completed_at: new Date('2024-02-09'),
    },
  });

  // Pending verification
  await prisma.verification.create({
    data: {
      product_id: product6.id,
      level: 1,
      status: VerificationStatus.pending,
      fee: 50.00,
      currency: Currency.USD,
    },
  });

  console.log('✅ Created verifications');

  // ============================================================================
  // NOTIFICATIONS
  // ============================================================================

  await prisma.notification.create({
    data: {
      user_id: seller1.id,
      type: 'order',
      title: '새로운 주문이 발생했습니다',
      message: '정구매님이 "이메일 자동 분류 및 응답 워크플로우"를 구매했습니다.',
      link: '/dashboard/orders',
      read: true,
      created_at: new Date('2024-03-10'),
    },
  });

  await prisma.notification.create({
    data: {
      user_id: buyer1.id,
      type: 'order',
      title: '구매가 완료되었습니다',
      message: '"이메일 자동 분류 및 응답 워크플로우" 다운로드 링크가 준비되었습니다.',
      link: '/orders/1',
      read: true,
      created_at: new Date('2024-03-10'),
    },
  });

  await prisma.notification.create({
    data: {
      user_id: seller1.id,
      type: 'review',
      title: '새로운 리뷰가 작성되었습니다',
      message: '정구매님이 5점 리뷰를 남겼습니다.',
      link: '/products/1/reviews',
      read: false,
    },
  });

  await prisma.notification.create({
    data: {
      user_id: seller4.id,
      type: 'verification',
      title: '검증이 요청되었습니다',
      message: '"Make 시나리오 - CRM 자동화" 검증이 대기 중입니다.',
      link: '/dashboard/verifications',
      read: false,
    },
  });

  console.log('✅ Created notifications');

  // ============================================================================
  // CUSTOM REQUESTS (Phase 2)
  // ============================================================================

  await prisma.customRequest.create({
    data: {
      buyer_id: buyer1.id,
      title: '특정 ERP 시스템과 Slack 연동 워크플로우 개발',
      description: `우리 회사에서 사용하는 ERP 시스템의 주문 데이터를 Slack으로 실시간 알림받고 싶습니다.

**요구사항:**
- ERP API 연동 (문서 제공 가능)
- Slack 채널 별 알림 설정
- 주문 금액별 알림 레벨 구분
- 일일 요약 리포트

**기술 스택:**
- n8n 또는 Make 사용
- 기존 시스템과 충돌 없어야 함`,
      category: ProductCategory.n8n,
      budget_min: 500.00,
      budget_max: 1000.00,
      currency: Currency.USD,
      deadline: new Date('2024-04-30'),
      status: 'open',
    },
  });

  await prisma.customRequest.create({
    data: {
      buyer_id: buyer2.id,
      title: 'Instagram 자동 포스팅 AI Agent',
      description: `블로그 글을 Instagram에 맞게 자동 변환하여 포스팅하는 에이전트가 필요합니다.

**요구사항:**
- 블로그 RSS 피드 모니터링
- 이미지 자동 생성 (AI)
- 해시태그 자동 생성
- 최적 시간대 포스팅

**예산:** 협의 가능`,
      category: ProductCategory.ai_agent,
      budget_min: 1000.00,
      budget_max: 2000.00,
      currency: Currency.USD,
      status: 'open',
    },
  });

  console.log('✅ Created custom requests');

  console.log('\n🎉 Database seeding completed successfully!\n');
  console.log('📊 Summary:');
  console.log('- Users: 9 (1 admin, 4 sellers, 2 buyers, 2 verifiers)');
  console.log('- Products: 7 (6 active, 1 pending)');
  console.log('- Orders: 4 (3 completed, 1 pending)');
  console.log('- Reviews: 3');
  console.log('- Verifications: 6 (5 approved, 1 pending)');
  console.log('- Notifications: 4');
  console.log('- Custom Requests: 2');
  console.log('\n📝 Test Credentials:');
  console.log('- Admin: admin@aimarket.com / password123');
  console.log('- Seller (Master): seller1@example.com / password123');
  console.log('- Buyer: buyer1@example.com / password123');
  console.log('- Verifier: verifier1@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
