const FOOTER_LINKS = [
  { label: '서비스 소개', href: '#deliverables' },
  { label: '프로세스', href: '#process' },
  { label: 'FAQ', href: '#faq' },
  { label: '검증 요청', href: '#cta-form' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#121826] text-white" aria-label="사이트 푸터">
      <div className="max-w-[1280px] mx-auto px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Brand column */}
          <div className="flex flex-col gap-3.5 lg:col-span-2">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-[#6D5EF5] text-white text-[11px] font-bold tracking-tight select-none">
                V
              </span>
              <span className="font-semibold text-[15px] text-white tracking-tight">
                VIBE<span className="text-[#6D5EF5]"> CTO</span>
              </span>
            </div>

            {/* Description */}
            <p className="text-[13px] text-white/50 leading-[1.7] max-w-sm">
              바이브코딩으로 만든 서비스의 출시 전 CTO 검증 서비스입니다. 코드·보안·인프라·운영
              리스크를 48시간 안에 점검합니다.
            </p>

            {/* Email */}
            <a
              href="mailto:axconkr@gmail.com"
              className="inline-flex items-center gap-1.5 text-[13px] text-white/50 hover:text-white/80 transition-colors duration-150"
            >
              <svg width="14" height="14" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                <rect x="1" y="3" width="13" height="9" rx="2" stroke="currentColor" strokeWidth="1.2" />
                <path d="M1 5.5l6.5 3.5L14 5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              axconkr@gmail.com
            </a>
          </div>

          {/* Nav links column */}
          <nav aria-label="푸터 메뉴">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-3.5">
              메뉴
            </p>
            <ul className="space-y-2">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-[13px] text-white/50 hover:text-white/80 transition-colors duration-150"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Divider */}
        <div className="mt-10 pt-5 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[12px] text-white/30">
            &copy; {currentYear} VIBE CTO. All rights reserved.
          </p>
          <p className="text-[12px] text-white/20">
            Made with care for vibe-coders
          </p>
        </div>
      </div>
    </footer>
  );
}
