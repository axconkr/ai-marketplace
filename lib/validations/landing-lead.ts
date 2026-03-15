import { z } from 'zod';

const requiredText = (message: string, minLength = 1) =>
  z
    .string({ required_error: message })
    .trim()
    .min(minLength, message);

export const landingLeadSchema = z.object({
  name: requiredText('이름을 입력해주세요.'),
  email: z
    .string({ required_error: '이메일을 입력해주세요.' })
    .trim()
    .min(1, '이메일을 입력해주세요.')
    .email('올바른 이메일을 입력해주세요.'),
  contact: requiredText('연락처를 입력해주세요.'),
  kakaoId: requiredText('카톡아이디를 입력해주세요.'),
  job: requiredText('하는 일을 입력해주세요.'),
  serviceSummary: requiredText('서비스 설명을 입력해주세요.', 10),
  reviewRequest: requiredText('검토 요청 내용을 입력해주세요.', 10),
});

export type LandingLeadInput = z.infer<typeof landingLeadSchema>;
