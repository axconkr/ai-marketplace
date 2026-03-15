export function TrustSection() {
  return (
    <section aria-labelledby="process-heading" className="grid gap-6 rounded-[2rem] border border-[#d9d2c6] bg-[#fbf8f3] p-6 sm:p-8 lg:grid-cols-[0.95fr_1.05fr]">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5b6d56]">How It Works</p>
        <h2 id="process-heading" className="mt-3 text-3xl font-semibold text-[#1f2f1d]">검증부터 성장까지 원스톱으로 연결합니다</h2>
        <p className="mt-4 text-base leading-relaxed text-[#5d6559]">
          현직 CTO 검증, 비즈니스 검토, 운영 전문 업체 지원, 마케팅 업체 지원까지 한 번에 연결합니다.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['01', '접수', '바이브코딩으로 만든 서비스 정보를 접수합니다.'],
          ['02', 'CTO 검증', '현직 CTO가 코드·보안·인프라를 직접 검증합니다.'],
          ['03', '운영 지원', '운영 전문 업체가 실제 서비스 운영을 지원합니다.'],
          ['04', '마케팅 지원', '전문 마케팅 업체가 고객 확보와 성장을 지원합니다.'],
        ].map(([step, title, description]) => (
          <article key={step} className="rounded-[1.5rem] border border-[#e7e0d4] bg-white p-5">
            <p className="text-sm font-semibold text-[#6d805f]">{step}</p>
            <h3 className="mt-4 text-lg font-semibold text-[#223120]">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#61695c]">{description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
