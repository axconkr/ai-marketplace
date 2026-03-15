'use client';

import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LandingLeadInput, landingLeadSchema } from '@/lib/validations/landing-lead';

const fields: Array<{ name: keyof LandingLeadInput; label: string; placeholder: string; multiline?: boolean }> = [
  { name: 'name', label: '이름', placeholder: '이름을 입력해주세요' },
  { name: 'email', label: '이메일', placeholder: 'name@example.com' },
  { name: 'contact', label: '연락처', placeholder: '010-1234-5678' },
  { name: 'kakaoId', label: '카톡아이디', placeholder: '카카오톡 ID를 입력해주세요' },
  { name: 'job', label: '하는일', placeholder: '예: 1인 SaaS 개발자' },
  {
    name: 'serviceSummary',
    label: '서비스(상품) 간략 설명',
    placeholder: '어떤 서비스를 만들고 있는지 간단히 설명해주세요',
    multiline: true,
  },
  {
    name: 'reviewRequest',
    label: '기술,운영 요청하기',
    placeholder: '점검받고 싶은 기술 이슈나 출시 전 고민을 적어주세요',
    multiline: true,
  },
];

const emptyValues: LandingLeadInput = {
  name: '',
  email: '',
  contact: '',
  kakaoId: '',
  job: '',
  serviceSummary: '',
  reviewRequest: '',
};

export function LeadRequestForm() {
  const [submitState, setSubmitState] = useState<'idle' | 'success' | 'error'>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const form = useForm<LandingLeadInput>({
    resolver: zodResolver(landingLeadSchema),
    defaultValues: emptyValues,
  });

  const groupedFields = useMemo(() => fields.slice(0, 5), []);
  const detailFields = useMemo(() => fields.slice(5), []);

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitState('idle');
    setFeedbackMessage('');

    try {
      const response = await fetch('/api/landing-leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error('검토 요청 접수에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }

      form.reset(emptyValues);
      setSubmitState('success');
      setFeedbackMessage('검토 요청이 접수되었습니다. 확인 후 빠르게 연락드릴게요.');
    } catch (error) {
      setSubmitState('error');
      setFeedbackMessage(
        error instanceof Error ? error.message : '검토 요청 접수에 실패했습니다. 잠시 후 다시 시도해주세요.'
      );
    }
  });

  return (
    <section id="lead-request-form" className="rounded-[2rem] border border-[#d5cec3] bg-white/95 p-6 shadow-[0_24px_70px_-45px_rgba(25,28,20,0.45)] sm:p-8">
      <Card className="border-none bg-transparent shadow-none">
        <CardHeader className="px-0 pt-0">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5d6f57]">CTO Review Request</p>
          <CardTitle className="text-3xl text-[#1f2f1d]">현직 CTO에게 바이브코딩 검증을 요청하세요</CardTitle>
          <CardDescription className="text-base leading-relaxed text-[#5a6254]">
            바이브코딩으로 만든 서비스의 코드·보안·인프라를 현직 CTO가 직접 검증합니다. 검증 후 운영 전문 업체가 실제 서비스 운영을 지원합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                {groupedFields.map((fieldConfig) => (
                  <FormField
                    key={fieldConfig.name}
                    control={form.control}
                    name={fieldConfig.name}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{fieldConfig.label}</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder={fieldConfig.placeholder} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>

              <div className="space-y-4">
                {detailFields.map((fieldConfig) => (
                  <FormField
                    key={fieldConfig.name}
                    control={form.control}
                    name={fieldConfig.name}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{fieldConfig.label}</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder={fieldConfig.placeholder} rows={fieldConfig.name === 'reviewRequest' ? 6 : 4} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>

              <div className="flex flex-col gap-3 border-t border-[#e8e2d8] pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-[#6a7263]">입력해주신 정보는 기술 검토와 후속 연락 목적에만 사용됩니다.</p>
                <Button type="submit" className="rounded-full bg-[#1f2f1d] px-6 text-white hover:bg-[#2b4428]" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      전송 중...
                    </>
                  ) : (
                    <>
                      검토 요청 보내기
                      <Send className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>

              {submitState !== 'idle' && feedbackMessage ? (
                <div
                  className={
                    submitState === 'success'
                      ? 'rounded-2xl border border-[#bad5c0] bg-[#edf7ef] px-4 py-3 text-sm text-[#255232]'
                      : 'rounded-2xl border border-[#edc6c6] bg-[#fff4f2] px-4 py-3 text-sm text-[#8a2f2f]'
                  }
                  role="status"
                >
                  {feedbackMessage}
                </div>
              ) : null}
            </form>
          </Form>
        </CardContent>
      </Card>
    </section>
  );
}
