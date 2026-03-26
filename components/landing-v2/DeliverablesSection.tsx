import { deliverables } from '@/data/landingContent';

const CARD_ICONS = [
  // Shield
  <svg key="0" width="20" height="20" viewBox="0 0 22 22" fill="none" aria-hidden="true">
    <path d="M11 2L3 5.5V10c0 4.42 3.4 8.56 8 9.56 4.6-1 8-5.14 8-9.56V5.5L11 2z" stroke="#6D5EF5" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M7.5 11l2.5 2.5 4.5-5" stroke="#6D5EF5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>,
  // List doc
  <svg key="1" width="20" height="20" viewBox="0 0 22 22" fill="none" aria-hidden="true">
    <rect x="3" y="3" width="16" height="16" rx="3" stroke="#4F8CFF" strokeWidth="1.5" />
    <path d="M7 8h8M7 11h8M7 14h5" stroke="#4F8CFF" strokeWidth="1.5" strokeLinecap="round" />
  </svg>,
  // Book
  <svg key="2" width="20" height="20" viewBox="0 0 22 22" fill="none" aria-hidden="true">
    <path d="M4 4h6a3 3 0 013 3v11a2 2 0 00-2-2H4V4z" stroke="#6D5EF5" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M18 4h-6a3 3 0 00-3 3v11a2 2 0 012-2h7V4z" stroke="#6D5EF5" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>,
  // Trending up
  <svg key="3" width="20" height="20" viewBox="0 0 22 22" fill="none" aria-hidden="true">
    <path d="M3 15l5-5 4 4 6-8" stroke="#4F8CFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 6h3v3" stroke="#4F8CFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>,
];

const LEFT_BORDER_COLORS = [
  'border-l-[#6D5EF5]',
  'border-l-[#4F8CFF]',
  'border-l-[#6D5EF5]',
  'border-l-[#4F8CFF]',
];

const ICON_BG_COLORS = [
  'bg-[#F3F1FF]',
  'bg-[#EAF1FF]',
  'bg-[#F3F1FF]',
  'bg-[#EAF1FF]',
];

export default function DeliverablesSection() {
  return (
    <section
      id="deliverables"
      className="bg-[#FAFBFD] py-20 md:py-24"
      aria-labelledby="deliverables-heading"
    >
      <div className="max-w-[1280px] mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-12">
          <p className="text-[12px] font-semibold text-[#6D5EF5] uppercase tracking-widest mb-2.5">
            결과물
          </p>
          <h2
            id="deliverables-heading"
            className="text-[28px] sm:text-[34px] font-bold text-[#121826]"
          >
            48시간 안에 받는 결과물
          </h2>
          <p className="mt-3.5 text-[#64748B] text-[15px] max-w-lg mx-auto leading-[1.7]">
            검증 완료 후 바로 실행에 옮길 수 있는 구체적인 문서를 전달합니다.
          </p>
        </div>

        {/* Cards grid */}
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {deliverables.map((card, index) => (
            <li
              key={index}
              className={`group bg-white rounded-xl border border-[#F1F5F9] border-l-[3px] ${LEFT_BORDER_COLORS[index]} hover:border-[#F1F5F9] hover:border-l-[3px] hover:${LEFT_BORDER_COLORS[index]} transition-colors duration-200`}
            >
              <div className="p-6">
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${ICON_BG_COLORS[index]} mb-4`}>
                  {CARD_ICONS[index]}
                </div>

                {/* Title */}
                <h3 className="text-[16px] font-semibold text-[#121826] mb-3 leading-snug">
                  {card.title}
                </h3>

                {/* Bullet list */}
                <ul className="space-y-2">
                  {card.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <svg
                        className="flex-shrink-0 mt-[3px]"
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M3 7l2.5 2.5 5.5-5"
                          stroke="#94A3B8"
                          strokeWidth="1.3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="text-[14px] text-[#64748B] leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
