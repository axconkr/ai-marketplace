import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function HeroSection({ displayClassName }: { displayClassName: string }) {
  return (
    <section aria-labelledby="hero-heading" className="relative overflow-hidden rounded-[2.4rem] border border-[#d8d0c4] bg-[radial-gradient(circle_at_top_left,_rgba(196,224,204,0.72),_transparent_28%),linear-gradient(135deg,#fffdf8_0%,#f2ebdf_52%,#e6dfd1_100%)] px-7 py-8 shadow-[0_30px_80px_-50px_rgba(34,39,24,0.45)] sm:px-10 sm:py-12 lg:px-12 lg:py-14">
      <div className="absolute -right-14 top-8 h-40 w-40 rounded-full bg-[#ffc98a]/45 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-[#9bc3a6]/35 blur-3xl" />
      <div className="relative grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <div>
          <p className="inline-flex items-center rounded-full border border-[#294029]/10 bg-white/80 px-3 py-1 text-xs font-semibold tracking-[0.16em] text-[#4d6248]">
            VIBE CODING → REAL SERVICE
          </p>
          <h1 id="hero-heading" className={`${displayClassName} mt-5 text-[2.4rem] leading-[1.05] text-[#1f2f1d] sm:text-[3.5rem] lg:text-[4.35rem]`}>
            바이브코딩, 배포 전에
            <br className="hidden sm:block" /> 현직 CTO가 검증합니다
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#485044] sm:text-lg">
            바이브코딩으로 만든 서비스, 배포 전에 현직 CTO들이 직접 검증하고 비즈니스 전문가가 수익성을 점검합니다.
            오픈 이후에는 운영 전문 업체가 안정적으로 운영하고, 전문 마케팅 업체가 성장까지 지원합니다.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="#lead-request-form"
              className="inline-flex items-center justify-center rounded-full bg-[#1f2f1d] px-6 py-3 text-sm font-semibold text-white transition hover:translate-y-[-1px] hover:bg-[#2c4528]"
            >
              CTO 검증 요청하기
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border border-[#1f2f1d]/15 bg-white/90 px-6 py-3 text-sm font-semibold text-[#1f2f1d] transition hover:border-[#1f2f1d]/40 hover:bg-white"
            >
              로그인
            </Link>
            <Link
              href="https://market.vibe-cto.net"
              className="inline-flex items-center justify-center rounded-full border border-[#1f2f1d]/15 bg-[#f4efe7] px-6 py-3 text-sm font-semibold text-[#1f2f1d] transition hover:border-[#1f2f1d]/40 hover:bg-[#f8f4ee]"
            >
              AI Market 바로가기
            </Link>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/70 bg-white/80 p-6 backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5b7057]">What You Get</p>
          <div className="mt-5 space-y-4">
            {[
              '현직 CTO가 배포 전 코드·인프라·보안 직접 검증',
              '비즈니스 전문가의 수익 연결 안정성 검토',
              '운영 전문 업체의 실제 서비스 운영 지원',
              '전문 마케팅 업체의 출시 후 성장 지원',
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-[#ebe4d9] bg-[#faf7f2] px-4 py-4 text-sm text-[#394334] sm:text-base">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
