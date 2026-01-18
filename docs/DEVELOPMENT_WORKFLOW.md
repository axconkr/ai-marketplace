# 개발 워크플로우 가이드

> **목적**: AI Marketplace 프로젝트의 효율적인 개발을 위한 실무 가이드
> **대상**: 개발자, 기여자
> **최종 수정**: 2024-12

---

## 📋 목차

- [일일 개발 워크플로우](#일일-개발-워크플로우)
- [기능 개발 프로세스](#기능-개발-프로세스)
- [코드 리뷰 가이드](#코드-리뷰-가이드)
- [디버깅 전략](#디버깅-전략)
- [성능 최적화](#성능-최적화)
- [배포 프로세스](#배포-프로세스)
- [트러블슈팅](#트러블슈팅)

---

## 🌅 일일 개발 워크플로우

### 개발 시작 체크리스트

```bash
# 1. 최신 코드 동기화
git checkout develop
git pull upstream develop

# 2. 의존성 업데이트 확인
pnpm install

# 3. 개발 환경 실행
docker-compose up -d          # PostgreSQL 시작
pnpm dev                       # Next.js 개발 서버
npx prisma studio             # DB GUI (선택사항)

# 4. 타입 체크 및 린트
pnpm type-check
pnpm lint
```

### 개발 종료 체크리스트

```bash
# 1. 변경사항 확인
git status
git diff

# 2. 테스트 실행
pnpm test

# 3. 커밋 (필요 시)
git add .
git commit -m "feat: add feature description"

# 4. 환경 정리
docker-compose down           # PostgreSQL 종료 (선택사항)
```

---

## 🚀 기능 개발 프로세스

### 1. 기획 및 설계

#### Issue 생성
```markdown
**제목**: [Feature] 사용자 프로필 편집 기능

**배경**
사용자가 자신의 프로필 정보를 수정할 수 있어야 합니다.

**요구사항**
- [ ] 이름, 소개, 프로필 이미지 수정 가능
- [ ] 실시간 미리보기
- [ ] 유효성 검증
- [ ] 낙관적 업데이트

**수용 기준**
- 변경사항이 즉시 반영됨
- 에러 시 롤백됨
- 로딩 상태 표시
```

#### API 설계
```typescript
// docs/api-design.md

## PATCH /api/users/me

### Request
{
  "name": "홍길동",
  "bio": "AI 전문가",
  "avatarUrl": "https://..."
}

### Response (200)
{
  "success": true,
  "data": { /* 업데이트된 사용자 정보 */ }
}

### Errors
- 400: 유효성 검증 실패
- 401: 인증 필요
- 500: 서버 오류
```

### 2. 데이터베이스 스키마 변경

```bash
# Prisma 스키마 수정
# prisma/schema.prisma

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  bio       String?
  avatarUrl String?  @map("avatar_url")
  // ...
}

# 마이그레이션 생성
npx prisma migrate dev --name add_user_profile_fields

# Prisma Client 재생성
npx prisma generate
```

### 3. 백엔드 구현

#### API Route 생성
```typescript
// app/api/users/me/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    // 1. 인증 확인
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' } },
        { status: 401 }
      );
    }

    // 2. 요청 데이터 검증
    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    // 3. 데이터베이스 업데이트
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: validatedData,
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        avatarUrl: true,
      },
    });

    // 4. 응답 반환
    return NextResponse.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '입력 데이터가 유효하지 않습니다',
            details: error.errors,
          },
        },
        { status: 400 }
      );
    }

    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다' } },
      { status: 500 }
    );
  }
}
```

#### 테스트 작성
```typescript
// tests/api/users/me.test.ts

import { POST } from '@/app/api/users/me/route';
import { prisma } from '@/lib/db';

describe('PATCH /api/users/me', () => {
  it('유효한 데이터로 프로필 업데이트 성공', async () => {
    const request = new Request('http://localhost/api/users/me', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer valid_token',
      },
      body: JSON.stringify({
        name: '홍길동',
        bio: 'AI 전문가',
      }),
    });

    const response = await PATCH(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.name).toBe('홍길동');
  });

  it('인증 없이 요청 시 401 에러', async () => {
    const request = new Request('http://localhost/api/users/me', {
      method: 'PATCH',
      body: JSON.stringify({ name: 'Test' }),
    });

    const response = await PATCH(request);
    expect(response.status).toBe(401);
  });
});
```

### 4. 프론트엔드 구현

#### React Query Hook
```typescript
// hooks/use-update-profile.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UpdateProfileInput {
  name?: string;
  bio?: string;
  avatarUrl?: string;
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileInput) => {
      const response = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error.message);
      }

      return response.json();
    },
    onSuccess: (data) => {
      // 캐시 업데이트 (낙관적 업데이트)
      queryClient.setQueryData(['user', 'me'], data.data);
    },
  });
}
```

#### UI 컴포넌트
```typescript
// components/profile/profile-edit-form.tsx

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useUpdateProfile } from '@/hooks/use-update-profile';
import { toast } from '@/components/ui/use-toast';

const profileSchema = z.object({
  name: z.string().min(1, '이름을 입력하세요').max(100),
  bio: z.string().max(500, '500자 이내로 입력하세요').optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfileEditForm({ user }: { user: User }) {
  const { mutate, isPending } = useUpdateProfile();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || '',
      bio: user.bio || '',
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    mutate(data, {
      onSuccess: () => {
        toast({ title: '프로필이 업데이트되었습니다' });
      },
      onError: (error) => {
        toast({
          title: '오류가 발생했습니다',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name">이름</label>
        <Input
          id="name"
          {...form.register('name')}
          disabled={isPending}
        />
        {form.formState.errors.name && (
          <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="bio">소개</label>
        <Textarea
          id="bio"
          {...form.register('bio')}
          disabled={isPending}
          placeholder="자기소개를 입력하세요"
        />
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? '저장 중...' : '저장'}
      </Button>
    </form>
  );
}
```

### 5. 테스트 및 검증

```bash
# 1. 단위 테스트
pnpm test

# 2. 타입 체크
pnpm type-check

# 3. 린트
pnpm lint

# 4. E2E 테스트
pnpm test:e2e

# 5. 로컬 빌드
pnpm build
```

---

## 👀 코드 리뷰 가이드

### 리뷰어 체크리스트

#### 기능 검증
- [ ] 요구사항을 모두 충족하는가?
- [ ] 엣지 케이스가 처리되는가?
- [ ] 에러 핸들링이 적절한가?

#### 코드 품질
- [ ] 코드가 읽기 쉬운가?
- [ ] 네이밍이 명확한가?
- [ ] 중복 코드가 없는가?
- [ ] 주석이 필요한 곳에 있는가?

#### 성능
- [ ] 불필요한 리렌더링이 없는가?
- [ ] 데이터베이스 쿼리가 최적화되었는가?
- [ ] N+1 쿼리 문제가 없는가?

#### 보안
- [ ] 입력 검증이 적절한가?
- [ ] 인증/인가가 확인되는가?
- [ ] 민감한 정보가 노출되지 않는가?

#### 테스트
- [ ] 테스트 커버리지가 충분한가?
- [ ] 테스트가 의미있는가?
- [ ] 모든 테스트가 통과하는가?

### 리뷰 코멘트 예시

#### 좋은 코멘트
```markdown
✅ **승인**: 코드 품질이 우수하고 테스트도 충분합니다. LGTM!

💡 **제안**: 이 부분은 `useMemo`를 사용하면 성능이 개선될 것 같습니다.

❓ **질문**: `validateInput` 함수는 어떤 경우에 null을 반환하나요?

⚠️ **중요**: 사용자 입력을 검증하지 않고 있습니다. Zod 스키마를 추가해주세요.
```

#### 나쁜 코멘트
```markdown
❌ "이거 왜 이렇게 했어요?" → 명확한 이유 설명 필요
❌ "다시 해주세요" → 구체적인 개선 방향 제시 필요
❌ "이해가 안 되네요" → 어떤 부분이 불명확한지 설명 필요
```

---

## 🐛 디버깅 전략

### 1. 로컬 디버깅

#### VSCode 디버거 설정
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "pnpm dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

#### Console 로깅
```typescript
// 개발 환경에서만 로그
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data);
}

// 구조화된 로깅
console.log({
  action: 'user_login',
  userId: user.id,
  timestamp: new Date().toISOString(),
});
```

### 2. 데이터베이스 디버깅

```typescript
// Prisma 쿼리 로깅
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// 쿼리 시간 측정
const start = Date.now();
const result = await prisma.user.findMany();
console.log(`Query took ${Date.now() - start}ms`);
```

### 3. 네트워크 디버깅

```bash
# API 요청 모니터링
# Chrome DevTools → Network 탭

# cURL로 API 테스트
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token" \
  -d '{"title": "Test Product"}'
```

---

## ⚡ 성능 최적화

### 1. 프론트엔드 최적화

#### 이미지 최적화
```typescript
import Image from 'next/image';

<Image
  src="/product.jpg"
  alt="Product"
  width={800}
  height={600}
  loading="lazy"
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

#### 코드 스플리팅
```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./heavy-component'), {
  loading: () => <Skeleton />,
  ssr: false,
});
```

#### React Query 캐싱
```typescript
const { data } = useQuery({
  queryKey: ['products', { category }],
  queryFn: () => fetchProducts(category),
  staleTime: 5 * 60 * 1000, // 5분
  gcTime: 10 * 60 * 1000, // 10분
});
```

### 2. 백엔드 최적화

#### Redis 캐싱
```typescript
import { redis } from '@/lib/redis';

export async function getPopularProducts() {
  const cacheKey = 'popular_products';

  // 캐시 확인
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // DB 조회
  const products = await prisma.product.findMany({
    where: { status: 'active' },
    orderBy: { purchaseCount: 'desc' },
    take: 10,
  });

  // 캐시 저장 (1시간)
  await redis.setex(cacheKey, 3600, JSON.stringify(products));

  return products;
}
```

#### 데이터베이스 최적화
```typescript
// ❌ Bad: N+1 쿼리
const products = await prisma.product.findMany();
for (const product of products) {
  product.seller = await prisma.user.findUnique({ where: { id: product.sellerId } });
}

// ✅ Good: Include로 조인
const products = await prisma.product.findMany({
  include: { seller: true },
});
```

---

## 🚀 배포 프로세스

### 1. 배포 전 체크리스트

```bash
# 1. 코드 품질 검증
pnpm type-check
pnpm lint
pnpm test
pnpm build

# 2. 환경 변수 확인
# .env.production 파일 검토

# 3. 데이터베이스 마이그레이션 계획
npx prisma migrate deploy --dry-run

# 4. 릴리스 노트 작성
```

### 2. Vercel 배포

#### 자동 배포 (GitHub Actions)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20

      - name: Install dependencies
        run: pnpm install

      - name: Run tests
        run: pnpm test

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-args: '--prod'
```

#### 수동 배포
```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 배포
vercel --prod
```

### 3. 배포 후 검증

```bash
# Health Check
curl https://marketplace.com/api/health

# 주요 기능 테스트
- [ ] 로그인/회원가입
- [ ] 상품 조회
- [ ] 상품 구매
- [ ] 결제 처리

# 성능 모니터링
- Vercel Analytics 확인
- Sentry 에러 로그 확인
- Supabase 로그 확인
```

---

## 🔧 트러블슈팅

### 일반적인 문제

#### 1. 타입 에러
```typescript
// 문제: Property 'name' does not exist on type 'User'
// 해결: Prisma Client 재생성
npx prisma generate
```

#### 2. 환경 변수 인식 안 됨
```bash
# 문제: process.env.DATABASE_URL이 undefined
# 해결:
1. .env.local 파일 확인
2. 개발 서버 재시작
3. Next.js는 NEXT_PUBLIC_ prefix 필요 (클라이언트)
```

#### 3. 데이터베이스 연결 실패
```bash
# 문제: Can't reach database server
# 해결:
docker-compose up -d  # PostgreSQL 시작
npx prisma db push    # 스키마 동기화
```

#### 4. 빌드 실패
```bash
# 문제: Build failed
# 해결:
rm -rf .next node_modules
pnpm install
pnpm build
```

---

**개발 워크플로우 문서 끝**
