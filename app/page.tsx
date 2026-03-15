import type { Metadata } from 'next';
import Link from 'next/link';

import { FaqSection } from '@/components/landing/faq-section';
import { FinalCta } from '@/components/landing/final-cta';
import { HeroSection } from '@/components/landing/hero-section';
import { JsonLd } from '@/components/landing/json-ld';
import { LeadRequestForm } from '@/components/landing/lead-request-form';
import { TrustSection } from '@/components/landing/trust-section';
import { ValuePillars } from '@/components/landing/value-pillars';

export const metadata: Metadata = {
  title: 'VIBE CTO | 바이브코딩 배포 전 현직 CTO 검증 & 운영 전문 업체 지원',
  description:
    '바이브코딩으로 만든 서비스를 배포 전에 현직 CTO가 직접 검증합니다. 코드 리뷰, 보안 점검, 인프라 검토 후 운영 전문 업체가 상시 지원하여 실제 서비스 운영까지 도와드립니다.',
  alternates: {
    canonical: '/',
  },
};

const displayFontClassName = 'font-display-app';
const bodyFontClassName = 'font-sans-app';

function LandingReveal({
  children,
  delay,
}: {
  children: React.ReactNode;
  delay: string;
}) {
  return (
    <div
      className="landing-reveal"
      data-testid="landing-reveal"
      data-reveal-delay={delay}
      style={{ animationDelay: delay }}
    >
      {children}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className={`${bodyFontClassName} min-h-screen bg-[#f6f1e8] text-[#1e1e1e]`}>
      <JsonLd />
      <div className="mx-auto max-w-6xl px-5 pb-16 pt-8 sm:px-8 sm:pb-20 sm:pt-12 lg:px-10">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="text-sm font-semibold tracking-[0.2em] text-[#4f5d4a]" aria-label="VIBE CTO 홈">
            VIBE CTO
          </Link>
          <nav className="flex flex-wrap items-center gap-2">
            <Link
              href="/login"
              className="rounded-full border border-[#1e1e1e]/15 bg-white px-4 py-2 text-sm font-semibold text-[#1f2f1d] transition hover:border-[#1f2f1d]/40 hover:bg-[#f0ece4]"
            >
              로그인
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-[#1f2f1d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#263c23]"
            >
              회원가입
            </Link>
          </nav>
        </header>

        <main className="mt-10 space-y-8 sm:mt-14 sm:space-y-10">
          <LandingReveal delay="0ms">
            <HeroSection displayClassName={displayFontClassName} />
          </LandingReveal>
          <LandingReveal delay="120ms">
            <ValuePillars />
          </LandingReveal>
          <LandingReveal delay="240ms">
            <TrustSection />
          </LandingReveal>
          <LandingReveal delay="360ms">
            <FaqSection />
          </LandingReveal>
          <LandingReveal delay="480ms">
            <LeadRequestForm />
          </LandingReveal>
          <LandingReveal delay="600ms">
            <FinalCta />
          </LandingReveal>
        </main>

        <footer className="mt-10 border-t border-[#ddd5c8] pt-6 text-sm text-[#677061]">
          © 2026 VIBE CTO. CTO 검증 · 비즈니스 검토 · 운영 지원 · 마케팅 지원으로 바이브코딩을 실제 서비스로.
        </footer>
      </div>
    </div>
  );
}
