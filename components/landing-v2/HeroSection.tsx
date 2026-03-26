import { heroContent } from '@/data/landingContent';

const REPORT_STATUS_ITEMS = [
  { label: '코드 구조', status: '양호', color: 'success' },
  { label: '보안 점검', status: '주의 필요', color: 'warning' },
  { label: '인프라 안정성', status: '양호', color: 'success' },
  { label: '성능 최적화', status: '개선 필요', color: 'warning' },
] as const;

const statusStyles = {
  success: {
    dot: 'bg-[#12B76A]',
    badge: 'bg-[#ECFDF3] text-[#027A48]',
  },
  warning: {
    dot: 'bg-[#F79009]',
    badge: 'bg-[#FFFAEB] text-[#B54708]',
  },
};

function ReportCard() {
  return (
    <div className="relative">
      <div className="absolute -bottom-2 left-5 right-5 h-full rounded-xl bg-[#6D5EF5]/8 blur-md" />
      <div className="relative bg-white rounded-xl border border-[#F1F5F9] shadow-[0_4px_24px_rgba(0,0,0,0.07)] p-5 space-y-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#6D5EF5] mb-1">
              CTO Review Report
            </p>
            <h3 className="text-[#121826] font-semibold text-[15px] leading-snug">
              검증 리포트 미리보기
            </h3>
            <p className="text-[#94A3B8] text-[12px] mt-0.5">baroquesoftware.com</p>
          </div>
          {/* Score badge */}
          <div className="flex-shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#4F8CFF] text-white">
            <span className="text-[20px] font-bold leading-none">87</span>
            <span className="text-[10px] font-medium opacity-75 mt-0.5">/100</span>
          </div>
        </div>

        <div className="h-px bg-[#F1F5F9]" />

        {/* Status items */}
        <ul className="space-y-2.5">
          {REPORT_STATUS_ITEMS.map((item) => {
            const s = statusStyles[item.color];
            return (
              <li key={item.label} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`flex-shrink-0 w-1.5 h-1.5 rounded-full ${s.dot}`} />
                  <span className="text-[13px] text-[#121826] font-medium truncate">{item.label}</span>
                </div>
                <span
                  className={`flex-shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full ${s.badge}`}
                >
                  {item.status}
                </span>
              </li>
            );
          })}
        </ul>

        <div className="h-px bg-[#F1F5F9]" />

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-[#94A3B8]">검토 완료: 2026-03-24</span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#ECFDF3] text-[#027A48]">
            <svg width="9" height="9" viewBox="0 0 10 10" fill="none" className="flex-shrink-0">
              <circle cx="5" cy="5" r="5" fill="#12B76A" />
              <path d="M3 5l1.5 1.5L7 3.5" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Ready to Launch
          </span>
        </div>
      </div>
    </div>
  );
}

export default function HeroSection() {
  const lines = heroContent.h1.split('\n');

  return (
    <section
      className="relative overflow-hidden pt-[64px]"
      aria-labelledby="hero-heading"
    >
      {/* Gradient bg */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: 'linear-gradient(150deg, #F4F2FF 0%, #EBF2FF 45%, #FAFBFD 100%)',
        }}
      />
      {/* Decorative orbs — subtle */}
      <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] rounded-full bg-[#6D5EF5]/5 blur-3xl translate-x-1/3 -translate-y-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 -z-10 w-[350px] h-[350px] rounded-full bg-[#4F8CFF]/5 blur-3xl -translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* Left column */}
          <div className="flex flex-col items-start gap-5">
            {/* Eyebrow badge */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#6D5EF5]/10 text-[#6D5EF5] text-[13px] font-semibold border border-[#6D5EF5]/15">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6D5EF5]" />
              {heroContent.eyebrow}
            </span>

            {/* H1 */}
            <h1
              id="hero-heading"
              className="text-[40px] sm:text-[48px] lg:text-[52px] font-bold text-[#121826] leading-[1.3]"
            >
              {lines.map((line, i) => (
                <span key={i} className={i === 1 ? 'block text-[#6D5EF5]' : 'block'}>
                  {line}
                </span>
              ))}
            </h1>

            {/* Supporting text */}
            <p className="text-[#64748B] text-[15px] leading-[1.7] max-w-[460px]">
              {heroContent.supporting}
            </p>

            {/* Badges */}
            <ul className="flex flex-wrap gap-2" aria-label="서비스 특징">
              {heroContent.badges.map((badge) => (
                <li
                  key={badge}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white border border-[#E8EDF5] text-[#121826] text-[13px] font-medium"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2.5 6l2 2 4.5-4.5" stroke="#6D5EF5" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {badge}
                </li>
              ))}
            </ul>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-3 pt-1">
              <a
                href="#cta-form"
                className="inline-flex items-center justify-center h-11 px-6 rounded-lg bg-[#6D5EF5] text-white font-semibold text-[15px] hover:bg-[#5a4de0] active:scale-[0.97] transition-all duration-150 shadow-[0_2px_12px_rgba(109,94,245,0.3)]"
              >
                {heroContent.ctaPrimary}
                <svg className="ml-1.5" width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <a
                href="#sample-report"
                className="inline-flex items-center justify-center h-11 px-6 rounded-lg bg-white text-[#121826] font-semibold text-[15px] border border-[#E8EDF5] hover:border-[#6D5EF5]/30 hover:bg-[#FAFBFD] active:scale-[0.97] transition-all duration-150"
              >
                {heroContent.ctaSecondary}
              </a>
            </div>
          </div>

          {/* Right column */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-[340px]">
              <ReportCard />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
