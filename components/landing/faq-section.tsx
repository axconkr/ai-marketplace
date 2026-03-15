const faqs = [
  {
    question: '바이브코딩이란 무엇인가요?',
    answer:
      '바이브코딩(Vibe Coding)은 ChatGPT, Claude, Cursor 같은 AI 도구를 활용하여 빠르게 소프트웨어를 개발하는 방식입니다. 개발 속도는 빠르지만, 보안·성능·확장성 측면에서 전문가의 검증이 반드시 필요합니다.',
  },
  {
    question: '바이브코딩으로 만든 서비스를 왜 검증받아야 하나요?',
    answer:
      'AI가 생성한 코드에는 보안 취약점, 성능 병목, 잘못된 아키텍처 패턴이 포함될 수 있습니다. 배포 전에 현직 CTO의 검증을 통해 이런 문제를 사전에 발견하고 수정하면, 실제 사용자에게 안정적인 서비스를 제공할 수 있습니다.',
  },
  {
    question: 'VIBE CTO에서 어떤 검증을 받을 수 있나요?',
    answer:
      '현직 CTO들이 코드 품질 리뷰, 보안 취약점 점검, 인프라 구조 검토, 성능 최적화 포인트 분석, 배포 환경 점검을 직접 수행합니다. 검증 후에는 구체적인 개선 가이드와 우선순위를 제공합니다.',
  },
  {
    question: '서비스 오픈 후에도 지원을 받을 수 있나요?',
    answer:
      '네, 운영 전문 업체가 서비스 오픈 이후에도 상시 지원합니다. 서버 관리, 장애 대응, 모니터링, 스케일링 등 실제 서비스 운영에 필요한 전반적인 지원을 제공합니다.',
  },
  {
    question: '솔로프리너나 1인 개발자도 이용할 수 있나요?',
    answer:
      '물론입니다. VIBE CTO는 솔로프리너, 1인 개발자, 소규모 팀을 주요 대상으로 합니다. CTO를 고용하기 어려운 상황에서도 현직 CTO의 기술 검증과 운영 전문 업체의 지원을 받을 수 있습니다.',
  },
  {
    question: '출시 후 마케팅 지원도 받을 수 있나요?',
    answer:
      '네, 서비스 출시 이후 전문 마케팅 업체가 고객 확보, 광고 운영, 그로스 전략까지 지원합니다. 바이브코딩으로 만든 서비스가 실제 매출로 이어질 수 있도록 성장 단계까지 함께합니다.',
  },
  {
    question: 'CTO 검증 요청은 어떻게 하나요?',
    answer:
      'VIBE CTO 웹사이트에서 서비스 정보와 검증 요청 내용을 작성하여 접수하면 됩니다. 현직 CTO가 검토 후 코드·보안·인프라를 직접 검증하고, 이후 운영 전문 업체와 마케팅 업체가 서비스 운영과 성장을 지원합니다.',
  },
];

export function FaqSection() {
  return (
    <section
      className="rounded-[2rem] border border-[#d9d2c6] bg-[#fbf8f3] p-6 sm:p-8"
      aria-labelledby="faq-heading"
    >
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5b6d56]">
        FAQ
      </p>
      <h2
        id="faq-heading"
        className="mt-3 text-3xl font-semibold text-[#1f2f1d]"
      >
        자주 묻는 질문
      </h2>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#5d6559]">
        바이브코딩 검증과 운영 지원에 대해 궁금한 점을 확인하세요.
      </p>
      <dl className="mt-8 space-y-4">
        {faqs.map((faq) => (
          <div
            key={faq.question}
            className="rounded-[1.5rem] border border-[#e7e0d4] bg-white p-5"
          >
            <dt className="text-lg font-semibold text-[#223120]">
              {faq.question}
            </dt>
            <dd className="mt-2 text-sm leading-relaxed text-[#61695c]">
              {faq.answer}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
