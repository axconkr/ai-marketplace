import Link from 'next/link';

export function FinalCta() {
  return (
    <section aria-labelledby="cta-heading" className="rounded-[2rem] bg-[#1f2f1d] px-7 py-8 text-white shadow-[0_30px_90px_-55px_rgba(18,22,16,0.7)] sm:px-8 sm:py-10">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#b9d0ba]">Ready To Launch</p>
          <h2 id="cta-heading" className="mt-3 text-3xl font-semibold">현직 CTO 검증 + 운영 전문 업체 지원으로 실제 서비스를 시작하세요</h2>
        </div>
        <div className="flex flex-wrap gap-3" aria-label="final cta actions">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#1f2f1d] transition hover:bg-[#f2efe9]"
          >
            로그인
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/5"
          >
            회원가입
          </Link>
          <Link
            href="https://market.vibe-cto.net"
            className="inline-flex items-center justify-center rounded-full border border-[#8ba08b] bg-[#31442f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#3a5137]"
          >
            AI Market 바로가기
          </Link>
        </div>
      </div>
    </section>
  );
}
