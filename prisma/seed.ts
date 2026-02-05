import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../.env.local') });

import { PrismaClient, OrderStatus, VerificationStatus, PaymentStatus } from '@prisma/client';
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
       role: 'admin',
       emailVerified: true,
     },
   });

   // Sellers
   const seller1 = await prisma.user.create({
     data: {
       email: 'seller1@aimarket.com',
       password: hashedPassword,
       name: '김개발',
       role: 'seller',
       emailVerified: true,
     },
   });

   const seller2 = await prisma.user.create({
     data: {
       email: 'seller2@aimarket.com',
       password: hashedPassword,
       name: '이자동',
       role: 'seller',
       emailVerified: true,
     },
   });

   const seller3 = await prisma.user.create({
     data: {
       email: 'seller3@aimarket.com',
       password: hashedPassword,
       name: '박바이브',
       role: 'seller',
       emailVerified: true,
     },
   });

   const seller4 = await prisma.user.create({
     data: {
       email: 'seller4@aimarket.com',
       password: hashedPassword,
       name: '최신규',
       role: 'seller',
       emailVerified: true,
     },
   });

   // Buyers
   const buyer1 = await prisma.user.create({
     data: {
       email: 'buyer1@aimarket.com',
       password: hashedPassword,
       name: '정구매',
       role: 'user',
       emailVerified: true,
     },
   });

   const buyer2 = await prisma.user.create({
     data: {
       email: 'buyer2@aimarket.com',
       password: hashedPassword,
       name: '홍마케팅',
       role: 'user',
       emailVerified: true,
     },
   });

   // Verifiers
   const verifier1 = await prisma.user.create({
     data: {
       email: 'verifier1@aimarket.com',
       password: hashedPassword,
       name: '안검증',
       role: 'verifier',
       emailVerified: true,
     },
   });

   const verifier2 = await prisma.user.create({
     data: {
       email: 'verifier2@aimarket.com',
       password: hashedPassword,
       name: '강보안',
       role: 'verifier',
       emailVerified: true,
     },
   });

  console.log('✅ Created users');

  // ============================================================================
  // PRODUCTS
  // ============================================================================

   const product1 = await prisma.product.create({
     data: {
       seller_id: seller1.id,
       name: '이메일 자동 분류 및 응답 워크플로우',
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
       category: 'n8n',
       price: 29.99,
       currency: 'USD',
       verification_level: 3,
       status: 'active',
       rating_average: 4.8,
       rating_count: 12,
       download_count: 89,
     },
   });

   const product2 = await prisma.product.create({
     data: {
       seller_id: seller1.id,
       name: 'Slack 메시지 요약 AI Agent',
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
       category: 'ai_agent',
       price: 19.99,
       currency: 'USD',
       verification_level: 2,
       status: 'active',
       rating_average: 4.5,
       rating_count: 8,
       download_count: 34,
     },
   });

   const product3 = await prisma.product.create({
     data: {
       seller_id: seller2.id,
       name: 'Customer Support Chatbot (RAG)',
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
       category: 'ai_agent',
       price: 299.00,
       currency: 'USD',
       verification_level: 3,
       status: 'active',
       rating_average: 4.9,
       rating_count: 15,
       download_count: 45,
     },
   });

   const product4 = await prisma.product.create({
     data: {
       seller_id: seller2.id,
       name: '소셜 미디어 자동 포스팅 도구',
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
       category: 'app',
       price: 49.99,
       currency: 'USD',
       verification_level: 1,
       status: 'active',
       rating_average: 4.2,
       rating_count: 5,
       download_count: 23,
     },
   });

   const product5 = await prisma.product.create({
     data: {
       seller_id: seller3.id,
       name: '간단한 To-Do 앱 (바이브코딩)',
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
       category: 'app',
       price: 9.99,
       currency: 'USD',
       verification_level: 0,
       status: 'active',
       rating_average: 3.8,
       rating_count: 3,
       download_count: 12,
     },
   });

   const product6 = await prisma.product.create({
     data: {
       seller_id: seller4.id,
       name: 'Make 시나리오 - CRM 자동화',
       description: `Make.com으로 만든 CRM 자동화 시나리오입니다. (승인 대기 중)`,
       category: 'make',
       price: 15.00,
       currency: 'USD',
       verification_level: 0,
       status: 'pending',
       download_count: 0,
       rating_count: 0,
     },
   });

   const product7 = await prisma.product.create({
     data: {
       seller_id: seller1.id,
       name: '마케팅 자동화 프롬프트 템플릿 50선',
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
       category: 'prompt',
       price: 14.99,
       currency: 'USD',
       verification_level: 1,
       status: 'active',
       rating_average: 4.6,
       rating_count: 28,
       download_count: 156,
     },
   });

  console.log('✅ Created products');

   // ============================================================================
   // ORDERS & PAYMENTS
   // ============================================================================

   // Create orders first
   const order1 = await prisma.order.create({
     data: {
       buyer_id: buyer1.id,
       product_id: product1.id,
       amount: 29.99,
       currency: 'USD',
       platform_fee: 4.50,
       seller_amount: 25.49,
       status: OrderStatus.COMPLETED,
       paid_at: new Date('2024-03-10'),
     },
   });

   // Create payment for order1
   const payment1 = await prisma.payment.create({
     data: {
       order_id: order1.id,
       amount: 29.99,
       currency: 'USD',
       provider: 'stripe',
       provider_payment_id: 'pi_1234567890',
       status: PaymentStatus.SUCCEEDED,
     },
   });

   const order2 = await prisma.order.create({
     data: {
       buyer_id: buyer1.id,
       product_id: product3.id,
       amount: 299.00,
       currency: 'USD',
       platform_fee: 44.85,
       seller_amount: 254.15,
       status: OrderStatus.COMPLETED,
       paid_at: new Date('2024-03-12'),
     },
   });

   const payment2 = await prisma.payment.create({
     data: {
       order_id: order2.id,
       amount: 299.00,
       currency: 'USD',
       provider: 'stripe',
       provider_payment_id: 'pi_0987654321',
       status: PaymentStatus.SUCCEEDED,
     },
   });

   const order3 = await prisma.order.create({
     data: {
       buyer_id: buyer2.id,
       product_id: product7.id,
       amount: 14.99,
       currency: 'USD',
       platform_fee: 2.25,
       seller_amount: 12.74,
       status: OrderStatus.COMPLETED,
       paid_at: new Date('2024-03-15'),
     },
   });

   const payment3 = await prisma.payment.create({
     data: {
       order_id: order3.id,
       amount: 14.99,
       currency: 'USD',
       provider: 'tosspayments',
       provider_payment_id: 'toss_abc123',
       status: PaymentStatus.SUCCEEDED,
     },
   });

   // Pending order
   const order4 = await prisma.order.create({
     data: {
       buyer_id: buyer2.id,
       product_id: product2.id,
       amount: 19.99,
       currency: 'USD',
       platform_fee: 3.00,
       seller_amount: 16.99,
       status: OrderStatus.PENDING,
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
       user_id: buyer1.id,
       rating: 5,
       comment: '정말 유용한 워크플로우입니다! 이메일 처리 시간이 80% 단축되었어요. 설치도 쉽고 문서도 친절합니다.',
       seller_reply: '좋은 리뷰 감사합니다! 앞으로도 더 좋은 제품으로 찾아뵙겠습니다.',
       seller_replied_at: new Date('2024-03-11'),
     },
   });

   await prisma.review.create({
     data: {
       order_id: order2.id,
       product_id: product3.id,
       user_id: buyer1.id,
       rating: 5,
       comment: 'RAG 챗봇 품질이 정말 훌륭합니다. 우리 회사 문서를 학습시켰더니 고객 문의 응답률이 90% 이상입니다. 강력 추천!',
       seller_reply: '고객님의 비즈니스에 도움이 되어 기쁩니다. 추가 문의사항 있으시면 언제든 연락주세요!',
       seller_replied_at: new Date('2024-03-13'),
     },
   });

   await prisma.review.create({
     data: {
       order_id: order3.id,
       product_id: product7.id,
       user_id: buyer2.id,
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
       status: VerificationStatus.APPROVED,
       fee: 500,
       platform_share: 250,
       verifier_share: 250,
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
       completed_at: new Date('2024-01-14'),
     },
   });

   await prisma.verification.create({
     data: {
       product_id: product2.id,
       verifier_id: verifier1.id,
       level: 2,
       status: VerificationStatus.APPROVED,
       fee: 150,
       platform_share: 75,
       verifier_share: 75,
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
       completed_at: new Date('2024-01-30'),
     },
   });

   await prisma.verification.create({
     data: {
       product_id: product3.id,
       verifier_id: verifier2.id,
       level: 3,
       status: VerificationStatus.APPROVED,
       fee: 500,
       platform_share: 250,
       verifier_share: 250,
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
       completed_at: new Date('2024-01-20'),
     },
   });

   await prisma.verification.create({
     data: {
       product_id: product4.id,
       verifier_id: verifier1.id,
       level: 1,
       status: VerificationStatus.APPROVED,
       fee: 50,
       platform_share: 25,
       verifier_share: 25,
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
       completed_at: new Date('2024-03-01'),
     },
   });

   await prisma.verification.create({
     data: {
       product_id: product7.id,
       verifier_id: verifier1.id,
       level: 1,
       status: VerificationStatus.APPROVED,
       fee: 50,
       platform_share: 25,
       verifier_share: 25,
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
       completed_at: new Date('2024-02-09'),
     },
   });

   // Pending verification
   await prisma.verification.create({
     data: {
       product_id: product6.id,
       level: 1,
       status: VerificationStatus.PENDING,
       fee: 50,
       platform_share: 25,
       verifier_share: 25,
     },
   });

  console.log('✅ Created verifications');

  // ============================================================================
  // NOTIFICATIONS
  // ============================================================================

   await prisma.notification.create({
     data: {
       user_id: seller1.id,
       type: 'PAYMENT_RECEIVED',
       title: '새로운 주문이 발생했습니다',
       message: '정구매님이 "이메일 자동 분류 및 응답 워크플로우"를 구매했습니다.',
       link: '/dashboard/orders',
       read: true,
     },
   });

   await prisma.notification.create({
     data: {
       user_id: buyer1.id,
       type: 'ORDER_COMPLETED',
       title: '구매가 완료되었습니다',
       message: '"이메일 자동 분류 및 응답 워크플로우" 다운로드 링크가 준비되었습니다.',
       link: '/orders/1',
       read: true,
     },
   });

   await prisma.notification.create({
     data: {
       user_id: seller1.id,
       type: 'REVIEW_RECEIVED',
       title: '새로운 리뷰가 작성되었습니다',
       message: '정구매님이 5점 리뷰를 남겼습니다.',
       link: '/products/1/reviews',
       read: false,
     },
   });

   await prisma.notification.create({
     data: {
       user_id: seller4.id,
       type: 'VERIFICATION_REQUESTED',
       title: '검증이 요청되었습니다',
       message: '"Make 시나리오 - CRM 자동화" 검증이 대기 중입니다.',
       link: '/dashboard/verifications',
       read: false,
     },
   });

  console.log('✅ Created notifications');

   // ============================================================================
   // DEVELOPMENT REQUESTS
   // ============================================================================

   await prisma.developmentRequest.create({
     data: {
       buyerId: buyer1.id,
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
       category: 'n8n',
       budgetMin: 500,
       budgetMax: 1000,
       timeline: '30 days',
       requirements: {
         api_integration: 'ERP API',
         notifications: 'Slack alerts by level',
         summary: 'Daily reports',
       },
       status: 'OPEN',
     },
   });

   await prisma.developmentRequest.create({
     data: {
       buyerId: buyer2.id,
       title: 'Instagram 자동 포스팅 AI Agent',
       description: `블로그 글을 Instagram에 맞게 자동 변환하여 포스팅하는 에이전트가 필요합니다.

**요구사항:**
- 블로그 RSS 피드 모니터링
- 이미지 자동 생성 (AI)
- 해시태그 자동 생성
- 최적 시간대 포스팅

**예산:** 협의 가능`,
       category: 'ai_agent',
       budgetMin: 1000,
       budgetMax: 2000,
       timeline: '45 days',
       requirements: {
         rss_monitoring: 'Blog RSS feed',
         image_generation: 'AI-generated images',
         hashtag_generation: 'Auto hashtags',
         scheduling: 'Optimal posting time',
       },
       status: 'OPEN',
     },
   });

   console.log('✅ Created development requests');

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
