import { trustBandItems } from '@/data/landingContent';

const TRUST_ICONS = [
  // Clock
  <svg key="0" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="6.5" stroke="#64748B" strokeWidth="1.3" />
    <path d="M8 5v3.5l2 1.5" stroke="#64748B" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>,
  // Search
  <svg key="1" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="7" cy="7" r="4.5" stroke="#64748B" strokeWidth="1.3" />
    <path d="M10.5 10.5l2.5 2.5" stroke="#64748B" strokeWidth="1.3" strokeLinecap="round" />
  </svg>,
  // List
  <svg key="2" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3 5h10M3 8h10M3 11h6" stroke="#64748B" strokeWidth="1.3" strokeLinecap="round" />
  </svg>,
  // Link / connect
  <svg key="3" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M6 10l-1.5 1.5a2.5 2.5 0 000 3.5 2.5 2.5 0 003.5 0l3-3a2.5 2.5 0 000-3.5l-.5-.5" stroke="#64748B" strokeWidth="1.3" strokeLinecap="round" />
    <path d="M10 6l1.5-1.5a2.5 2.5 0 000-3.5 2.5 2.5 0 00-3.5 0l-3 3a2.5 2.5 0 000 3.5l.5.5" stroke="#64748B" strokeWidth="1.3" strokeLinecap="round" />
  </svg>,
];

export default function TrustBand() {
  return (
    <section className="bg-[#F8FAFC] border-y border-[#F1F5F9]" aria-label="서비스 핵심 가치">
      <div className="max-w-[1280px] mx-auto px-6 py-8">
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-y-5 gap-x-4">
          {trustBandItems.map((item, index) => (
            <li
              key={index}
              className="flex items-center gap-2.5"
            >
              <span className="flex-shrink-0 text-[#94A3B8]" aria-hidden="true">
                {TRUST_ICONS[index]}
              </span>
              <span className="text-[13px] font-medium text-[#64748B] leading-snug">
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
