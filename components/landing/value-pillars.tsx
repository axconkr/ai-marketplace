import { Compass, LifeBuoy, Megaphone, Sparkles } from 'lucide-react';

const pillars = [
  {
    title: '현직 CTO의 배포 전 검증',
    description: '바이브코딩으로 만든 코드를 현직 CTO들이 직접 리뷰합니다. 보안 취약점, 성능 병목, 구조적 문제를 배포 전에 잡아드립니다.',
    icon: Sparkles,
  },
  {
    title: '비즈니스 전문가의 수익 연결 안정성 검토',
    description: '비즈니스 전문가가 트래픽 증가, 결제, 운영 효율까지 실제 매출 흐름에 맞춘 안정성을 검토하고 수익으로 이어지는 개선 우선순위를 제공합니다.',
    icon: Compass,
  },
  {
    title: '운영 전문 업체의 운영 지원',
    description: '오픈 이후에도 걱정 없습니다. 서버 관리, 장애 대응, 스케일링까지 운영 전문 업체가 실제 서비스 운영을 함께합니다.',
    icon: LifeBuoy,
  },
  {
    title: '출시 이후 전문 마케팅 업체의 지원',
    description: '서비스 출시 후 성장까지 함께합니다. 전문 마케팅 업체가 고객 확보, 광고 운영, 그로스 전략까지 지원하여 실제 매출로 연결합니다.',
    icon: Megaphone,
  },
];

export function ValuePillars() {
  return (
    <section aria-label="VIBE CTO 핵심 서비스" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {pillars.map((pillar) => {
        const Icon = pillar.icon;

        return (
          <article key={pillar.title} className="rounded-[1.8rem] border border-[#ddd6ca] bg-white/90 p-6 shadow-[0_24px_60px_-50px_rgba(38,44,27,0.45)]">
            <div className="inline-flex rounded-2xl bg-[#edf4ea] p-3 text-[#42654d]">
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-[#223120]">{pillar.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#5c6458]">{pillar.description}</p>
          </article>
        );
      })}
    </section>
  );
}
