# AI Marketplace 개발 세션 요약
**날짜**: 2026년 2월 3일  
**브랜치**: main (origin/main 대비 7 커밋 ahead, unpushed)

---

## 이번 세션에서 완료된 작업

### 1. 이전 작업 커밋 (Commit: `0e094e5`)
**feat: add real-time notifications, n8n validator, and reviews integration**

- SSE(Server-Sent Events) 기반 실시간 알림 스트리밍 구현
  - `lib/events.ts` - EventEmitter 기반 이벤트 버스
  - `app/api/notifications/stream/route.ts` - SSE 엔드포인트
- 알림 서비스에 EventEmitter 통합하여 실시간 업데이트
- n8n 워크플로우 JSON 검증기 구현 (`lib/utils/n8n-validator.ts`)
- 제품 상세 페이지에 ReviewList 컴포넌트 통합
- 검증 요청 시 판매자에게 알림 기능 추가

### 2. 결제 및 인프라 구현 (Commit: `1b34652`)
**feat: implement Stripe Connect payouts, bank verification, cron jobs, and email queue**

#### Stripe Connect 서비스 (`lib/payment/stripe-connect.ts`)
- Connected 계정 생성 및 관리
- 플랫폼에서 Connected 계정으로 Transfer 생성
- Connected 계정에서 은행 계좌로 Payout
- 잔액 조회 및 지급 일정 설정
- 판매자/검증자 정산 처리 헬퍼 함수

#### 계좌 인증 시스템
- `BankVerification` Prisma 모델 추가
- `lib/services/bank-verification.ts` - 인증 서비스
  - 6자리 인증 코드 생성
  - 최대 5회 시도 제한
  - 24시간 만료
- `app/api/user/bank-account/verify/route.ts` - 인증 API
- 계좌 변경 시 자동 인증 요청 트리거

#### 이메일 큐 시스템
- `EmailQueue` Prisma 모델 추가
- `lib/services/email-queue.ts` - 비동기 이메일 처리
  - 배치 처리 (50개/배치)
  - 재시도 로직 (최대 3회)
  - 30일 이상 오래된 이메일 자동 정리
- 대량 알림에 이메일 큐 통합

#### Cron 작업 (Vercel Cron)
- `/api/cron/cleanup-files` - 매일 오전 3시 실행
  - 30일 이상 soft-deleted 파일 하드 삭제
- `/api/cron/process-emails` - 5분마다 실행
  - 이메일 큐 처리

---

## 전체 커밋 히스토리 (unpushed)

```
1b34652 feat: implement Stripe Connect payouts, bank verification, cron jobs, and email queue
0e094e5 feat: add real-time notifications, n8n validator, and reviews integration
6cd88c7 feat(auth): add email verification and security improvements
f86d44e fix(security): implement purchase verification and add features
8221ea4 feat(checkout): implement multi-product cart checkout
1a00a27 feat: implement platform stability features
75d4b9a feat(admin): implement complete admin dashboard with 6 management pages
```

---

## 새로 추가된 파일

### API 엔드포인트
```
app/api/cron/cleanup-files/route.ts      - 파일 정리 크론
app/api/cron/process-emails/route.ts     - 이메일 큐 처리 크론
app/api/notifications/stream/route.ts    - SSE 알림 스트리밍
app/api/user/bank-account/verify/route.ts - 계좌 인증
```

### 서비스/유틸리티
```
lib/payment/stripe-connect.ts            - Stripe Connect 통합
lib/services/bank-verification.ts        - 계좌 인증 서비스
lib/services/email-queue.ts              - 이메일 큐 서비스
lib/events.ts                            - 이벤트 버스
lib/utils/n8n-validator.ts               - n8n JSON 검증기
```

---

## 데이터베이스 변경사항 (prisma/schema.prisma)

### 새 모델
```prisma
model BankVerification {
  id              String   @id @default(cuid())
  user_id         String
  bank_name       String
  bank_account    String
  account_holder  String
  verification_code String
  status          BankVerificationStatus @default(PENDING)
  attempts        Int      @default(0)
  expires_at      DateTime
  verified_at     DateTime?
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt
  user            User     @relation(...)
}

model EmailQueue {
  id           String          @id @default(cuid())
  to           String
  subject      String
  html         String          @db.Text
  text         String?         @db.Text
  status       EmailQueueStatus @default(PENDING)
  attempts     Int             @default(0)
  last_error   String?
  scheduled_at DateTime        @default(now())
  sent_at      DateTime?
  created_at   DateTime        @default(now())
  updated_at   DateTime        @updatedAt
}

enum BankVerificationStatus { PENDING, VERIFIED, EXPIRED, FAILED }
enum EmailQueueStatus { PENDING, PROCESSING, SENT, FAILED }
```

---

## 필요한 환경 변수

```env
# 기존
STRIPE_SECRET_KEY=sk_...
RESEND_API_KEY=re_...

# 새로 추가
CRON_SECRET=your-secret-for-cron-authentication
```

---

## 배포 전 필요한 작업

1. **데이터베이스 마이그레이션**
   ```bash
   npx prisma db push
   # 또는
   npx prisma migrate dev --name add-bank-verification-email-queue
   ```

2. **환경 변수 설정**
   - `CRON_SECRET` 추가

3. **Git Push**
   ```bash
   git push origin main
   ```

---

## 커밋되지 않은 변경사항

다음 파일에 진행 중인 작업이 있습니다 (빌드에 영향 없음):
- `components/products/product-form.tsx` - toast 훅 변경, 폼 필드 개선
- `lib/api/products.ts` - Product 인터페이스 확장

되돌리려면: `git checkout components/products/product-form.tsx lib/api/products.ts`

---

## 디자인 이슈 해결 기록

### 문제
- 브라우저에서 CSS/JS가 로드되지 않음
- MIME 타입 오류 및 404 에러 발생

### 원인
- 여러 개의 Next.js 개발 서버가 동시에 실행되어 충돌

### 해결
```bash
pkill -f "next dev"
rm -rf .next
npm run dev
```

---

## 다음 세션을 위한 Resume Prompt

```
Continue AI Marketplace development. Branch is 7 commits ahead of origin/main (unpushed).

## RECENT SESSION (2026-02-03)
- Stripe Connect payouts implemented (lib/payment/stripe-connect.ts)
- Bank verification system complete (model + service + API)
- Email queue for async bulk emails (model + service + cron)
- File cleanup cron job (daily at 3AM)
- SSE real-time notifications
- n8n JSON validator

## UNCOMMITTED CHANGES
- components/products/product-form.tsx (toast hook, form fields)
- lib/api/products.ts (Product interface expansion)
These don't break build. Commit or discard as needed.

## PENDING ACTIONS
1. git push to deploy changes
2. Run prisma migrate for new models
3. Set CRON_SECRET env variable

## PROJECT CONTEXT
- AI Marketplace for n8n templates, AI agents, vibe coding apps
- Tech: Next.js 14, TypeScript, Prisma, PostgreSQL, Stripe/TossPayments
- Languages: Korean UI, English code
- ~90% MVP complete
```

---

## 빠른 명령어

```bash
# 상태 확인
git status
git log --oneline -10

# 푸시
git push origin main

# 개발 서버
npm run dev

# 빌드
npm run build

# Prisma
npx prisma generate
npx prisma db push
npx prisma studio
```
