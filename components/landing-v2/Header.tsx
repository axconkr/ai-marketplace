'use client';

import { useEffect, useState } from 'react';

const NAV_LINKS = [
  { label: '서비스 소개', href: '#deliverables' },
  { label: '프로세스', href: '#process' },
  { label: 'FAQ', href: '#faq' },
  { label: '문의하기', href: '#cta-form' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavClick = () => setMobileOpen(false);

  return (
    <header
      className={`font-pretendard fixed top-0 left-0 right-0 z-50 transition-all duration-200 border-b border-[#F1F5F9] bg-white/96 backdrop-blur-md ${
        scrolled ? 'h-[56px]' : 'h-[64px]'
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <a
          href="#"
          className="flex items-center gap-2 group"
          aria-label="VIBE CTO 홈으로"
        >
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-[#6D5EF5] text-white text-[11px] font-bold tracking-tight select-none">
            V
          </span>
          <span className="text-[#121826] font-semibold text-[15px] leading-none tracking-tight">
            VIBE<span className="text-[#6D5EF5]"> CTO</span>
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5" aria-label="주요 메뉴">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-3.5 py-2 rounded-lg text-[14px] font-medium text-[#64748B] hover:text-[#121826] hover:bg-[#F8FAFC] transition-colors duration-150"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="#cta-form"
            className="inline-flex items-center justify-center h-9 px-4 rounded-lg bg-[#6D5EF5] text-white text-[13px] font-semibold hover:bg-[#5a4de0] active:scale-[0.97] transition-all duration-150"
          >
            검증 요청
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col justify-center items-center w-9 h-9 rounded-lg hover:bg-[#F8FAFC] transition-colors duration-150 gap-[5px]"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={mobileOpen}
        >
          <span
            className={`block w-5 h-[1.5px] bg-[#121826] rounded transition-all duration-200 ${mobileOpen ? 'rotate-45 translate-y-[6.5px]' : ''}`}
          />
          <span
            className={`block w-5 h-[1.5px] bg-[#121826] rounded transition-all duration-200 ${mobileOpen ? 'opacity-0' : ''}`}
          />
          <span
            className={`block w-5 h-[1.5px] bg-[#121826] rounded transition-all duration-200 ${mobileOpen ? '-rotate-45 -translate-y-[6.5px]' : ''}`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden absolute top-full left-0 right-0 bg-white border-b border-[#F1F5F9] shadow-md overflow-hidden transition-all duration-200 ${
          mobileOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="flex flex-col px-6 py-3 gap-0.5" aria-label="모바일 메뉴">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={handleNavClick}
              className="px-3.5 py-2.5 rounded-lg text-[14px] font-medium text-[#64748B] hover:text-[#121826] hover:bg-[#F8FAFC] transition-colors duration-150"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#cta-form"
            onClick={handleNavClick}
            className="mt-2 mb-1 inline-flex items-center justify-center h-10 px-5 rounded-lg bg-[#6D5EF5] text-white text-[14px] font-semibold hover:bg-[#5a4de0] transition-colors duration-150"
          >
            검증 요청
          </a>
        </nav>
      </div>
    </header>
  );
}
