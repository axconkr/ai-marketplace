import { processSteps } from '@/data/landingContent';

export default function ProcessSection() {
  return (
    <section
      id="process"
      className="bg-[#F8FAFC] py-20 md:py-24"
      aria-labelledby="process-heading"
    >
      <div className="max-w-[1280px] mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-12">
          <p className="text-[12px] font-semibold text-[#6D5EF5] uppercase tracking-widest mb-2.5">
            프로세스
          </p>
          <h2
            id="process-heading"
            className="text-[28px] sm:text-[34px] font-bold text-[#121826]"
          >
            진행 방식은 간단합니다
          </h2>
          <p className="mt-3.5 text-[#64748B] text-[15px] max-w-sm mx-auto leading-[1.7]">
            복잡한 절차 없이 4단계로 빠르게 진행됩니다.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Desktop connector line */}
          <div
            className="hidden md:block absolute top-[22px] left-0 right-0 h-px bg-[#E2E8F0] mx-[calc(12.5%+22px)]"
            aria-hidden="true"
          />

          <ol className="grid grid-cols-1 md:grid-cols-4 gap-7 md:gap-5 relative">
            {processSteps.map((step, index) => (
              <li key={step.step} className="flex md:flex-col items-start md:items-center gap-4 md:gap-0 md:text-center">
                {/* Number circle */}
                <div className="flex-shrink-0 md:mb-4 relative z-10">
                  <div className="w-11 h-11 rounded-full bg-white border border-[#6D5EF5]/25 flex items-center justify-center shadow-sm">
                    <span className="text-[#6D5EF5] font-bold text-[15px] leading-none">
                      {step.step}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col gap-1.5 md:px-2">
                  <h3 className="text-[15px] font-semibold text-[#121826] leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-[14px] text-[#64748B] leading-relaxed">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
