const SAMPLE_HIGHLIGHTS = [
  {
    title: '핵심 리스크 요약',
    desc: '높음/중간/낮음으로 분류된 발견 사항과 즉시 조치 항목을 한 페이지로 정리합니다.',
  },
  {
    title: '우선순위 액션 플랜',
    desc: '영향도·난이도 기준 우선순위와 함께 빠른 수정 vs 구조 개선을 명확하게 구분합니다.',
  },
  {
    title: '운영 준비 체크리스트',
    desc: '출시 직전 꼭 확인해야 할 항목들을 체크리스트 형태로 제공합니다.',
  },
];

type PreviewCardProps = {
  title: string;
  score: number;
  metrics: { label: string; value: string; positive: boolean }[];
  offset?: string;
  zIndex?: number;
};

function PreviewCard({ title, score, metrics, offset = '', zIndex = 0 }: PreviewCardProps) {
  return (
    <div
      className={`absolute bg-white rounded-xl border border-[#F1F5F9] shadow-[0_4px_16px_rgba(0,0,0,0.07)] p-4 w-full ${offset}`}
      style={{ zIndex }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6D5EF5] mb-0.5">
            CTO Review Report
          </p>
          <p className="text-[13px] font-semibold text-[#121826] leading-snug">{title}</p>
        </div>
        <div className="flex-shrink-0 flex flex-col items-center justify-center w-11 h-11 rounded-lg bg-gradient-to-br from-[#6D5EF5] to-[#4F8CFF] text-white">
          <span className="text-[15px] font-bold leading-none">{score}</span>
          <span className="text-[9px] font-medium opacity-75">/100</span>
        </div>
      </div>
      <div className="space-y-1.5">
        {metrics.map((m) => (
          <div key={m.label} className="flex items-center justify-between gap-2">
            <span className="text-[12px] text-[#64748B]">{m.label}</span>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                m.positive
                  ? 'bg-[#ECFDF3] text-[#027A48]'
                  : 'bg-[#FFFAEB] text-[#B54708]'
              }`}
            >
              {m.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SampleReportSection() {
  return (
    <section
      id="sample-report"
      className="bg-white py-20 md:py-24 overflow-hidden"
      aria-labelledby="sample-report-heading"
    >
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-16 items-center">
          {/* Left — text */}
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-[12px] font-semibold text-[#6D5EF5] uppercase tracking-widest mb-2.5">
                샘플 리포트
              </p>
              <h2
                id="sample-report-heading"
                className="text-[28px] sm:text-[34px] font-bold text-[#121826] leading-[1.3]"
              >
                실제 전달되는 리포트는
                <br />
                <span className="text-[#6D5EF5]">이렇게 생겼습니다</span>
              </h2>
              <p className="mt-4 text-[#64748B] text-[15px] leading-[1.7]">
                단순한 의견이 아닌, 바로 실행 가능한 문서를 제공합니다. 모든 발견 사항은 영향도와
                우선순위 기준으로 정리됩니다.
              </p>
            </div>

            {/* Highlights */}
            <ul className="space-y-3.5">
              {SAMPLE_HIGHLIGHTS.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-md bg-[#6D5EF5]/10 text-[#6D5EF5] text-[12px] font-bold mt-0.5">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-[14px] font-semibold text-[#121826]">{item.title}</p>
                    <p className="text-[14px] text-[#64748B] mt-0.5 leading-snug">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div>
              <a
                href="#cta-form"
                className="inline-flex items-center justify-center h-11 px-6 rounded-lg bg-[#6D5EF5] text-white font-semibold text-[15px] hover:bg-[#5a4de0] active:scale-[0.97] transition-all duration-150 shadow-[0_2px_12px_rgba(109,94,245,0.25)]"
              >
                샘플 리포트 보기
                <svg className="ml-1.5" width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </div>

          {/* Right — stacked preview cards (2 cards) */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[320px] h-[300px]">
              {/* Background card */}
              <PreviewCard
                title="SaaS 관리자 대시보드"
                score={81}
                metrics={[
                  { label: '코드 구조', value: '양호', positive: true },
                  { label: '성능', value: '개선 필요', positive: false },
                  { label: '운영 준비도', value: '양호', positive: true },
                ]}
                offset="top-8 left-5 right-0 rotate-2 opacity-55 scale-[0.96]"
                zIndex={0}
              />

              {/* Front card */}
              <PreviewCard
                title="바이브코딩 예약 플랫폼"
                score={87}
                metrics={[
                  { label: '코드 구조', value: '양호', positive: true },
                  { label: '보안 점검', value: '주의 필요', positive: false },
                  { label: '인프라 안정성', value: '양호', positive: true },
                  { label: '성능 최적화', value: '개선 필요', positive: false },
                ]}
                offset="top-0 left-0 right-5"
                zIndex={1}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
