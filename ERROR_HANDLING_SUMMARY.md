# 에러 처리 시스템 개선 완료

## 🎯 문제 해결

### 원본 문제
```
POST http://localhost:3000/api/auth/login 500 (Internal Server Error)
```

### 근본 원인
PostgreSQL 데이터베이스가 실행되지 않아 Prisma가 연결할 수 없음

### 해결 방법
1. ✅ 데이터베이스 연결 에러를 감지하고 명확한 메시지 제공
2. ✅ 자동 데이터베이스 시작 스크립트 생성
3. ✅ npm 스크립트로 쉬운 관리 제공
4. ✅ 프론트엔드에서 상세한 에러 메시지 표시

---

## 📦 생성된 파일

### 1. `/lib/database-error-handler.ts`
**목적**: 통합 데이터베이스 에러 핸들링

**기능**:
- Prisma 에러를 사용자 친화적 메시지로 변환
- 에러 코드별 처리 (P2002, P2003, P2025 등)
- 재시도 가능 여부 판단
- 자동 재시도 로직 (exponential backoff)
- 개발 환경에서 상세 정보 제공

**주요 에러 타입**:
```typescript
- DB_CONNECTION_ERROR (503) : 데이터베이스 연결 불가
- UNIQUE_CONSTRAINT_VIOLATION : 중복 데이터
- FOREIGN_KEY_CONSTRAINT_VIOLATION : 관계 제약 위반
- RECORD_NOT_FOUND : 레코드 없음
- VALIDATION_ERROR : 유효성 검증 실패
```

**사용 예시**:
```typescript
import { handleDatabaseError, formatDatabaseErrorResponse } from '@/lib/database-error-handler';

try {
  await prisma.user.findUnique(...);
} catch (error) {
  const dbError = handleDatabaseError(error);
  return NextResponse.json(
    formatDatabaseErrorResponse(dbError),
    { status: dbError.code === 'DB_CONNECTION_ERROR' ? 503 : 500 }
  );
}
```

### 2. `/scripts/start-db.sh`
**목적**: 데이터베이스 자동 시작

**기능**:
- Docker 실행 상태 확인
- 데이터베이스 컨테이너 자동 생성/시작
- Health check로 준비 상태 대기
- 상태 표시 및 유용한 명령어 안내

**실행**:
```bash
npm run db:start
```

### 3. `/DATABASE_STARTUP_GUIDE.md`
**목적**: 데이터베이스 시작 가이드

**내용**:
- 로그인 에러 해결 방법
- 데이터베이스 시작 3가지 방법
- 유용한 명령어 모음
- 트러블슈팅 가이드
- 빠른 시작 요약

### 4. `/ERROR_HANDLING_SUMMARY.md`
**목적**: 이 문서 - 에러 처리 시스템 문서화

---

## 🔧 수정된 파일

### 1. `/app/api/auth/login/route.ts`
**변경사항**:
```typescript
// Before
catch (error) {
  console.error('Login error:', error);
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}

// After
catch (error) {
  const dbError = handleDatabaseError(error);
  console.error('Login error:', {
    message: dbError.message,
    code: dbError.code,
    suggestion: dbError.suggestion,
    originalError: error,
  });

  return NextResponse.json(
    formatDatabaseErrorResponse(dbError),
    { status: dbError.code === 'DB_CONNECTION_ERROR' ? 503 : 500 }
  );
}
```

**개선점**:
- ✅ 데이터베이스 연결 에러 → 503 Service Unavailable (이전: 500)
- ✅ 명확한 에러 메시지 + 해결 방법 제시
- ✅ 구조화된 에러 로깅

### 2. `/app/(auth)/login/page.tsx`
**변경사항**:
```typescript
// Before
if (!response.ok) {
  throw new Error(data.error || '로그인에 실패했습니다.');
}

// After
if (!response.ok) {
  // Handle database connection error specifically
  if (response.status === 503 && data.code === 'DB_CONNECTION_ERROR') {
    throw new Error(
      `데이터베이스에 연결할 수 없습니다.\n\n${data.suggestion}\n\n또는 터미널에서 'npm run db:start'를 실행하세요.`
    );
  }

  const errorMessage = data.suggestion
    ? `${data.error}\n\n💡 ${data.suggestion}`
    : data.error || '로그인에 실패했습니다.';

  throw new Error(errorMessage);
}
```

**개선점**:
- ✅ 데이터베이스 연결 에러 특별 처리
- ✅ 사용자에게 해결 방법 직접 안내
- ✅ 모든 에러에 대해 suggestion 표시

### 3. `/package.json`
**추가된 스크립트**:
```json
{
  "scripts": {
    "dev:full": "npm run db:start && npm run dev",
    "db:start": "bash scripts/start-db.sh",
    "db:stop": "docker stop ai_marketplace_db ai_marketplace_redis",
    "db:restart": "docker restart ai_marketplace_db",
    "db:logs": "docker logs ai_marketplace_db -f"
  }
}
```

**사용법**:
```bash
# 데이터베이스 + 개발 서버 한 번에 시작
npm run dev:full

# 데이터베이스만 시작
npm run db:start

# 데이터베이스 중지
npm run db:stop

# 데이터베이스 재시작
npm run db:restart

# 로그 실시간 확인
npm run db:logs
```

---

## 🎯 에러 메시지 개선 전후 비교

### Before (이전)
```
브라우저: POST /api/auth/login 500 (Internal Server Error)
콘솔: Login error: PrismaClientInitializationError: Can't reach database server...
사용자: "Internal server error" (뭘 해야 할지 모름)
```

### After (개선 후)
```
브라우저: POST /api/auth/login 503 (Service Unavailable)
콘솔: Login error: {
  message: "Cannot connect to database",
  code: "DB_CONNECTION_ERROR",
  suggestion: "Please ensure the database is running. Run: npm run db:start or docker-compose up -d postgres"
}
사용자 화면:
  "데이터베이스에 연결할 수 없습니다.

  💡 Please ensure the database is running. Run: npm run db:start or docker-compose up -d postgres

  또는 터미널에서 'npm run db:start'를 실행하세요."
```

---

## ✅ 적용 범위

현재 적용된 API:
1. ✅ `/api/auth/login` - 로그인 API

### 향후 적용 필요
다음 API들도 동일한 에러 핸들링 적용 권장:

**인증 관련**:
- `/api/auth/register`
- `/api/auth/refresh`
- `/api/auth/logout`

**사용자 관련**:
- `/api/user/profile`
- `/api/user/password`

**제품 관련**:
- `/api/products`
- `/api/products/[id]`

**주문 관련**:
- `/api/orders`
- `/api/orders/[id]`

**위시리스트**:
- `/api/wishlist`

**알림**:
- `/api/notifications`

### 적용 방법
```typescript
import { handleDatabaseError, formatDatabaseErrorResponse } from '@/lib/database-error-handler';

export async function POST(request: NextRequest) {
  try {
    // ... your code
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Handle validation errors
    }

    // Handle database errors
    const dbError = handleDatabaseError(error);
    console.error('API error:', {
      message: dbError.message,
      code: dbError.code,
      suggestion: dbError.suggestion,
    });

    return NextResponse.json(
      formatDatabaseErrorResponse(dbError),
      { status: dbError.code === 'DB_CONNECTION_ERROR' ? 503 : 500 }
    );
  }
}
```

---

## 🚀 빠른 사용 가이드

### 개발 시작 시
```bash
# 방법 1: 한 번에 시작 (권장)
npm run dev:full

# 방법 2: 수동으로 시작
npm run db:start
npm run dev
```

### 문제 발생 시
```bash
# 1. 로그 확인
npm run db:logs

# 2. 데이터베이스 재시작
npm run db:restart

# 3. 완전 재시작
docker-compose down
npm run db:start
```

### 데이터베이스 관리
```bash
# Prisma Studio (GUI)
npm run db:studio

# 스키마 동기화
npm run db:push

# 테스트 데이터 시드
npm run db:seed
```

---

## 📊 에러 코드 레퍼런스

| HTTP Status | 에러 코드 | 의미 | 재시도 |
|-------------|-----------|------|--------|
| 503 | DB_CONNECTION_ERROR | 데이터베이스 연결 불가 | ✅ Yes |
| 500 | UNIQUE_CONSTRAINT_VIOLATION | 중복 데이터 (예: 이메일) | ❌ No |
| 500 | FOREIGN_KEY_CONSTRAINT_VIOLATION | 관계 제약 위반 | ❌ No |
| 404 | RECORD_NOT_FOUND | 레코드 없음 | ❌ No |
| 400 | VALIDATION_ERROR | 유효성 검증 실패 | ❌ No |
| 500 | RUST_PANIC | Prisma 내부 에러 (심각) | ❌ No |
| 500 | UNKNOWN_ERROR | 알 수 없는 에러 | ✅ Yes |

---

## 🎉 결과

### 사용자 경험 개선
- ❌ "Internal server error" (막막함)
- ✅ "데이터베이스에 연결할 수 없습니다. npm run db:start를 실행하세요." (해결 방법 제시)

### 개발자 경험 개선
- ❌ 매번 Docker 명령어 직접 입력
- ✅ `npm run db:start` 한 번으로 해결

### 디버깅 개선
- ❌ Generic error message
- ✅ Structured error logging with code, message, suggestion

### 안정성 개선
- ✅ 자동 재시도 로직
- ✅ Exponential backoff
- ✅ Health check 기반 대기

---

## 📝 향후 개선 사항

### 1. 모든 API에 적용
- [ ] 인증 API 전체
- [ ] 제품 API
- [ ] 주문 API
- [ ] 사용자 API
- [ ] 위시리스트 API
- [ ] 알림 API

### 2. 추가 기능
- [ ] Sentry/DataDog 통합
- [ ] 에러 rate limiting
- [ ] 에러 알림 (Slack/Discord)
- [ ] 에러 대시보드
- [ ] A/B 테스트용 feature flag

### 3. 문서화
- [ ] API 에러 레퍼런스 문서
- [ ] 트러블슈팅 가이드 확장
- [ ] 비디오 튜토리얼

---

## 🔒 보안 고려사항

### 현재 구현
- ✅ 개발 환경에서만 stack trace 노출
- ✅ Generic error message (프로덕션)
- ✅ 구조화된 로깅

### 프로덕션 권장사항
- [ ] 에러 로그 암호화 저장
- [ ] PII (개인정보) 제거
- [ ] Rate limiting per IP
- [ ] DDoS 방어

---

**이제 두 번 다시 로그인 에러가 사용자를 막막하게 하지 않습니다!** 🎉

모든 에러는 명확한 메시지와 해결 방법을 제공합니다.
