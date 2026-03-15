const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vibe-cto.net';

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'VIBE CTO',
  url: siteUrl,
  description:
    '바이브코딩으로 만든 서비스를 현직 CTO가 배포 전 검증하고, 운영 전문 업체가 실제 서비스 운영을 지원하는 기술 파트너 플랫폼',
  serviceArea: {
    '@type': 'Country',
    name: 'South Korea',
  },
};

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: '바이브코딩 CTO 검증 서비스',
  provider: {
    '@type': 'Organization',
    name: 'VIBE CTO',
  },
  description:
    '바이브코딩(Vibe Coding)으로 개발한 서비스를 배포하기 전에 현직 CTO들이 코드 품질, 보안, 인프라, 성능을 직접 검증합니다. 비즈니스 전문가가 수익성을 검토하고, 운영 전문 업체가 실제 서비스 운영을, 전문 마케팅 업체가 성장까지 지원합니다.',
  serviceType: '기술 검증, 비즈니스 검토, 운영 지원, 마케팅 지원',
  areaServed: {
    '@type': 'Country',
    name: 'KR',
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'VIBE CTO 서비스',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: '배포 전 CTO 검증',
          description:
            '현직 CTO가 바이브코딩으로 만든 코드의 보안 취약점, 성능 병목, 구조적 문제를 배포 전에 직접 검증합니다.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: '비즈니스 전문가 수익 연결 검토',
          description:
            '비즈니스 전문가가 트래픽 증가, 결제, 운영 효율 등 실제 매출 흐름에 맞춘 안정성을 검토하고 수익으로 이어지는 개선 우선순위를 제공합니다.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: '운영 전문 업체 상시 지원',
          description:
            '서비스 오픈 이후 서버 관리, 장애 대응, 스케일링까지 운영 전문 업체가 실제 서비스 운영을 상시 지원합니다.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: '전문 마케팅 업체 성장 지원',
          description:
            '서비스 출시 이후 전문 마케팅 업체가 고객 확보, 광고 운영, 그로스 전략까지 지원하여 실제 매출 성장을 도와드립니다.',
        },
      },
    ],
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '바이브코딩이란 무엇인가요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '바이브코딩(Vibe Coding)은 AI 도구(ChatGPT, Claude, Cursor 등)를 활용하여 빠르게 소프트웨어를 개발하는 방식입니다. 코드 생성 속도는 빠르지만, 보안, 성능, 확장성 측면에서 전문가 검증이 필요합니다.',
      },
    },
    {
      '@type': 'Question',
      name: '바이브코딩으로 만든 서비스를 왜 검증받아야 하나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'AI가 생성한 코드에는 보안 취약점, 성능 병목, 잘못된 아키텍처 패턴이 포함될 수 있습니다. 배포 전에 현직 CTO의 검증을 통해 이러한 문제를 사전에 발견하고 수정하면, 실제 사용자에게 안정적인 서비스를 제공할 수 있습니다.',
      },
    },
    {
      '@type': 'Question',
      name: 'VIBE CTO에서 어떤 검증을 받을 수 있나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '현직 CTO들이 코드 품질 리뷰, 보안 취약점 점검, 인프라 구조 검토, 성능 최적화 포인트 분석, 배포 환경 점검을 직접 수행합니다. 검증 후에는 구체적인 개선 가이드와 우선순위를 제공합니다.',
      },
    },
    {
      '@type': 'Question',
      name: '서비스 오픈 후에도 지원을 받을 수 있나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '네, 운영 전문 업체가 서비스 오픈 이후에도 상시 지원합니다. 서버 관리, 장애 대응, 모니터링, 스케일링 등 실제 서비스 운영에 필요한 전반적인 지원을 제공하여 바이브코딩으로 만든 서비스가 안정적으로 운영될 수 있도록 도와드립니다.',
      },
    },
    {
      '@type': 'Question',
      name: '솔로프리너나 1인 개발자도 이용할 수 있나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '물론입니다. VIBE CTO는 솔로프리너, 1인 개발자, 소규모 팀을 주요 대상으로 합니다. CTO를 고용하기 어려운 상황에서도 현직 CTO의 기술 검증과 운영 전문 업체의 지원을 받아 실제 서비스를 안정적으로 운영할 수 있습니다.',
      },
    },
    {
      '@type': 'Question',
      name: '출시 후 마케팅 지원도 받을 수 있나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '네, 서비스 출시 이후 전문 마케팅 업체가 고객 확보, 광고 운영, 그로스 전략까지 지원합니다. 바이브코딩으로 만든 서비스가 실제 매출로 이어질 수 있도록 성장 단계까지 함께합니다.',
      },
    },
    {
      '@type': 'Question',
      name: 'CTO 검증 요청은 어떻게 하나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'VIBE CTO 웹사이트에서 서비스 정보와 검증 요청 내용을 작성하여 접수하면, 현직 CTO가 검토 후 코드·보안·인프라를 직접 검증합니다. 이후 운영 전문 업체와 마케팅 업체가 서비스 운영과 성장을 지원합니다.',
      },
    },
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: '바이브코딩 서비스를 실제 서비스로 출시하고 성장시키는 방법',
  description:
    '바이브코딩으로 만든 서비스를 현직 CTO 검증, 비즈니스 검토, 운영 전문 업체 지원, 마케팅 업체 지원을 통해 실제 서비스로 안전하게 출시하고 성장시키는 과정입니다.',
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: '검증 요청 접수',
      text: '바이브코딩으로 만든 서비스 정보와 현재 고민, 검토받고 싶은 기술 이슈를 접수합니다.',
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: '현직 CTO 검증 및 비즈니스 검토',
      text: '현직 CTO가 코드 품질, 보안, 인프라를 직접 검증하고, 비즈니스 전문가가 수익 연결 관점에서 안정성을 검토합니다.',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: '운영 전문 업체 지원',
      text: '서비스 오픈 이후 운영 전문 업체가 서버 관리, 장애 대응, 스케일링 등 실제 서비스 운영을 상시 지원합니다.',
    },
    {
      '@type': 'HowToStep',
      position: 4,
      name: '전문 마케팅 업체 성장 지원',
      text: '출시 이후 전문 마케팅 업체가 고객 확보, 광고 운영, 그로스 전략까지 지원하여 매출 성장을 도와드립니다.',
    },
  ],
};

export function JsonLd() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
    </>
  );
}
