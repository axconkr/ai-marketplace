import { targetCustomers } from '@/data/landingContent';

const BADGE_STYLES: Record<string, string> = {
  개인: 'bg-[#F3F1FF] text-[#6D5EF5]',
  팀: 'bg-[#EAF1FF] text-[#4F8CFF]',
  외주: 'bg-[#ECFDF3] text-[#027A48]',
  의사결정자: 'bg-[#FFF4ED] text-[#C4320A]',
};

const CARD_ICONS = [
  // Person
  <svg key="0" width="22" height="22" viewBox="0 0 28 28" fill="none" aria-hidden="true">
    <circle cx="14" cy="10" r="4" stroke="#6D5EF5" strokeWidth="1.6" />
    <path d="M5 24c0-4.97 4.03-9 9-9s9 4.03 9 9" stroke="#6D5EF5" strokeWidth="1.6" strokeLinecap="round" />
  </svg>,
  // Team
  <svg key="1" width="22" height="22" viewBox="0 0 28 28" fill="none" aria-hidden="true">
    <circle cx="10" cy="10" r="3.5" stroke="#4F8CFF" strokeWidth="1.6" />
    <circle cx="18" cy="10" r="3.5" stroke="#4F8CFF" strokeWidth="1.6" />
    <path d="M3 24c0-3.87 3.13-7 7-7" stroke="#4F8CFF" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M25 24c0-3.87-3.13-7-7-7" stroke="#4F8CFF" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M10 17c1.19-.64 2.5-1 4-1s2.81.36 4 1" stroke="#4F8CFF" strokeWidth="1.6" strokeLinecap="round" />
  </svg>,
  // Code
  <svg key="2" width="22" height="22" viewBox="0 0 28 28" fill="none" aria-hidden="true">
    <rect x="4" y="7" width="20" height="14" rx="3" stroke="#12B76A" strokeWidth="1.6" />
    <path d="M10 13l-3 2 3 2M18 13l3 2-3 2" stroke="#12B76A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15 11l-2 6" stroke="#12B76A" strokeWidth="1.6" strokeLinecap="round" />
  </svg>,
  // Chart / decision
  <svg key="3" width="22" height="22" viewBox="0 0 28 28" fill="none" aria-hidden="true">
    <rect x="4" y="4" width="20" height="20" rx="3" stroke="#F79009" strokeWidth="1.6" />
    <path d="M9 18l4-5 3 3 4-6" stroke="#F79009" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>,
];

const ICON_BG: Record<string, string> = {
  개인: 'bg-[#F3F1FF]',
  팀: 'bg-[#EAF1FF]',
  외주: 'bg-[#ECFDF3]',
  의사결정자: 'bg-[#FFF4ED]',
};

export default function TargetCustomerSection() {
  return (
    <section
      className="bg-white py-20 md:py-24"
      aria-labelledby="target-customer-heading"
    >
      <div className="max-w-[1280px] mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-12">
          <p className="text-[12px] font-semibold text-[#6D5EF5] uppercase tracking-widest mb-2.5">
            대상 고객
          </p>
          <h2
            id="target-customer-heading"
            className="text-[28px] sm:text-[34px] font-bold text-[#121826]"
          >
            이런 팀에 적합합니다
          </h2>
          <p className="mt-3.5 text-[#64748B] text-[15px] max-w-lg mx-auto leading-[1.7]">
            CTO 없이 출시를 앞두고 있거나, 빠르게 만든 서비스가 걱정되신다면 VIBE CTO가 도와드립니다.
          </p>
        </div>

        {/* Cards grid */}
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {targetCustomers.map((customer, index) => {
            const badgeStyle = BADGE_STYLES[customer.badge] ?? 'bg-[#F3F1FF] text-[#6D5EF5]';
            const iconBg = ICON_BG[customer.badge] ?? 'bg-[#F3F1FF]';

            return (
              <li
                key={index}
                className="group bg-[#FAFBFD] rounded-xl border border-[#F1F5F9] p-6 hover:bg-white hover:border-[#E2E8F0] transition-colors duration-200"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`flex-shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-lg ${iconBg} border border-[#F1F5F9]`}>
                    {CARD_ICONS[index]}
                  </div>

                  <div className="flex flex-col gap-1.5 min-w-0">
                    {/* Badge */}
                    <span
                      className={`self-start text-[12px] font-semibold px-2 py-0.5 rounded-full ${badgeStyle}`}
                    >
                      {customer.badge}
                    </span>

                    {/* Title */}
                    <h3 className="text-[15px] font-semibold text-[#121826] leading-snug">
                      {customer.title}
                    </h3>

                    {/* Description */}
                    <p className="text-[14px] text-[#64748B] leading-relaxed">{customer.desc}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
