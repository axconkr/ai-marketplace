# 에러 처리 및 사용자 피드백 개선 문서

## 개요

이 문서는 AI Marketplace 프로젝트의 에러 처리와 사용자 피드백 시스템 개선 사항을 정리한 것입니다.

## 주요 개선 사항

### 1. 전역 API 에러 핸들러 (`lib/api/error-handler.ts`)

#### 기능
- **자동 재시도 로직**: 네트워크 오류 및 5xx 서버 오류에 대한 exponential backoff 재시도
- **401 자동 리다이렉트**: 인증 실패 시 자동으로 로그인 페이지로 리다이렉트
- **사용자 친화적 에러 메시지**: 기술적 에러를 사용자가 이해하기 쉬운 한국어 메시지로 변환
- **통합 에러 처리**: 모든 API 클라이언트에서 일관된 에러 처리

#### 주요 함수

##### `apiFetch<T>(endpoint, options, config)`
- 향상된 fetch 함수로 자동 에러 처리 및 재시도 로직 포함
- 401 에러 시 자동 로그인 리다이렉트
- 재시도 가능한 에러에 대한 자동 재시도

```typescript
// 사용 예시
const data = await apiFetch<Product>('/products/123', {
  method: 'GET',
}, {
  retry: {
    maxRetries: 3,
    initialDelay: 1000,
  }
});
```

##### `fetchWithRetry<T>(url, options, retryConfig)`
- Exponential backoff를 사용한 재시도 로직
- 기본 설정: 최대 3회 재시도, 1초 초기 지연, 2배 증가

#### 에러 메시지 매핑

| 에러 코드 | 사용자 메시지 |
|----------|------------|
| UNAUTHORIZED | 로그인이 필요합니다. |
| FORBIDDEN | 접근 권한이 없습니다. |
| TOKEN_EXPIRED | 세션이 만료되었습니다. 다시 로그인해주세요. |
| BAD_REQUEST | 잘못된 요청입니다. |
| NOT_FOUND | 요청한 리소스를 찾을 수 없습니다. |
| NETWORK_ERROR | 네트워크 연결을 확인해주세요. |
| SERVER_ERROR | 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요. |
| PAYMENT_FAILED | 결제에 실패했습니다. |

### 2. 향상된 Toast 알림 시스템

#### `hooks/use-toast.ts`
새로운 Toast 훅으로 다양한 알림 유형 지원:

```typescript
const { toast, success, error, warning, info } = useToast();

// 성공 알림
success('작업 완료', '상품이 성공적으로 등록되었습니다.');

// 에러 알림
error('작업 실패', '네트워크 연결을 확인해주세요.');

// 경고 알림
warning('주의', '세션이 곧 만료됩니다.');

// 정보 알림
info('알림', '새로운 메시지가 있습니다.');
```

#### `components/ui/toast.tsx`
- 4가지 Toast 유형: success, error, warning, info
- 각 유형별 아이콘 및 색상 스타일
- 자동 닫기 기능 (에러는 7초, 나머지는 5초)
- 다크 모드 지원

### 3. API 클라이언트 업데이트

모든 API 클라이언트가 새로운 에러 핸들러를 사용하도록 업데이트:

#### 업데이트된 파일
- ✅ `lib/api/products.ts` - 상품 API
- ✅ `lib/api/orders.ts` - 주문 API
- ✅ `lib/api/payment.ts` - 결제 API
- ✅ `lib/api/verifications.ts` - 검증 API

#### 변경 사항
```typescript
// 이전 (수동 에러 처리)
const response = await fetch(url, options);
if (!response.ok) {
  const error = await response.json();
  throw new Error(error.message || 'Failed to fetch');
}

// 이후 (자동 에러 처리 및 재시도)
return apiFetch<T>(endpoint, options);
```

### 4. React Query 훅 업데이트

모든 mutation 훅에 Toast 알림 통합:

#### 업데이트된 훅
- ✅ `hooks/use-products.ts`
  - useCreateProduct
  - useUpdateProduct
  - useDeleteProduct
  - useUploadFile

- ✅ `hooks/use-payment.ts`
  - useCreatePayment
  - useConfirmPayment
  - useRequestRefund

#### 사용 예시
```typescript
const createProduct = useCreateProduct();

// 성공 시 자동으로 "상품이 생성되었습니다" 토스트 표시
// 실패 시 자동으로 에러 메시지와 함께 토스트 표시
createProduct.mutate(productData);
```

## 에러 처리 플로우

```
API 요청
  ↓
apiFetch 함수
  ↓
재시도 가능한 에러? (네트워크, 5xx, 429)
  ├─ Yes → 재시도 (최대 3회, exponential backoff)
  └─ No → 에러 처리
       ↓
401 에러?
  ├─ Yes → 토큰 삭제 + 로그인 페이지 리다이렉트
  └─ No → 사용자 친화적 에러 메시지 생성
       ↓
React Query onError
  ↓
Toast 에러 알림 표시
```

## 재시도 로직 상세

### 재시도 대상 에러
1. **네트워크 에러**: `fetch()` 실패 (Failed to fetch)
2. **5xx 서버 에러**: 500-599 상태 코드
3. **Rate Limit**: 429 상태 코드

### 재시도 설정
- **기본 최대 재시도 횟수**: 3회
- **초기 지연 시간**: 1000ms (1초)
- **최대 지연 시간**: 10000ms (10초)
- **Backoff 계수**: 2배

### 재시도 지연 시간 계산
```
지연 시간 = min(초기지연 * (2 ^ (시도횟수 - 1)), 최대지연)

1차 재시도: 1000ms
2차 재시도: 2000ms
3차 재시도: 4000ms
```

## 401 에러 처리

### 동작
1. 401 응답 감지
2. localStorage에서 토큰 제거
3. 현재 경로를 redirect 파라미터로 저장
4. 로그인 페이지로 리다이렉트

### 리다이렉트 URL 형식
```
/login?redirect=/products/123
```

로그인 성공 후 원래 페이지로 자동 복귀 가능

## 테스트 방법

### 1. 401 에러 테스트
```typescript
// 토큰 없이 인증이 필요한 API 호출
localStorage.removeItem('accessToken');
await fetchMyProducts(); // → 자동으로 /login으로 리다이렉트
```

### 2. 네트워크 에러 테스트
```typescript
// 브라우저 DevTools에서 Network를 Offline으로 설정
await fetchProducts({});
// → "네트워크 연결을 확인해주세요" 토스트 표시
```

### 3. 서버 에러 테스트
```typescript
// API 엔드포인트를 존재하지 않는 경로로 변경
await fetchProduct('invalid-id');
// → 자동 재시도 후 에러 토스트 표시
```

### 4. 성공/실패 Toast 테스트
```typescript
const { mutate } = useCreateProduct();

// 성공 케이스
mutate(validProductData);
// → "상품이 생성되었습니다" 성공 토스트

// 실패 케이스
mutate(invalidProductData);
// → "상품 생성 실패" 에러 토스트
```

## 통합 방법

### 새로운 API 클라이언트 추가 시

1. **API 클라이언트 함수 작성**:
```typescript
import { apiFetch } from './error-handler';

export async function fetchNewResource(): Promise<Resource> {
  return apiFetch<Resource>('/new-resource');
}
```

2. **React Query 훅 작성**:
```typescript
import { useToast } from './use-toast';

export function useCreateResource() {
  const { success, error } = useToast();

  return useMutation({
    mutationFn: createResource,
    onSuccess: () => {
      success('성공', '리소스가 생성되었습니다.');
    },
    onError: (err: Error) => {
      error('실패', err.message);
    },
  });
}
```

### ToastProvider 추가

`app/layout.tsx`에 ToastProvider 추가:

```typescript
import { ToastProvider } from '@/hooks/use-toast';
import { ToastViewport } from '@/components/ui/toast';

export default function Layout({ children }) {
  return (
    <ToastProvider>
      {children}
      <ToastViewport />
    </ToastProvider>
  );
}
```

## 성능 영향

- **재시도 로직**: 실패한 요청에만 영향, 성공 요청은 영향 없음
- **Toast 알림**: 경량 컴포넌트로 성능 영향 최소
- **에러 핸들러**: 추가 오버헤드 < 10ms

## 향후 개선 사항

1. **에러 로깅**: Sentry 등의 에러 추적 서비스 통합
2. **오프라인 지원**: Service Worker를 사용한 오프라인 큐잉
3. **재시도 정책 커스터마이징**: API별 재시도 정책 설정
4. **에러 복구 전략**: 자동 복구 가능한 에러에 대한 처리
5. **사용자 피드백 수집**: 에러 리포트 기능 추가

## 결론

이번 개선으로 다음과 같은 효과를 달성했습니다:

✅ **일관된 에러 처리**: 모든 API 호출에서 동일한 에러 처리 로직 사용
✅ **향상된 UX**: 사용자 친화적인 에러 메시지와 Toast 알림
✅ **자동 재시도**: 일시적 네트워크 오류 자동 복구
✅ **세션 관리**: 401 에러 시 자동 로그인 페이지 리다이렉트
✅ **유지보수성**: 중앙화된 에러 처리로 코드 중복 제거

## 참고 자료

- [React Query Error Handling](https://tanstack.com/query/latest/docs/react/guides/mutations#mutation-side-effects)
- [Exponential Backoff](https://en.wikipedia.org/wiki/Exponential_backoff)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
