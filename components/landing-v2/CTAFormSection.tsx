'use client';

import { useState } from 'react';

const TRUST_POINTS = [
  '접수 후 24시간 이내 검토 가능 여부 안내',
  '코드 없이 서비스 URL만으로도 시작 가능',
  '결과물은 문서 + 화상 미팅으로 전달',
];

type FormState = 'idle' | 'loading' | 'success' | 'error';

interface FormValues {
  name: string;
  email: string;
  serviceSummary: string;
  reviewRequest: string;
}

const INITIAL_VALUES: FormValues = {
  name: '',
  email: '',
  serviceSummary: '',
  reviewRequest: '',
};

export default function CTAFormSection() {
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormState('loading');
    setErrorMessage('');

    const payload = {
      name: values.name.trim(),
      email: values.email.trim(),
      contact: '',
      kakaoId: '',
      job: '',
      serviceSummary: values.serviceSummary.trim(),
      reviewRequest: values.reviewRequest.trim(),
    };

    try {
      const res = await fetch('/api/landing-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setFormState('success');
        setValues(INITIAL_VALUES);
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMessage(
          data?.error === 'Validation error'
            ? '입력 내용을 다시 확인해주세요.'
            : '요청 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
        );
        setFormState('error');
      }
    } catch {
      setErrorMessage('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      setFormState('error');
    }
  };

  const isLoading = formState === 'loading';

  return (
    <section
      id="cta-form"
      className="bg-white py-20 md:py-24"
      aria-labelledby="cta-form-heading"
    >
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          {/* Left — context */}
          <div className="flex flex-col gap-6 lg:pt-2">
            <div>
              <p className="text-[12px] font-semibold text-[#6D5EF5] uppercase tracking-widest mb-2.5">
                검증 요청
              </p>
              <h2
                id="cta-form-heading"
                className="text-[28px] sm:text-[34px] font-bold text-[#121826] leading-[1.3]"
              >
                출시 전에, CTO 시선으로
                <br />
                <span className="text-[#6D5EF5]">먼저 점검하세요</span>
              </h2>
              <p className="mt-4 text-[#64748B] text-[15px] leading-[1.7]">
                서비스 링크나 설명만 보내주시면 검증 가능 여부를 빠르게 안내해드립니다. 부담 없이
                요청하세요.
              </p>
            </div>

            {/* Trust points */}
            <ul className="space-y-3">
              {TRUST_POINTS.map((point, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#6D5EF5]/10 mt-0.5">
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path
                        d="M2.5 6l2.5 2.5 4.5-5"
                        stroke="#6D5EF5"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="text-[14px] text-[#64748B] leading-snug">{point}</span>
                </li>
              ))}
            </ul>

            {/* Contact note */}
            <div className="inline-flex items-start gap-3 p-4 rounded-lg bg-[#F8FAFC] border border-[#F1F5F9]">
              <span className="flex-shrink-0 mt-0.5 text-[#94A3B8]" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="1.5" y="3.5" width="13" height="9" rx="2" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M1.5 6l6.5 3.5L14.5 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              </span>
              <p className="text-[14px] text-[#64748B] leading-relaxed">
                <span className="font-semibold text-[#121826]">이메일 문의</span>도 환영합니다.{' '}
                <a
                  href="mailto:axconkr@gmail.com"
                  className="text-[#6D5EF5] font-medium hover:underline"
                >
                  axconkr@gmail.com
                </a>
              </p>
            </div>
          </div>

          {/* Right — form card */}
          <div>
            <div className="bg-white rounded-xl border border-[#F1F5F9] shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-7">
              {formState === 'success' ? (
                <SuccessState />
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  {/* Name */}
                  <FormField
                    id="name"
                    label="이름"
                    required
                  >
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      value={values.name}
                      onChange={handleChange}
                      placeholder="홍길동"
                      className={INPUT_CLASS}
                      disabled={isLoading}
                    />
                  </FormField>

                  {/* Email / contact */}
                  <FormField
                    id="email"
                    label="이메일 또는 연락처"
                    required
                    hint="이메일 또는 전화번호"
                  >
                    <input
                      id="email"
                      name="email"
                      type="text"
                      required
                      autoComplete="email"
                      value={values.email}
                      onChange={handleChange}
                      placeholder="hello@example.com"
                      className={INPUT_CLASS}
                      disabled={isLoading}
                    />
                  </FormField>

                  {/* Service link */}
                  <FormField
                    id="serviceSummary"
                    label="서비스 링크 또는 깃허브 주소"
                    required
                    hint="URL 또는 GitHub 주소"
                  >
                    <textarea
                      id="serviceSummary"
                      name="serviceSummary"
                      required
                      rows={3}
                      value={values.serviceSummary}
                      onChange={handleChange}
                      placeholder="https://myservice.com&#10;또는 https://github.com/username/repo"
                      className={`${INPUT_CLASS} resize-none`}
                      disabled={isLoading}
                    />
                  </FormField>

                  {/* Review request */}
                  <FormField
                    id="reviewRequest"
                    label="현재 가장 걱정되는 문제"
                    required
                  >
                    <textarea
                      id="reviewRequest"
                      name="reviewRequest"
                      required
                      rows={3}
                      value={values.reviewRequest}
                      onChange={handleChange}
                      placeholder="예: 보안이 취약한 것 같아서 걱정입니다. 배포 전에 확인받고 싶습니다."
                      className={`${INPUT_CLASS} resize-none`}
                      disabled={isLoading}
                    />
                  </FormField>

                  {/* Error message */}
                  {formState === 'error' && errorMessage && (
                    <div
                      role="alert"
                      className="flex items-start gap-2.5 p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA]"
                    >
                      <svg
                        className="flex-shrink-0 mt-0.5 text-[#F04438]"
                        width="15"
                        height="15"
                        viewBox="0 0 16 16"
                        fill="none"
                        aria-hidden="true"
                      >
                        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                        <path
                          d="M8 5v4M8 11v.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                      <p className="text-[13px] text-[#B91C1C]">{errorMessage}</p>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 rounded-lg bg-[#6D5EF5] text-white font-semibold text-[15px] hover:bg-[#5a4de0] active:scale-[0.98] transition-all duration-150 shadow-[0_2px_12px_rgba(109,94,245,0.25)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin"
                          width="16"
                          height="16"
                          viewBox="0 0 18 18"
                          fill="none"
                          aria-hidden="true"
                        >
                          <circle
                            cx="9"
                            cy="9"
                            r="7"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeOpacity="0.3"
                          />
                          <path
                            d="M9 2a7 7 0 017 7"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                        <span>제출 중...</span>
                      </>
                    ) : (
                      '검증 요청 보내기'
                    )}
                  </button>

                  <p className="text-[12px] text-[#94A3B8] text-center leading-relaxed">
                    요청 정보는 검증 목적으로만 사용되며 외부에 공유되지 않습니다.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

const INPUT_CLASS =
  'w-full h-10 px-3.5 py-2 rounded-lg border border-[#E8EDF5] bg-[#FAFBFD] text-[#121826] text-[14px] placeholder-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/20 focus:border-[#6D5EF5]/60 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed';

function FormField({
  id,
  label,
  required,
  hint,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-semibold text-[#121826]">
        {label}
        {required && (
          <span className="text-[#F04438] ml-1" aria-hidden="true">
            *
          </span>
        )}
        {hint && <span className="ml-1.5 text-[12px] font-normal text-[#94A3B8]">({hint})</span>}
      </label>
      {children}
    </div>
  );
}

function SuccessState() {
  return (
    <div className="flex flex-col items-center text-center gap-5 py-8">
      <div className="w-14 h-14 rounded-full bg-[#ECFDF3] flex items-center justify-center">
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <path
            d="M10 16l4.5 4.5L22 11"
            stroke="#12B76A"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="space-y-1.5">
        <h3 className="text-[18px] font-semibold text-[#121826]">검증 요청이 접수되었습니다</h3>
        <p className="text-[#64748B] text-[14px] leading-[1.7] max-w-[280px]">
          24시간 이내로 검토 가능 여부를 안내해드리겠습니다. 감사합니다.
        </p>
      </div>
      <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#F8FAFC] border border-[#F1F5F9] text-[#64748B] text-[13px]">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <rect x="1.5" y="3.5" width="13" height="9" rx="2" stroke="currentColor" strokeWidth="1.3" />
          <path d="M1.5 6l6.5 3.5L14.5 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
        axconkr@gmail.com으로 확인 메일이 발송됩니다
      </div>
    </div>
  );
}
