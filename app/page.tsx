import type { Metadata } from 'next';

import {
  Header,
  HeroSection,
  TrustBand,
  DeliverablesSection,
  SampleReportSection,
  ProcessSection,
  TargetCustomerSection,
  FAQSection,
  CTAFormSection,
  Footer,
} from '@/components/landing-v2';
import { JsonLd } from '@/components/landing/json-ld';

export const metadata: Metadata = {
  title: 'VIBE CTO | 바이브코딩 출시 전 CTO 검증 & 운영·성장 지원',
  description:
    '바이브코딩으로 만든 서비스를 출시 전에 현직 CTO가 검증합니다. 코드·보안·인프라 점검과 48시간 내 핵심 리포트, 운영·성장 파트너 연결까지 제공합니다.',
  alternates: {
    canonical: '/',
  },
};

export default function HomePage() {
  return (
    <div className="font-pretendard landing-v2 min-h-screen bg-[#FAFBFD] text-[#121826]">
      <JsonLd />
      <Header />
      <main>
        <HeroSection />
        <TrustBand />
        <DeliverablesSection />
        <SampleReportSection />
        <ProcessSection />
        <TargetCustomerSection />
        <FAQSection />
        <CTAFormSection />
      </main>
      <Footer />
    </div>
  );
}
