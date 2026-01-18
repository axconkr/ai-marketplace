import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 테스트 데이터 생성 시작...');

  // 기존 데이터 삭제
  console.log('기존 데이터 삭제 중...');
  await prisma.reviewVote.deleteMany();
  await prisma.review.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.verifierPayout.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.settlementItem.deleteMany();
  await prisma.settlement.deleteMany();
  await prisma.refund.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.file.deleteMany();
  await prisma.product.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // 1. 사용자 생성
  console.log('사용자 생성 중...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@aimarket.com',
      password: hashedPassword,
      name: '관리자',
      role: 'admin',
      emailVerified: true,
    },
  });

  const seller1 = await prisma.user.create({
    data: {
      email: 'seller1@aimarket.com',
      password: hashedPassword,
      name: '김판매',
      role: 'service_provider',
      emailVerified: true,
      bank_name: '신한은행',
      bank_account: '110-123-456789',
      account_holder: '김판매',
      bank_verified: true,
      platform_fee_rate: 0.15,
    },
  });

  const seller2 = await prisma.user.create({
    data: {
      email: 'seller2@aimarket.com',
      password: hashedPassword,
      name: '이개발',
      role: 'service_provider',
      emailVerified: true,
      bank_name: '국민은행',
      bank_account: '123-456-789012',
      account_holder: '이개발',
      bank_verified: true,
      platform_fee_rate: 0.12,
    },
  });

  const buyer1 = await prisma.user.create({
    data: {
      email: 'buyer1@aimarket.com',
      password: hashedPassword,
      name: '박구매',
      role: 'client',
      emailVerified: true,
    },
  });

  const buyer2 = await prisma.user.create({
    data: {
      email: 'buyer2@aimarket.com',
      password: hashedPassword,
      name: '최고객',
      role: 'client',
      emailVerified: true,
    },
  });

  const verifier = await prisma.user.create({
    data: {
      email: 'verifier@aimarket.com',
      password: hashedPassword,
      name: '정검증',
      role: 'verifier',
      emailVerified: true,
      verifier_stats: {
        total_verifications: 50,
        total_earnings: 500000,
        approval_rate: 0.95,
        avg_score: 87.5,
      },
    },
  });

  console.log(`✅ ${6}명의 사용자 생성 완료`);

  // 2. 제품 생성
  console.log('제품 생성 중...');

  const product1 = await prisma.product.create({
    data: {
      name: 'GPT-4 기반 고객 응대 자동화 워크플로우',
      description: 'GPT-4를 활용한 24시간 자동 고객 응대 시스템입니다. 이메일, 채팅, 티켓 시스템을 통합하여 고객 문의에 자동으로 응답합니다. 복잡한 질문은 자동으로 상담원에게 에스컬레이션됩니다.',
      price: 49000,
      currency: 'KRW',
      seller_id: seller1.id,
      status: 'active',
      category: 'n8n 워크플로우',
      download_count: 145,
      verification_level: 3,
      verification_badges: ['security', 'performance', 'quality'],
      verification_score: 95.5,
      rating_average: 4.8,
      rating_count: 24,
      rating_distribution: { '5': 18, '4': 4, '3': 2, '2': 0, '1': 0 },
    },
  });

  const product2 = await prisma.product.create({
    data: {
      name: '이메일 마케팅 자동화 AI 에이전트',
      description: 'OpenAI API를 사용하여 고객 데이터를 분석하고 맞춤형 이메일을 자동으로 생성하는 AI 에이전트입니다. A/B 테스팅, 성과 분석, 자동 세그먼테이션 기능 포함.',
      price: 79000,
      currency: 'KRW',
      seller_id: seller1.id,
      status: 'active',
      category: 'AI 에이전트',
      download_count: 89,
      verification_level: 2,
      verification_badges: ['security', 'performance'],
      verification_score: 88.0,
      rating_average: 4.5,
      rating_count: 15,
      rating_distribution: { '5': 10, '4': 3, '3': 2, '2': 0, '1': 0 },
    },
  });

  const product3 = await prisma.product.create({
    data: {
      name: '소셜 미디어 자동 포스팅 도구',
      description: '페이스북, 인스타그램, 트위터, 링크드인에 동시에 포스팅할 수 있는 자동화 도구입니다. 예약 게시, 해시태그 최적화, 성과 분석 기능이 포함되어 있습니다.',
      price: 35000,
      currency: 'KRW',
      seller_id: seller2.id,
      status: 'active',
      category: '자동화 도구',
      download_count: 203,
      verification_level: 1,
      verification_badges: ['performance'],
      verification_score: 75.5,
      rating_average: 4.2,
      rating_count: 42,
      rating_distribution: { '5': 20, '4': 15, '3': 5, '2': 2, '1': 0 },
    },
  });

  const product4 = await prisma.product.create({
    data: {
      name: 'Slack + Notion 통합 워크플로우',
      description: 'Slack 메시지를 자동으로 Notion 데이터베이스에 저장하고, 중요한 알림을 선별하여 전달합니다. 팀 협업 효율을 높이는 필수 도구입니다.',
      price: 25000,
      currency: 'KRW',
      seller_id: seller2.id,
      status: 'active',
      category: '통합 솔루션',
      download_count: 178,
      verification_level: 2,
      verification_badges: ['security', 'quality'],
      verification_score: 82.0,
      rating_average: 4.6,
      rating_count: 31,
      rating_distribution: { '5': 22, '4': 7, '3': 2, '2': 0, '1': 0 },
    },
  });

  const product5 = await prisma.product.create({
    data: {
      name: 'AI 기반 음성 챗봇 (Vibe Coding)',
      description: 'Whisper API와 GPT-4를 결합한 음성 기반 AI 챗봇입니다. 음성을 텍스트로 변환하고, AI가 응답을 생성하여 다시 음성으로 출력합니다. 콜센터, 고객 지원에 최적화되어 있습니다.',
      price: 120000,
      currency: 'KRW',
      seller_id: seller1.id,
      status: 'active',
      category: '바이브코딩 앱',
      download_count: 56,
      verification_level: 3,
      verification_badges: ['security', 'performance', 'quality'],
      verification_score: 92.0,
      rating_average: 4.9,
      rating_count: 18,
      rating_distribution: { '5': 16, '4': 2, '3': 0, '2': 0, '1': 0 },
    },
  });

  const product6 = await prisma.product.create({
    data: {
      name: '데이터 스크래핑 자동화 워크플로우',
      description: '웹 사이트에서 데이터를 자동으로 수집하고 정리하는 n8n 워크플로우입니다. 스케줄링, 데이터 정제, 엑셀/CSV 내보내기 기능 포함.',
      price: 45000,
      currency: 'KRW',
      seller_id: seller2.id,
      status: 'active',
      category: 'n8n 워크플로우',
      download_count: 112,
      verification_level: 1,
      verification_badges: ['performance'],
      verification_score: 78.5,
      rating_average: 4.3,
      rating_count: 28,
      rating_distribution: { '5': 15, '4': 10, '3': 3, '2': 0, '1': 0 },
    },
  });

  console.log(`✅ ${6}개의 제품 생성 완료`);

  // 3. 파일 생성 (제품 첨부 파일)
  console.log('파일 생성 중...');

  await prisma.file.createMany({
    data: [
      {
        product_id: product1.id,
        user_id: seller1.id,
        filename: 'gpt4-customer-support.json',
        original_name: 'GPT-4 고객응대 워크플로우.json',
        mime_type: 'application/json',
        size: 45678,
        path: '/uploads/products/gpt4-customer-support.json',
        url: '/uploads/products/gpt4-customer-support.json',
        status: 'ACTIVE',
      },
      {
        product_id: product2.id,
        user_id: seller1.id,
        filename: 'email-marketing-agent.zip',
        original_name: '이메일 마케팅 에이전트.zip',
        mime_type: 'application/zip',
        size: 123456,
        path: '/uploads/products/email-marketing-agent.zip',
        url: '/uploads/products/email-marketing-agent.zip',
        status: 'ACTIVE',
      },
      {
        product_id: product3.id,
        user_id: seller2.id,
        filename: 'social-media-poster.json',
        original_name: '소셜미디어 자동포스팅.json',
        mime_type: 'application/json',
        size: 34567,
        path: '/uploads/products/social-media-poster.json',
        url: '/uploads/products/social-media-poster.json',
        status: 'ACTIVE',
      },
    ],
  });

  console.log(`✅ 파일 생성 완료`);

  // 4. 주문 및 결제 생성
  console.log('주문 및 결제 생성 중...');

  const platformFee1 = product1.price * 0.15; // 15% platform fee
  const sellerAmount1 = product1.price - platformFee1;

  const order1 = await prisma.order.create({
    data: {
      buyer_id: buyer1.id,
      product_id: product1.id,
      amount: product1.price,
      currency: product1.currency,
      platform_fee: platformFee1,
      seller_amount: sellerAmount1,
      status: 'COMPLETED',
      access_granted: true,
      paid_at: new Date(),
    },
  });

  await prisma.payment.create({
    data: {
      order_id: order1.id,
      provider: 'toss',
      provider_payment_id: 'test_payment_' + Date.now(),
      amount: product1.price,
      currency: product1.currency,
      payment_method: 'card',
      status: 'SUCCEEDED',
    },
  });

  const platformFee2 = product3.price * 0.12; // 12% platform fee
  const sellerAmount2 = product3.price - platformFee2;

  const order2 = await prisma.order.create({
    data: {
      buyer_id: buyer2.id,
      product_id: product3.id,
      amount: product3.price,
      currency: product3.currency,
      platform_fee: platformFee2,
      seller_amount: sellerAmount2,
      status: 'COMPLETED',
      access_granted: true,
      paid_at: new Date(),
    },
  });

  await prisma.payment.create({
    data: {
      order_id: order2.id,
      provider: 'toss',
      provider_payment_id: 'test_payment_' + (Date.now() + 1),
      amount: product3.price,
      currency: product3.currency,
      payment_method: 'bank_transfer',
      status: 'SUCCEEDED',
    },
  });

  console.log(`✅ 주문 및 결제 생성 완료`);

  // 5. 리뷰 생성
  console.log('리뷰 생성 중...');

  await prisma.review.createMany({
    data: [
      {
        product_id: product1.id,
        user_id: buyer1.id,
        order_id: order1.id,
        rating: 5,
        title: '정말 유용한 워크플로우입니다!',
        comment:
          '고객 응대 시간이 70% 단축되었습니다. 설정도 간단하고 문서화가 잘 되어 있어서 쉽게 도입할 수 있었습니다. 강력 추천합니다!',
        images: [],
        status: 'PUBLISHED',
      },
      {
        product_id: product3.id,
        user_id: buyer2.id,
        order_id: order2.id,
        rating: 4,
        title: '괜찮은 도구입니다',
        comment:
          '기본 기능은 잘 작동합니다. 다만 인스타그램 해시태그 추천 기능이 조금 아쉽네요. 전반적으로는 만족합니다.',
        images: [],
        status: 'PUBLISHED',
      },
    ],
  });

  console.log(`✅ 리뷰 생성 완료`);

  console.log('\n🎉 테스트 데이터 생성 완료!');
  console.log('\n생성된 계정:');
  console.log('─'.repeat(60));
  console.log('관리자   : admin@aimarket.com / password123');
  console.log('판매자 1 : seller1@aimarket.com / password123');
  console.log('판매자 2 : seller2@aimarket.com / password123');
  console.log('구매자 1 : buyer1@aimarket.com / password123');
  console.log('구매자 2 : buyer2@aimarket.com / password123');
  console.log('검증자   : verifier@aimarket.com / password123');
  console.log('─'.repeat(60));
  console.log(`\n생성된 제품: ${6}개`);
  console.log(`생성된 주문: ${2}개`);
  console.log(`생성된 리뷰: ${2}개`);
}

main()
  .catch((e) => {
    console.error('❌ 에러 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
