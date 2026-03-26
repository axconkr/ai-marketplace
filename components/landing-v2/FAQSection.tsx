'use client';

import { useState } from 'react';

import { faqItems } from '@/data/landingContent';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section
      id="faq"
      className="bg-[#FAFBFD] py-20 md:py-24"
      aria-labelledby="faq-heading"
    >
      <div className="max-w-[1280px] mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-12">
          <p className="text-[12px] font-semibold text-[#6D5EF5] uppercase tracking-widest mb-2.5">
            FAQ
          </p>
          <h2
            id="faq-heading"
            className="text-[28px] sm:text-[34px] font-bold text-[#121826]"
          >
            자주 묻는 질문
          </h2>
        </div>

        {/* Accordion */}
        <dl className="max-w-2xl mx-auto divide-y divide-[#F1F5F9] border border-[#F1F5F9] rounded-xl overflow-hidden bg-white">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div key={index}>
                <dt>
                  <button
                    type="button"
                    onClick={() => toggle(index)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-[#FAFBFD] transition-colors duration-150"
                  >
                    <span className="text-[15px] font-semibold text-[#121826] leading-snug">
                      {item.q}
                    </span>
                    {/* +/- icon */}
                    <span
                      className={`flex-shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full transition-colors duration-200 ${
                        isOpen
                          ? 'bg-[#6D5EF5] text-white'
                          : 'bg-[#F1F5F9] text-[#64748B]'
                      }`}
                      aria-hidden="true"
                    >
                      <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                        {isOpen ? (
                          <path
                            d="M3 7h8"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                          />
                        ) : (
                          <>
                            <path
                              d="M7 3v8"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                            />
                            <path
                              d="M3 7h8"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                            />
                          </>
                        )}
                      </svg>
                    </span>
                  </button>
                </dt>
                <dd
                  className={`overflow-hidden transition-all duration-200 ease-in-out ${
                    isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                  aria-hidden={!isOpen}
                >
                  <p className="px-6 pb-5 text-[14px] text-[#64748B] leading-[1.7] border-t border-[#F1F5F9] pt-3.5">
                    {item.a}
                  </p>
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
