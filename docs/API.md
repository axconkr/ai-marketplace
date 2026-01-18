# API 문서

> **버전**: 1.0
> **Base URL**: `https://api.ai-marketplace.com`
> **Last Updated**: 2024-12

---

## 📋 목차

- [개요](#개요)
- [인증](#인증)
- [응답 형식](#응답-형식)
- [에러 처리](#에러-처리)
- [Rate Limiting](#rate-limiting)
- [API 엔드포인트](#api-엔드포인트)
  - [Authentication](#authentication)
  - [Products](#products)
  - [Orders](#orders)
  - [Payments](#payments)
  - [Verifications](#verifications)
  - [Users](#users)
  - [Reviews](#reviews)

---

## 🌐 개요

### API 특징
- **RESTful**: HTTP 메서드 기반 리소스 조작
- **JSON**: 모든 요청/응답은 JSON 형식
- **인증**: JWT Bearer Token
- **페이지네이션**: Cursor 또는 Offset 기반
- **버전 관리**: URL 경로에 버전 포함 (향후 `/v1/...`)

### Base URL
```
개발: http://localhost:3000/api
프로덕션: https://marketplace.com/api
```

---

## 🔐 인증

### JWT Bearer Token
모든 인증이 필요한 요청에 Authorization 헤더 포함:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 토큰 갱신
Access Token 만료 시 Refresh Token으로 갱신:

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh_token_here"
}
```

**응답**:
```json
{
  "success": true,
  "data": {
    "accessToken": "new_access_token",
    "refreshToken": "new_refresh_token",
    "expiresIn": 900
  }
}
```

---

## 📤 응답 형식

### 성공 응답
```json
{
  "success": true,
  "data": {
    /* 응답 데이터 */
  },
  "meta": {
    "timestamp": "2024-12-27T10:00:00Z",
    "requestId": "req_abc123"
  }
}
```

### 페이지네이션 응답
```json
{
  "success": true,
  "data": {
    "items": [ /* 아이템 배열 */ ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "meta": {
    "timestamp": "2024-12-27T10:00:00Z",
    "requestId": "req_abc123"
  }
}
```

---

## ❌ 에러 처리

### 에러 응답 형식
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "사용자 친화적 에러 메시지",
    "details": {
      /* 추가 에러 정보 */
    }
  },
  "meta": {
    "timestamp": "2024-12-27T10:00:00Z",
    "requestId": "req_abc123"
  }
}
```

### 에러 코드

| 코드 | HTTP 상태 | 설명 |
|------|-----------|------|
| `VALIDATION_ERROR` | 400 | 입력 검증 실패 |
| `UNAUTHORIZED` | 401 | 인증 필요 |
| `FORBIDDEN` | 403 | 권한 없음 |
| `NOT_FOUND` | 404 | 리소스 없음 |
| `CONFLICT` | 409 | 리소스 충돌 |
| `RATE_LIMIT_EXCEEDED` | 429 | 요청 제한 초과 |
| `INTERNAL_ERROR` | 500 | 서버 오류 |
| `PAYMENT_FAILED` | 402 | 결제 실패 |

### 검증 에러 예시
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력 데이터가 유효하지 않습니다",
    "details": {
      "fields": {
        "email": "올바른 이메일 형식이 아닙니다",
        "price": "가격은 0보다 커야 합니다"
      }
    }
  }
}
```

---

## ⏱️ Rate Limiting

### 제한 정책
| 사용자 유형 | 제한 | 기간 |
|-------------|------|------|
| 비인증 | 60 요청 | 15분 |
| 인증 | 300 요청 | 15분 |
| Premium | 1000 요청 | 15분 |

### 헤더
```http
X-RateLimit-Limit: 300
X-RateLimit-Remaining: 250
X-RateLimit-Reset: 1640000000
```

### 초과 시 응답
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "요청 제한을 초과했습니다. 15분 후 다시 시도하세요.",
    "details": {
      "retryAfter": 900
    }
  }
}
```

---

## 🔌 API 엔드포인트

## Authentication

### 회원가입
```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecureP@ssw0rd",
  "role": "buyer"
}
```

**응답**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "role": "buyer"
    },
    "accessToken": "eyJhbG...",
    "refreshToken": "refresh_...",
    "expiresIn": 900
  }
}
```

### 로그인
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecureP@ssw0rd"
}
```

**응답**: 회원가입과 동일

### 현재 사용자 조회
```http
GET /api/auth/me
Authorization: Bearer {token}
```

**응답**:
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "role": "seller",
    "sellerTier": "verified",
    "profile": {
      "name": "홍길동",
      "bio": "AI 자동화 전문가"
    }
  }
}
```

### 로그아웃
```http
POST /api/auth/logout
Authorization: Bearer {token}
```

---

## Products

### 상품 목록 조회
```http
GET /api/products?category=n8n&verification_level=2&page=1&limit=20
```

**쿼리 파라미터**:
- `category` (optional): n8n | make | ai_agent | app | api | prompt
- `verification_level` (optional): 0-3
- `search` (optional): 검색 키워드
- `min_price`, `max_price` (optional): 가격 범위
- `page` (optional, default: 1): 페이지 번호
- `limit` (optional, default: 20): 페이지당 아이템 수
- `sort` (optional): price_asc | price_desc | created_desc | popular

**응답**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "prod_123",
        "title": "이메일 자동 응답 n8n 템플릿",
        "description": "Gmail + OpenAI를 활용한 자동 응답 시스템",
        "category": "n8n",
        "price": 4900,
        "currency": "KRW",
        "verificationLevel": 2,
        "seller": {
          "id": "user_456",
          "name": "김개발",
          "tier": "pro"
        },
        "thumbnail": "https://storage.../thumbnail.jpg",
        "rating": 4.8,
        "reviewCount": 24,
        "createdAt": "2024-12-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### 상품 상세 조회
```http
GET /api/products/{productId}
```

**응답**:
```json
{
  "success": true,
  "data": {
    "id": "prod_123",
    "title": "이메일 자동 응답 n8n 템플릿",
    "description": "Gmail + OpenAI를 활용한 자동 응답 시스템\n\n## 기능\n...",
    "category": "n8n",
    "pricingModel": "one_time",
    "price": 4900,
    "currency": "KRW",
    "verificationLevel": 2,
    "verificationReport": {
      "level": 2,
      "verifiedAt": "2024-11-20T00:00:00Z",
      "verifier": "expert_789",
      "summary": "코드 품질 우수, 보안 검증 완료"
    },
    "seller": {
      "id": "user_456",
      "name": "김개발",
      "tier": "pro",
      "profileImage": "https://...",
      "totalSales": 145,
      "rating": 4.9
    },
    "files": [
      {
        "name": "email_automation.json",
        "size": 12345,
        "type": "application/json"
      }
    ],
    "tags": ["gmail", "openai", "automation", "email"],
    "rating": 4.8,
    "reviewCount": 24,
    "purchaseCount": 156,
    "createdAt": "2024-12-01T00:00:00Z",
    "updatedAt": "2024-12-15T00:00:00Z"
  }
}
```

### 상품 생성
```http
POST /api/products
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "title": "상품 제목",
  "description": "상품 설명",
  "category": "n8n",
  "pricingModel": "one_time",
  "price": 4900,
  "currency": "KRW",
  "tags": ["tag1", "tag2"],
  "files": [File]
}
```

**응답**:
```json
{
  "success": true,
  "data": {
    "id": "prod_new123",
    "status": "pending",
    "message": "상품이 등록되었습니다. 관리자 승인 대기 중입니다."
  }
}
```

### 상품 수정
```http
PATCH /api/products/{productId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "수정된 제목",
  "price": 5900
}
```

### 상품 삭제
```http
DELETE /api/products/{productId}
Authorization: Bearer {token}
```

---

## Orders

### 주문 생성
```http
POST /api/orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": "prod_123",
  "paymentMethod": "stripe"
}
```

**응답**:
```json
{
  "success": true,
  "data": {
    "orderId": "order_456",
    "status": "pending",
    "amount": 4900,
    "currency": "KRW",
    "paymentIntent": {
      "clientSecret": "pi_...",
      "publishableKey": "pk_..."
    }
  }
}
```

### 주문 목록 조회
```http
GET /api/orders?status=completed&page=1&limit=20
Authorization: Bearer {token}
```

**쿼리 파라미터**:
- `status` (optional): pending | paid | completed | refunded
- `page`, `limit`: 페이지네이션

**응답**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "order_456",
        "product": {
          "id": "prod_123",
          "title": "이메일 자동 응답 템플릿",
          "thumbnail": "https://..."
        },
        "amount": 4900,
        "currency": "KRW",
        "status": "completed",
        "downloadUrl": "https://storage.../download?token=...",
        "createdAt": "2024-12-20T00:00:00Z"
      }
    ],
    "pagination": { /* ... */ }
  }
}
```

### 주문 상세 조회
```http
GET /api/orders/{orderId}
Authorization: Bearer {token}
```

### 환불 요청
```http
POST /api/orders/{orderId}/refund
Authorization: Bearer {token}
Content-Type: application/json

{
  "reason": "상품이 설명과 다릅니다",
  "details": "기대한 기능이 작동하지 않습니다"
}
```

---

## Payments

### 결제 의도 생성 (Stripe)
```http
POST /api/payments/create-intent
Authorization: Bearer {token}
Content-Type: application/json

{
  "orderId": "order_456",
  "paymentMethod": "stripe"
}
```

**응답**:
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_..._secret_...",
    "publishableKey": "pk_test_..."
  }
}
```

### 결제 확인
```http
POST /api/payments/confirm
Authorization: Bearer {token}
Content-Type: application/json

{
  "orderId": "order_456",
  "paymentIntentId": "pi_123"
}
```

### Webhook (Stripe)
```http
POST /api/webhooks/stripe
Stripe-Signature: t=...,v1=...

{
  "type": "payment_intent.succeeded",
  "data": { /* Stripe event data */ }
}
```

### Webhook (토스페이먼츠)
```http
POST /api/webhooks/toss
Content-Type: application/json

{
  "eventType": "PAYMENT_CONFIRMED",
  "data": { /* Toss event data */ }
}
```

---

## Verifications

### 검증 요청
```http
POST /api/verifications
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": "prod_123",
  "level": 2
}
```

**응답**:
```json
{
  "success": true,
  "data": {
    "verificationId": "verify_789",
    "status": "pending",
    "level": 2,
    "cost": 150,
    "estimatedDays": 3
  }
}
```

### 검증 목록 조회 (검증자용)
```http
GET /api/verifications?status=pending
Authorization: Bearer {token}
```

### 검증 보고서 제출 (검증자용)
```http
PATCH /api/verifications/{verificationId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "approved",
  "report": {
    "codeQuality": 9,
    "security": 8,
    "performance": 9,
    "summary": "전반적으로 우수한 코드 품질...",
    "recommendations": [
      "에러 핸들링 추가 권장",
      "환경변수 분리 필요"
    ]
  }
}
```

---

## Users

### 사용자 프로필 조회
```http
GET /api/users/{userId}
```

**응답**:
```json
{
  "success": true,
  "data": {
    "id": "user_456",
    "name": "김개발",
    "role": "seller",
    "sellerTier": "pro",
    "profileImage": "https://...",
    "bio": "AI 자동화 전문가",
    "joinedAt": "2024-01-01T00:00:00Z",
    "stats": {
      "totalProducts": 12,
      "totalSales": 145,
      "rating": 4.9,
      "reviewCount": 87
    }
  }
}
```

### 프로필 수정
```http
PATCH /api/users/me
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "홍길동",
  "bio": "업데이트된 소개"
}
```

---

## Reviews

### 리뷰 작성
```http
POST /api/reviews
Authorization: Bearer {token}
Content-Type: application/json

{
  "orderId": "order_456",
  "productId": "prod_123",
  "rating": 5,
  "comment": "매우 유용한 템플릿입니다!"
}
```

### 상품 리뷰 조회
```http
GET /api/products/{productId}/reviews?page=1&limit=10
```

**응답**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "review_123",
        "user": {
          "id": "user_789",
          "name": "이구매",
          "profileImage": "https://..."
        },
        "rating": 5,
        "comment": "매우 유용한 템플릿입니다!",
        "createdAt": "2024-12-20T00:00:00Z",
        "helpful": 12
      }
    ],
    "summary": {
      "averageRating": 4.8,
      "totalReviews": 24,
      "distribution": {
        "5": 18,
        "4": 4,
        "3": 1,
        "2": 0,
        "1": 1
      }
    },
    "pagination": { /* ... */ }
  }
}
```

---

## 🔍 검색 API

### 통합 검색
```http
GET /api/search?q=email+automation&type=products
```

**쿼리 파라미터**:
- `q`: 검색어
- `type`: products | users | all
- `page`, `limit`: 페이지네이션

**응답**:
```json
{
  "success": true,
  "data": {
    "products": {
      "items": [ /* ... */ ],
      "total": 15
    },
    "users": {
      "items": [ /* ... */ ],
      "total": 3
    }
  }
}
```

---

## 📊 통계 API (판매자용)

### 판매 통계
```http
GET /api/seller/stats?period=30d
Authorization: Bearer {token}
```

**응답**:
```json
{
  "success": true,
  "data": {
    "revenue": {
      "total": 4900000,
      "currency": "KRW",
      "change": 15.5
    },
    "sales": {
      "total": 156,
      "change": 12.3
    },
    "products": {
      "active": 8,
      "pending": 2
    },
    "rating": {
      "average": 4.9,
      "totalReviews": 87
    }
  }
}
```

---

## 🧪 테스트용 API Keys

### Stripe Test Mode
```
Publishable: pk_test_51...
Secret: sk_test_51...
```

### 토스페이먼츠 Test
```
Client Key: test_ck_...
Secret Key: test_sk_...
```

---

## 📝 변경 이력

### v1.0.0 (2024-12)
- 초기 API 릴리스
- 인증, 상품, 주문, 결제, 검증, 리뷰 API

---

**API 문서 끝**
