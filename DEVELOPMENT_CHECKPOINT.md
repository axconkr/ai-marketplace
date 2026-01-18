# 개발 진행 상황 체크포인트

**날짜**: 2026-01-10
**마지막 업데이트**: 보안 기능 구현 완료

---

## 🎯 완료된 작업

### 1. 역할 기반 접근 제어 (RBAC) 구현 완료 ✅

#### A. 미들웨어 레벨 보호
- **파일**: `/middleware.ts` (신규 생성)
- **기능**:
  - Next.js 미들웨어로 모든 페이지 접근 전 JWT 검증
  - 역할별 라우트 패턴 정의 및 자동 차단
  - 권한 없는 접근 시 자동 리다이렉트
  - 만료된 토큰 자동 감지 및 로그인 페이지로 이동

**보호된 라우트**:
```typescript
// 판매자 전용 (service_provider + admin)
- /dashboard/products/new
- /dashboard/products
- /dashboard/analytics
- /dashboard/settlements
- /dashboard/orders
- /products/create
- /products/new

// 구매자 전용 (client + admin)
- /checkout/*

// 인증 필요 (모든 역할)
- /dashboard
- /profile
- /notifications
- /cart
- /orders
```

#### B. 클라이언트 사이드 보호
- **파일**: `/lib/auth/middleware-helper.ts` (신규 생성)
- **주요 함수**:
  ```typescript
  // JWT에서 역할 추출
  getUserRoleFromToken(): UserRole | null

  // JWT에서 사용자 ID 추출
  getUserIdFromToken(): string | null

  // 역할 확인
  hasRole(requiredRole: UserRole | UserRole[]): boolean

  // 페이지 보호 훅 (자동 리다이렉트)
  useRequireRole(requiredRole?: UserRole | UserRole[])

  // 역할별 헬퍼
  isAdmin(): boolean
  isServiceProvider(): boolean
  isClient(): boolean
  ```

**적용된 페이지**:
- `/app/(marketplace)/dashboard/page.tsx` - 인증 필수
- `/app/(marketplace)/dashboard/products/new/page.tsx` - 판매자 전용
- `/app/(marketplace)/dashboard/products/page.tsx` - 판매자 전용
- `/app/(marketplace)/dashboard/analytics/page.tsx` - 판매자 전용
- `/app/(marketplace)/dashboard/settlements/page.tsx` - 판매자 전용

#### C. API 레벨 보호
- **파일**: `/lib/auth/api-auth.ts` (신규 생성)
- **주요 함수**:
  ```typescript
  // JWT 추출 및 검증
  getAuthToken(request: NextRequest): JWTPayload | null

  // 역할 확인
  hasRequiredRole(userRole: UserRole, requiredRoles: UserRole[]): boolean

  // API 래퍼 (인증 필수)
  withAuth(request, handler): Promise<Response>

  // API 래퍼 (역할 필수)
  withRole(request, requiredRoles, handler): Promise<Response>

  // 응답 헬퍼
  unauthorizedResponse(message)
  forbiddenResponse(message)
  ```

- **파일**: `/lib/auth.ts` (업데이트)
  - `isServiceProvider()` 추가 - service_provider 또는 admin 확인
  - `isClient()` 추가 - client 또는 admin 확인
  - 기존 `isSeller()` 수정 - service_provider 포함

**적용된 API**:
- `/app/api/products/route.ts` - POST: service_provider/admin만 가능
- `/app/api/analytics/seller/overview/route.ts` - service_provider/admin 전용
- `/app/api/analytics/buyer/overview/route.ts` - client/admin 전용

---

## 🚨 현재 이슈

### PostgreSQL 데이터베이스 연결 실패
**증상**:
```
Error: FATAL: could not open file "global/pg_filenode.map": I/O error
```

**원인**: PostgreSQL 데이터 파일 손상

**해결 방법** (다음 세션에서 실행):
```bash
# 1. Docker Desktop 재시작 (가장 빠른 방법)

# 2. PostgreSQL 컨테이너 재생성
docker stop ai_marketplace_db
docker rm ai_marketplace_db
docker volume rm ai_marketplace_postgres_data
docker-compose up -d postgres

# 3. 데이터베이스 초기화
sleep 10
DATABASE_URL="postgresql://ai_marketplace:dev_password_change_in_prod@localhost:5434/ai_marketplace" \
  npx prisma db push

# 4. 개발 서버 재시작
npm run dev
```

---

## 🏃 현재 실행 중인 서비스

### 개발 서버
- **포트**: 3000
- **URL**: http://localhost:3000
- **상태**: ✅ 실행 중
- **백그라운드 프로세스**: f15ae3

### PostgreSQL
- **포트**: 5434
- **상태**: ❌ 연결 실패 (파일 손상)
- **해결 필요**: 컨테이너 재생성

---

## 📋 다음 작업 (우선순위순)

### 1. 데이터베이스 복구 (최우선) 🔴
```bash
# Docker Desktop 재시작 후
docker-compose up -d postgres
DATABASE_URL="postgresql://ai_marketplace:dev_password_change_in_prod@localhost:5434/ai_marketplace" \
  npx prisma db push
```

### 2. 테스트 계정 생성 및 인증 플로우 테스트 🟡
```bash
# DB 복구 후 실행
./test-auth-flow.sh
```

**테스트 계정**:
- **판매자**: seller@test.com / Test1234! (role: seller)
- **구매자**: buyer@test.com / Test1234! (role: user)

### 3. 브라우저 수동 테스트 🟡
- 판매자 로그인 → `/dashboard/products/new` 접근 확인
- 구매자 로그인 → `/dashboard/products/new` 차단 확인
- 역할별 대시보드 UI 차이 확인

### 4. 추가 기능 구현 🟢
- 위시리스트 기능 (현재 UI만 존재)
- 프로필 편집 기능
- 실시간 알림 시스템
- 이메일 인증

---

## 📁 신규 생성 파일

```
/middleware.ts                          # Next.js 미들웨어 (라우트 보호)
/lib/auth/middleware-helper.ts          # 클라이언트 사이드 인증 헬퍼
/lib/auth/api-auth.ts                   # API 인증 유틸리티
/test-auth-flow.sh                      # 인증 플로우 자동 테스트 스크립트
```

## 📝 수정된 파일

```
/lib/auth.ts                            # isServiceProvider(), isClient() 추가
/app/(marketplace)/dashboard/page.tsx   # useRequireRole() 적용
/app/(marketplace)/dashboard/products/new/page.tsx
/app/(marketplace)/dashboard/products/page.tsx
/app/(marketplace)/dashboard/analytics/page.tsx
/app/(marketplace)/dashboard/settlements/page.tsx
/app/api/products/route.ts             # service_provider 역할 체크
/app/api/analytics/seller/overview/route.ts
/app/api/analytics/buyer/overview/route.ts
```

---

## 🎓 구현된 보안 아키텍처

### 3중 보호 레이어

```
┌─────────────────────────────────────────────────────┐
│  1. Middleware (미들웨어)                            │
│     - 모든 페이지 접근 전 JWT 검증                   │
│     - 역할별 자동 리다이렉트                          │
│     File: /middleware.ts                            │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  2. Client-Side (클라이언트)                         │
│     - useRequireRole() 훅으로 페이지 보호            │
│     - 역할별 UI 조건부 렌더링                        │
│     File: /lib/auth/middleware-helper.ts            │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  3. API Routes (서버)                               │
│     - requireRole()로 엔드포인트 보호                │
│     - 역할별 데이터 접근 제어                         │
│     File: /lib/auth.ts, /lib/auth/api-auth.ts      │
└─────────────────────────────────────────────────────┘
```

---

## 🔐 역할 매핑

### Prisma 스키마
```prisma
model User {
  role String @default("user")
}
```

### 역할 값
- `user` - 일반 구매자 (기본값)
- `seller` - 판매자 (service_provider와 동일)
- `service_provider` - 판매자 (새 코드에서 사용)
- `verifier` - 검증자
- `admin` - 관리자 (모든 권한)

### TypeScript 타입
```typescript
enum UserRole {
  ADMIN = 'admin',
  SERVICE_PROVIDER = 'service_provider',
  CLIENT = 'client',
  USER = 'user',
}
```

---

## 🐛 알려진 문제 및 해결 방법

### 1. "Invalid enum value" 에러
**원인**: 역할 이름 불일치 (client vs user, service_provider vs seller)
**해결**: 테스트 스크립트에서 `seller`, `user` 사용

### 2. Docker 명령어 타임아웃
**원인**: Docker Desktop 응답 없음
**해결**: Docker Desktop 재시작

### 3. PostgreSQL 연결 실패
**원인**: 데이터 파일 손상
**해결**: 컨테이너 및 볼륨 재생성

---

## ✅ 다음 세션 시작 시 체크리스트

1. [ ] Docker Desktop이 실행 중인지 확인
2. [ ] PostgreSQL 컨테이너 상태 확인: `docker ps | grep postgres`
3. [ ] DB 연결 테스트: `pg_isready -h localhost -p 5434`
4. [ ] DB가 손상되었다면 재생성 (위 해결 방법 참조)
5. [ ] 개발 서버 실행 확인: http://localhost:3000
6. [ ] 테스트 스크립트 실행: `./test-auth-flow.sh`
7. [ ] 브라우저에서 수동 테스트

---

## 📞 참고 사항

### 환경 변수 (.env.local)
```bash
DATABASE_URL="postgresql://ai_marketplace:dev_password_change_in_prod@localhost:5434/ai_marketplace"
JWT_SECRET="xClO2HizKW603gTY0vLXMRqyVBYvoc3WxOjv6Tzdkj4="
```

### 주요 포트
- Next.js: 3000
- PostgreSQL: 5434
- Redis: 6379 (사용 안 함)

### 유용한 명령어
```bash
# 서버 재시작
npm run dev

# DB 스키마 푸시
DATABASE_URL="..." npx prisma db push

# DB GUI 열기
npx prisma studio

# 인증 테스트
./test-auth-flow.sh
```

---

**마지막 상태**: 보안 구현 완료, DB 복구 필요
**다음 단계**: DB 복구 → 테스트 → 추가 기능 구현
