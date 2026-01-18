# 판매자 요구사항 분석 보고서

## 목차
1. [판매자 핵심 기능 목록](#1-판매자-핵심-기능-목록)
2. [각 기능의 상세 요구사항](#2-각-기능의-상세-요구사항)
3. [우선순위별 구현 계획](#3-우선순위별-구현-계획)
4. [현재 구현 상태 확인](#4-현재-구현-상태-확인)
5. [구현 로드맵](#5-구현-로드맵)

---

## 1. 판매자 핵심 기능 목록

### 1.1 상품 관리 (Product Management)
- **상품 등록**: n8n 워크플로우, AI 에이전트 등 상품 등록
- **상품 수정/삭제**: 등록된 상품의 정보 수정 및 삭제
- **상품 상태 관리**: 초안(DRAFT), 검토중(PENDING), 승인됨(APPROVED), 게시됨(PUBLISHED), 거부됨(REJECTED)
- **상품 목록 조회**: 판매자가 등록한 모든 상품 관리
- **파일 업로드**: 상품 썸네일, 상품 파일, 상세 이미지 등

### 1.2 검증 시스템 (Verification System)
- **검증 요청**: 상품에 대한 전문가 검증 요청
- **검증 레벨**: Level 0 (미검증) ~ Level 3 (전문가 심층 리뷰)
- **검증 프로세스**: 4가지 전문가 유형별 검증
  - 디자인 전문가 (Design Expert)
  - 기획 전문가 (Planning Expert)
  - 개발 전문가 (Development Expert)
  - 도메인 전문가 (Domain Expert)
- **검증 상태 추적**: PENDING → ASSIGNED → IN_PROGRESS → COMPLETED → APPROVED/REJECTED
- **검증 보고서**: 검증 결과, 점수, 배지, 개선사항 등

### 1.3 주문 관리 (Order Management)
- **주문 조회**: 판매자 상품에 대한 주문 내역 확인
- **주문 상태 추적**: PENDING → PROCESSING → COMPLETED → CANCELLED → REFUNDED
- **주문 통계**: 총 주문 수, 완료된 주문, 대기 중인 주문 등
- **고객 관리**: 구매 고객 정보 및 구매 이력

### 1.4 정산 시스템 (Settlement System)
- **정산 조회**: 월별 정산 내역 확인
- **정산 상세**: 상품별 매출, 플랫폼 수수료, 실수령액
- **정산 상태**: PENDING → PROCESSING → PAID → FAILED → CANCELLED
- **은행 계좌 연동**: 정산금 수령을 위한 계좌 등록 및 검증
- **정산 히스토리**: 과거 정산 내역 조회

### 1.5 매출 분석 (Sales Analytics)
- **대시보드**: 매출 현황, 주문 현황, 상품 성과 한눈에 보기
- **매출 차트**: 일별/주별/월별 매출 추이
- **인기 상품**: 판매량 기준 상위 상품
- **고객 분석**: 신규 고객, 재구매 고객 통계
- **주문 타임라인**: 시간대별 주문 패턴
- **데이터 내보내기**: CSV/Excel 형식으로 데이터 다운로드

### 1.6 리뷰 관리 (Review Management)
- **리뷰 조회**: 판매자 상품에 달린 모든 리뷰 확인
- **리뷰 답변**: 구매자 리뷰에 대한 판매자 답변
- **평점 통계**: 평균 평점, 평점 분포, 리뷰 개수
- **리뷰 신고 처리**: 부적절한 리뷰에 대한 신고

### 1.7 알림 시스템 (Notification System)
- **주문 알림**: 새로운 주문 발생 시 알림
- **리뷰 알림**: 새로운 리뷰 작성 시 알림
- **검증 알림**: 검증 완료 시 알림
- **정산 알림**: 정산 처리 완료 시 알림
- **상품 승인/거부 알림**: 관리자 승인/거부 시 알림

### 1.8 판매자 등급 시스템 (Seller Tier)
- **등급 체계**: NEW → VERIFIED → PRO → MASTER
- **등급별 혜택**: 수수료 차등, 노출 우선순위, 검증 할인 등
- **등급 조건**: 매출, 리뷰 평점, 검증 상품 비율 등

### 1.9 기술 지원 (Technical Support)
- **고객 문의 관리**: 상품 관련 구매자 문의 처리
- **FAQ 관리**: 자주 묻는 질문 등록 및 관리
- **업데이트 공지**: 상품 업데이트 사항 공지

---

## 2. 각 기능의 상세 요구사항

### 2.1 상품 등록 프로세스 (US-S1)

#### 사용자 스토리
```
As a 판매자,
I want to n8n 워크플로우를 상품으로 등록하고,
So that 구매자에게 판매할 수 있다.
```

#### 인수 기준

**Scenario 1: 성공적인 상품 등록**
```
Given 인증된 판매자가 로그인했을 때
When 상품 등록 폼을 작성하고 제출하면
  - 제목, 설명, 카테고리, 가격 입력
  - 썸네일 이미지 업로드
  - 상품 파일 업로드 (n8n JSON, Python 스크립트 등)
Then 상품이 "초안(DRAFT)" 상태로 저장되고
And 판매자 대시보드에서 상품을 확인할 수 있다
```

**Scenario 2: 필수 항목 누락**
```
Given 판매자가 상품 등록 폼을 작성 중일 때
When 필수 항목을 입력하지 않고 제출하면
Then 유효성 검증 오류가 표시되고
And 폼 제출이 거부된다
```

**Scenario 3: 상품 게시 요청**
```
Given 판매자가 초안 상품을 완성했을 때
When "게시 요청" 버튼을 클릭하면
Then 상품 상태가 "검토중(PENDING)"으로 변경되고
And 관리자에게 승인 요청 알림이 발송된다
```

#### 데이터 모델
```typescript
interface ProductCreateInput {
  title: string              // 상품명 (필수, 5-100자)
  description: string        // 상세 설명 (필수, 최소 50자)
  category: string          // 카테고리 (필수)
  price: number             // 가격 (필수, 최소 1000원)
  thumbnail?: string        // 썸네일 이미지 URL
  images?: string[]         // 상세 이미지 URL 배열
  tags?: string[]          // 태그 (최대 10개)
  features?: string[]      // 주요 기능 (최대 5개)
  requirements?: string    // 사용 요구사항
  demo_url?: string        // 데모 URL
}
```

#### API 엔드포인트
```
POST   /api/products           - 상품 생성 (초안)
GET    /api/products/me        - 내 상품 목록 조회
GET    /api/products/:id       - 상품 상세 조회
PUT    /api/products/:id       - 상품 수정
DELETE /api/products/:id       - 상품 삭제
POST   /api/products/:id/publish - 게시 요청
```

---

### 2.2 전문가 검증 시스템 (US-S2)

#### 사용자 스토리
```
As a 판매자,
I want to 내 상품의 신뢰도를 높이기 위해 전문가 검증을 받고,
So that 구매자의 신뢰를 얻고 더 많은 판매를 할 수 있다.
```

#### 검증 레벨 정의

| 레벨 | 이름 | 내용 | 비용 | 전문가 유형 |
|------|------|------|------|------------|
| Level 0 | 미검증 | 자동 검사만 (파일 유효성, 악성코드) | 무료 | 자동화 |
| Level 1 | 기본 검증 | 관리자 승인 (품질 기준 확인) | $50 | 관리자 |
| Level 2 | 전문가 검증 | 전문가 코드 리뷰 | $150 | 1명의 전문가 |
| Level 3 | 심층 검증 | 다중 전문가 검증 | $300 | 4가지 전문가 |

#### Level 3 검증 프로세스 (4가지 전문가)

**1. 디자인 전문가 (Design Expert)**
- UI/UX 디자인 품질 평가
- 사용자 경험 흐름 검증
- 시각적 일관성 검토
- 접근성(Accessibility) 확인

**2. 기획 전문가 (Planning Expert)**
- 비즈니스 로직 타당성 검증
- 사용자 요구사항 충족도 평가
- 기능 완성도 검토
- 시장 적합성 분석

**3. 개발 전문가 (Development Expert)**
- 코드 품질 검토 (Clean Code)
- 보안 취약점 분석
- 성능 최적화 검토
- 베스트 프랙티스 준수 여부

**4. 도메인 전문가 (Domain Expert)**
- 특정 도메인 지식 적용 여부
- 업계 표준 준수 확인
- 실무 활용 가능성 평가
- 확장성 및 유지보수성 검토

#### 검증 워크플로우

```
1. 판매자: 검증 요청 제출
   ↓
2. 시스템: 검증 레벨별 비용 결제
   ↓
3. 시스템: 검증자 자동 매칭 또는 관리자 할당
   ↓
4. 검증자: 검증 작업 진행
   - 코드 리뷰
   - 기능 테스트
   - 보안 검사
   - 평가 보고서 작성
   ↓
5. 시스템: 검증 완료
   - 점수 부여 (0-100점)
   - 배지 발급 (품질, 보안, 성능 등)
   - 개선 제안 사항
   ↓
6. 판매자: 검증 결과 확인
   ↓
7. 시스템: 상품에 검증 레벨 표시
   ↓
8. 정산: 검증 수수료 분배
   - 검증자: 70%
   - 플랫폼: 30%
```

#### 인수 기준

**Scenario 1: 검증 요청**
```
Given 판매자가 게시된 상품을 보유하고 있을 때
When 검증 요청을 제출하면
  - 검증 레벨 선택 (Level 1-3)
  - 검증 비용 확인
  - 결제 진행
Then 검증 요청이 생성되고
And 검증 상태가 "PENDING"으로 설정되고
And 검증자 풀에서 적합한 검증자를 찾는다
```

**Scenario 2: 검증 완료**
```
Given 검증자가 검증을 완료했을 때
When 검증 보고서를 제출하면
Then 검증 상태가 "COMPLETED"로 변경되고
And 상품에 검증 레벨 배지가 표시되고
And 판매자에게 알림이 발송되고
And 검증자에게 수수료 70%가 정산 예정으로 기록된다
```

**Scenario 3: 검증 거부**
```
Given 검증자가 검증 중 심각한 문제를 발견했을 때
When 검증을 거부하면
Then 검증 상태가 "REJECTED"로 변경되고
And 판매자에게 거부 사유가 전달되고
And 검증 비용의 50%가 환불된다
```

#### 데이터 모델
```typescript
interface VerificationRequest {
  id: string
  product_id: string
  verifier_id?: string
  level: 1 | 2 | 3
  status: VerificationStatus
  fee: number                    // 총 검증 비용
  platform_share: number         // 플랫폼 수수료 (30%)
  verifier_share: number         // 검증자 수수료 (70%)

  // Level 3 전용: 4가지 전문가 검증
  design_expert_id?: string
  planning_expert_id?: string
  development_expert_id?: string
  domain_expert_id?: string

  report?: {
    score: number                // 0-100
    badges: string[]            // ['security', 'performance', 'quality']
    findings: {
      strengths: string[]
      weaknesses: string[]
      suggestions: string[]
    }

    // Level 3 전용: 전문가별 평가
    design_review?: ExpertReview
    planning_review?: ExpertReview
    development_review?: ExpertReview
    domain_review?: ExpertReview
  }

  requested_at: DateTime
  assigned_at?: DateTime
  reviewed_at?: DateTime
  completed_at?: DateTime
}

interface ExpertReview {
  expert_id: string
  expert_type: 'design' | 'planning' | 'development' | 'domain'
  score: number              // 0-100
  comments: string
  checklist: {
    item: string
    passed: boolean
    note?: string
  }[]
  recommendations: string[]
}

enum VerificationStatus {
  PENDING      // 검증 요청됨, 검증자 대기 중
  ASSIGNED     // 검증자 할당됨
  IN_PROGRESS  // 검증 진행 중
  COMPLETED    // 검증 완료, 승인 대기
  APPROVED     // 검증 승인됨
  REJECTED     // 검증 거부됨
  CANCELLED    // 검증 취소됨
}
```

#### API 엔드포인트
```
POST   /api/verifications                    - 검증 요청 생성
GET    /api/verifications                    - 검증 요청 목록
GET    /api/verifications/:id                - 검증 상세 조회
POST   /api/verifications/:id/assign         - 검증자 할당 (관리자)
POST   /api/verifications/:id/start          - 검증 시작 (검증자)
POST   /api/verifications/:id/submit         - 검증 제출 (검증자)
POST   /api/verifications/:id/cancel         - 검증 취소 (판매자)
GET    /api/verifications/my-verifications   - 내가 요청한 검증 목록
GET    /api/verifications/assigned-to-me     - 내가 할당받은 검증 (검증자)
```

---

### 2.3 판매 현황 및 정산 (US-S3)

#### 사용자 스토리
```
As a 판매자,
I want to 판매 현황과 정산 내역을 확인하고,
So that 내 비즈니스 성과를 추적하고 수익을 관리할 수 있다.
```

#### 판매자 대시보드 구성

**1. 개요 (Overview)**
- 총 매출 (Total Revenue)
- 순수익 (Net Revenue - 수수료 제외)
- 주문 수 (Total Orders)
- 평균 주문 금액 (Average Order Value)
- 활성 상품 수 (Active Products)
- 평균 평점 (Average Rating)

**2. 매출 차트 (Revenue Chart)**
- 일별/주별/월별 매출 추이
- 비교 기간 선택 (지난 7일, 30일, 90일, 1년)
- 전년 동기 대비 성장률

**3. 주문 관리 (Orders)**
- 최근 주문 목록
- 주문 상태별 필터 (전체, 진행중, 완료, 취소)
- 주문 상세 정보 (구매자, 상품, 금액, 일시)
- 주문 타임라인 차트

**4. 인기 상품 (Top Products)**
- 판매량 기준 상위 상품
- 매출액 기준 상위 상품
- 평점 기준 상위 상품

**5. 고객 분석 (Customer Analytics)**
- 총 고객 수
- 신규 고객 vs 재구매 고객
- 고객별 구매 이력

**6. 대기 중인 작업 (Pending Actions)**
- 답변 필요한 리뷰
- 처리 필요한 문의
- 승인 대기 중인 상품

**7. 데이터 내보내기 (Export)**
- CSV/Excel 형식
- 기간 선택
- 항목 선택 (매출, 주문, 고객 등)

#### 정산 시스템

**정산 주기**: 매월 1일 (전월 1일 ~ 말일)

**정산 프로세스**:
```
1. 매월 1일 자동 실행
   ↓
2. 전월 완료된 주문 집계
   - 주문 금액
   - 플랫폼 수수료 계산
   - 순수령액 계산
   ↓
3. 정산 내역 생성
   - 상품별 매출
   - 수수료
   - 실수령액
   ↓
4. 판매자에게 알림
   ↓
5. 정산 승인 (관리자)
   ↓
6. 등록된 계좌로 송금
   ↓
7. 정산 완료 알림
```

**정산 내역 구성**:
```typescript
interface Settlement {
  id: string
  seller_id: string
  period_start: DateTime        // 정산 기간 시작
  period_end: DateTime          // 정산 기간 종료

  total_sales: number           // 총 매출
  platform_fee: number          // 플랫폼 수수료
  net_amount: number            // 순수령액

  items: SettlementItem[]       // 상품별 상세

  status: SettlementStatus
  payout_date?: DateTime        // 실제 지급일
  payout_method?: string        // 지급 방법 (은행계좌, Stripe)
  payout_reference?: string     // 거래 참조번호

  createdAt: DateTime
  updatedAt: DateTime
}

interface SettlementItem {
  id: string
  settlement_id: string
  product_id: string
  product_name: string

  order_count: number           // 주문 수
  total_sales: number           // 상품 총 매출
  platform_fee: number          // 상품별 수수료
  payout_amount: number         // 상품별 실수령액
}

enum SettlementStatus {
  PENDING      // 정산 대기 중
  PROCESSING   // 처리 중
  PAID         // 지급 완료
  FAILED       // 지급 실패
  CANCELLED    // 정산 취소
}
```

#### 수수료 정책

**판매자 등급별 수수료**:
| 등급 | 거래 수수료 | 조건 |
|------|------------|------|
| NEW | 20% | 신규 판매자 |
| VERIFIED | 15% | 이메일 인증 + 은행 계좌 연동 |
| PRO | 12% | 총 매출 $1,000 이상 + 평점 4.5+ |
| MASTER | 10% | 총 매출 $10,000 이상 + 평점 4.8+ |

**기타 수수료**:
- 검증 수수료: 30% (검증자 70%, 플랫폼 30%)
- 개발 의뢰 중개 수수료: 15%

#### 인수 기준

**Scenario 1: 정산 내역 조회**
```
Given 판매자가 로그인했을 때
When 정산 페이지에 접속하면
Then 정산 내역 목록이 표시되고
And 정산 기간, 금액, 상태를 확인할 수 있다
```

**Scenario 2: 정산 상세 확인**
```
Given 판매자가 특정 정산 내역을 선택했을 때
When 상세 페이지로 이동하면
Then 상품별 매출 내역을 확인할 수 있고
And 수수료 계산 내역을 확인할 수 있고
And 순수령액을 확인할 수 있다
```

**Scenario 3: 은행 계좌 등록**
```
Given 판매자가 계좌를 등록하지 않았을 때
When 은행 계좌 정보를 입력하고 제출하면
Then 계좌 정보가 저장되고
And 계좌 검증이 진행된다 (소액 입금 등)
```

#### API 엔드포인트
```
GET    /api/settlements                    - 정산 목록 조회
GET    /api/settlements/:id                - 정산 상세 조회
GET    /api/settlements/current            - 현재 정산 기간 미리보기
GET    /api/settlements/summary            - 정산 요약 통계
POST   /api/settlements/process/:id        - 정산 처리 (관리자)

GET    /api/analytics/seller/overview      - 판매자 대시보드 개요
GET    /api/analytics/seller/revenue       - 매출 차트 데이터
GET    /api/analytics/seller/orders-timeline - 주문 타임라인
GET    /api/analytics/seller/top-products  - 인기 상품
GET    /api/analytics/seller/customers     - 고객 분석
GET    /api/analytics/seller/pending-actions - 대기 작업
GET    /api/analytics/seller/export        - 데이터 내보내기

POST   /api/user/bank-account              - 은행 계좌 등록
PUT    /api/user/bank-account              - 은행 계좌 수정
```

---

### 2.4 개발 의뢰 시스템 (US-S4)

#### 사용자 스토리
```
As a 판매자,
I want to 개발 의뢰를 받아 맞춤 개발을 하고,
So that 추가 수익을 얻을 수 있다.
```

#### 개발 의뢰 프로세스

```
1. 구매자: 개발 의뢰 등록
   - 요구사항 작성
   - 예산 범위 설정
   - 기한 설정
   ↓
2. 시스템: 적합한 판매자에게 알림
   - 카테고리 매칭
   - 평점/등급 기준
   ↓
3. 판매자: 제안서 제출
   - 견적 제시
   - 일정 제안
   - 포트폴리오 첨부
   ↓
4. 구매자: 판매자 선택
   ↓
5. 시스템: 에스크로 결제
   - 계약금 50% 선지급
   - 나머지 50% 에스크로
   ↓
6. 판매자: 개발 진행
   - 중간 보고
   - 피드백 반영
   ↓
7. 구매자: 최종 검수
   ↓
8. 시스템: 잔금 정산
   - 판매자에게 나머지 50% 지급
   - 플랫폼 수수료 15% 차감
```

#### 데이터 모델
```typescript
interface ProjectRequest {
  id: string
  buyer_id: string
  title: string
  description: string
  category: string
  budget_min: number
  budget_max: number
  deadline: DateTime
  requirements: string[]
  attachments?: string[]

  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  selected_proposal_id?: string

  createdAt: DateTime
  updatedAt: DateTime
}

interface Proposal {
  id: string
  project_request_id: string
  seller_id: string

  price: number
  estimated_days: number
  description: string
  portfolio_links?: string[]

  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'

  createdAt: DateTime
}

interface ProjectContract {
  id: string
  project_request_id: string
  proposal_id: string
  buyer_id: string
  seller_id: string

  total_amount: number
  deposit_amount: number          // 계약금 (50%)
  remaining_amount: number        // 잔금 (50%)
  platform_fee: number            // 플랫폼 수수료 (15%)

  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED'

  milestones: Milestone[]

  createdAt: DateTime
  completedAt?: DateTime
}

interface Milestone {
  id: string
  title: string
  description: string
  due_date: DateTime
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  deliverables?: string[]
}
```

#### API 엔드포인트
```
POST   /api/project-requests              - 개발 의뢰 생성
GET    /api/project-requests              - 의뢰 목록 조회
GET    /api/project-requests/:id          - 의뢰 상세 조회

POST   /api/proposals                     - 제안서 제출
GET    /api/proposals/my-proposals        - 내 제안서 목록

POST   /api/project-contracts             - 계약 생성
GET    /api/project-contracts/:id         - 계약 조회
POST   /api/project-contracts/:id/milestones - 마일스톤 업데이트
POST   /api/project-contracts/:id/complete - 프로젝트 완료
```

**참고**: 이 기능은 Phase 2 이후 구현 예정 (우선순위 P1)

---

### 2.5 리뷰 관리

#### 사용자 스토리
```
As a 판매자,
I want to 내 상품에 달린 리뷰를 관리하고,
So that 구매자와 소통하고 서비스를 개선할 수 있다.
```

#### 리뷰 관리 기능

**1. 리뷰 조회**
- 상품별 리뷰 목록
- 평점별 필터 (1-5점)
- 정렬 (최신순, 평점 높은순, 평점 낮은순)

**2. 리뷰 답변**
- 판매자 답변 작성
- 답변 수정/삭제
- 답변 알림

**3. 리뷰 신고**
- 부적절한 리뷰 신고
- 신고 사유 선택
- 관리자 검토 요청

**4. 평점 통계**
- 평균 평점
- 평점 분포 (5점: 50%, 4점: 30%, ...)
- 총 리뷰 개수
- 리뷰 트렌드 (최근 개선/악화)

#### 데이터 모델
```typescript
interface Review {
  id: string
  product_id: string
  user_id: string
  order_id: string

  rating: number                // 1-5
  title?: string
  content: string
  images?: string[]

  helpful_count: number         // 도움이 됨 투표
  not_helpful_count: number     // 도움이 안됨 투표

  seller_reply?: {
    content: string
    created_at: DateTime
    updated_at?: DateTime
  }

  status: ReviewStatus
  verified_purchase: boolean    // 구매 인증 여부

  createdAt: DateTime
  updatedAt: DateTime
}

enum ReviewStatus {
  PENDING      // 검토 대기 (자동 게시)
  PUBLISHED    // 게시됨
  REPORTED     // 신고됨
  HIDDEN       // 숨김 처리 (관리자)
  DELETED      // 삭제됨
}
```

#### API 엔드포인트
```
GET    /api/reviews                       - 리뷰 목록 조회
GET    /api/reviews/:id                   - 리뷰 상세 조회
POST   /api/reviews/:id/reply             - 판매자 답변 작성
PUT    /api/reviews/:id/reply             - 판매자 답변 수정
DELETE /api/reviews/:id/reply             - 판매자 답변 삭제
POST   /api/reviews/:id/report            - 리뷰 신고
POST   /api/reviews/:id/vote              - 리뷰 투표 (도움됨/안됨)
```

---

### 2.6 알림 시스템

#### 알림 유형

| 유형 | 트리거 | 중요도 | 채널 |
|------|--------|--------|------|
| 새 주문 | 상품 구매 발생 | 높음 | 앱, 이메일 |
| 리뷰 작성 | 구매자가 리뷰 작성 | 중간 | 앱, 이메일 |
| 검증 완료 | 전문가 검증 완료 | 높음 | 앱, 이메일 |
| 상품 승인 | 관리자 상품 승인 | 높음 | 앱, 이메일 |
| 상품 거부 | 관리자 상품 거부 | 높음 | 앱, 이메일 |
| 정산 완료 | 월별 정산 처리 | 높음 | 앱, 이메일 |
| 환불 요청 | 구매자 환불 요청 | 높음 | 앱, 이메일 |
| 의뢰 수신 | 개발 의뢰 매칭 | 중간 | 앱 |

#### 알림 설정

판매자가 알림 수신 여부를 제어할 수 있어야 함:
```typescript
interface NotificationSettings {
  email_notifications: {
    new_order: boolean
    new_review: boolean
    verification_complete: boolean
    settlement_complete: boolean
    product_approved: boolean
    refund_request: boolean
  }

  push_notifications: {
    new_order: boolean
    new_review: boolean
    verification_complete: boolean
  }
}
```

#### API 엔드포인트
```
GET    /api/notifications                 - 알림 목록 조회
POST   /api/notifications/:id/read        - 알림 읽음 처리
POST   /api/notifications/mark-all-read   - 모두 읽음 처리
DELETE /api/notifications/clear-all       - 모두 삭제
GET    /api/user/notification-settings    - 알림 설정 조회
PUT    /api/user/notification-settings    - 알림 설정 변경
```

---

### 2.7 판매자 등급 시스템

#### 등급 체계

| 등급 | 조건 | 혜택 | 배지 |
|------|------|------|------|
| NEW | 신규 가입 | - | - |
| VERIFIED | 이메일 인증 + 은행 계좌 연동 | 수수료 20% → 15% | ✓ 인증됨 |
| PRO | 총 매출 $1,000+ <br> 평점 4.5+ <br> 리뷰 10개+ | 수수료 15% → 12% <br> 검색 우선순위 상승 | ⭐ PRO |
| MASTER | 총 매출 $10,000+ <br> 평점 4.8+ <br> 리뷰 50개+ <br> 검증 상품 50%+ | 수수료 12% → 10% <br> 최상위 노출 <br> 전담 지원 | 👑 MASTER |

#### 등급 자동 업그레이드

매일 자동으로 판매자 통계를 계산하고 조건 충족 시 등급 업그레이드:
```typescript
interface SellerStats {
  total_revenue: number         // 총 매출
  order_count: number           // 총 주문 수
  average_rating: number        // 평균 평점
  review_count: number          // 총 리뷰 수
  verified_product_ratio: number // 검증 상품 비율
}

function checkTierUpgrade(seller: User, stats: SellerStats): SellerTier {
  if (
    stats.total_revenue >= 10000 &&
    stats.average_rating >= 4.8 &&
    stats.review_count >= 50 &&
    stats.verified_product_ratio >= 0.5
  ) {
    return 'MASTER'
  }

  if (
    stats.total_revenue >= 1000 &&
    stats.average_rating >= 4.5 &&
    stats.review_count >= 10
  ) {
    return 'PRO'
  }

  if (seller.emailVerified && seller.bank_verified) {
    return 'VERIFIED'
  }

  return 'NEW'
}
```

---

## 3. 우선순위별 구현 계획

### P0 (Critical) - MVP 필수 기능

**Week 1-2: 상품 관리 기본**
- [ ] 상품 등록 (POST /api/products)
- [ ] 상품 수정 (PUT /api/products/:id)
- [ ] 상품 삭제 (DELETE /api/products/:id)
- [ ] 내 상품 목록 조회 (GET /api/products/me)
- [ ] 상품 상태 관리 (DRAFT, PENDING, APPROVED, PUBLISHED)
- [ ] 파일 업로드 (썸네일, 상품 파일)

**Week 3-4: 주문 관리**
- [ ] 판매 주문 조회 (GET /api/orders?seller=me)
- [ ] 주문 상태 추적
- [ ] 주문 상세 정보

**Week 5-6: 기본 대시보드**
- [ ] 판매자 대시보드 페이지 (/dashboard)
- [ ] 매출 개요 (총 매출, 주문 수, 평균 평점)
- [ ] 최근 주문 목록
- [ ] 내 상품 목록

**Week 7-8: 정산 기본**
- [ ] 정산 내역 조회 (GET /api/settlements)
- [ ] 은행 계좌 등록 (POST /api/user/bank-account)
- [ ] 정산 상세 보기

---

### P1 (High) - 중요 기능

**Week 9-10: 검증 시스템 Level 1**
- [ ] 검증 요청 생성 (POST /api/verifications)
- [ ] 관리자 승인 워크플로우
- [ ] 검증 상태 추적
- [ ] 검증 레벨 배지 표시

**Week 11-12: 리뷰 관리**
- [ ] 리뷰 조회 (GET /api/reviews?productId=xxx)
- [ ] 판매자 답변 작성 (POST /api/reviews/:id/reply)
- [ ] 평점 통계 표시

**Week 13-14: 고급 대시보드**
- [ ] 매출 차트 (일별/주별/월별)
- [ ] 인기 상품 순위
- [ ] 고객 분석
- [ ] 데이터 내보내기

**Week 15-16: 알림 시스템**
- [ ] 주문 알림
- [ ] 리뷰 알림
- [ ] 검증 완료 알림
- [ ] 알림 설정

**Week 17-18: 판매자 등급**
- [ ] 등급 체계 구현
- [ ] 자동 등급 업그레이드
- [ ] 등급별 수수료 차등 적용
- [ ] 등급 배지 표시

---

### P2 (Medium) - 개선 기능

**Phase 2 (3-6개월)**
- [ ] 검증 시스템 Level 2-3 (전문가 검증)
  - [ ] 4가지 전문가 유형별 검증
  - [ ] 검증자 매칭 시스템
  - [ ] 검증 보고서 템플릿
  - [ ] 검증자 정산
- [ ] 개발 의뢰 시스템
  - [ ] 의뢰 등록/조회
  - [ ] 제안서 시스템
  - [ ] 에스크로 결제
  - [ ] 프로젝트 관리
- [ ] 고급 분석
  - [ ] 코호트 분석
  - [ ] 이탈 분석
  - [ ] A/B 테스트
- [ ] 마케팅 도구
  - [ ] 쿠폰 발행
  - [ ] 프로모션
  - [ ] 이메일 캠페인

---

## 4. 현재 구현 상태 확인

### 4.1 데이터베이스 스키마

#### ✅ 구현됨
- **User 모델**: 판매자 정보, 등급, 은행 계좌 등
- **Product 모델**: 상품 정보, 상태, 검증 레벨 등
- **Order 모델**: 주문 정보, 상태 추적
- **Settlement 모델**: 정산 정보
- **SettlementItem 모델**: 정산 항목 상세
- **Verification 모델**: 검증 요청 및 결과
- **VerifierPayout 모델**: 검증자 정산
- **Review 모델**: 리뷰 및 판매자 답변
- **Notification 모델**: 알림

#### ⚠️ 확인 필요
- Verification 모델에 Level 3 전문가별 필드 추가 필요
  - design_expert_id
  - planning_expert_id
  - development_expert_id
  - domain_expert_id
  - 각 전문가별 리뷰 데이터

#### ❌ 미구현
- ProjectRequest 모델 (개발 의뢰)
- Proposal 모델 (제안서)
- ProjectContract 모델 (프로젝트 계약)
- Milestone 모델 (프로젝트 마일스톤)

---

### 4.2 API 엔드포인트

#### ✅ 구현됨
**상품 관리**
- POST /api/products (상품 생성)
- GET /api/products (상품 목록)
- GET /api/products/:id (상품 상세)
- PUT /api/products/:id (상품 수정)
- DELETE /api/products/:id (상품 삭제)
- GET /api/products/me (내 상품)
- POST /api/products/:id/publish (게시 요청)
- POST /api/products/:id/approve (관리자 승인)

**주문 관리**
- GET /api/orders (주문 목록)

**정산**
- GET /api/settlements (정산 목록)
- GET /api/settlements/:id (정산 상세)
- GET /api/settlements/current (현재 정산 미리보기)
- GET /api/settlements/summary (정산 요약)
- POST /api/settlements/process/:id (정산 처리)

**검증**
- POST /api/verifications (검증 요청)
- GET /api/verifications (검증 목록)
- GET /api/verifications/:id (검증 상세)
- POST /api/verifications/:id/assign (검증자 할당)
- POST /api/verifications/:id/start (검증 시작)
- POST /api/verifications/:id/submit (검증 제출)
- POST /api/verifications/:id/cancel (검증 취소)
- GET /api/verifications/my-verifications (내 검증 요청)
- GET /api/verifications/assigned-to-me (할당된 검증)
- GET /api/verifications/verifier-stats (검증자 통계)

**리뷰**
- GET /api/reviews (리뷰 목록)
- POST /api/reviews (리뷰 작성)
- GET /api/reviews/:id (리뷰 상세)
- PUT /api/reviews/:id (리뷰 수정)
- DELETE /api/reviews/:id (리뷰 삭제)
- POST /api/reviews/:id/reply (판매자 답변)
- POST /api/reviews/:id/report (리뷰 신고)
- POST /api/reviews/:id/vote (리뷰 투표)

**분석**
- GET /api/analytics/seller/overview (판매자 개요)
- GET /api/analytics/seller/revenue (매출 차트)
- GET /api/analytics/seller/orders-timeline (주문 타임라인)
- GET /api/analytics/seller/top-products (인기 상품)
- GET /api/analytics/seller/customers (고객 분석)
- GET /api/analytics/seller/pending-actions (대기 작업)
- GET /api/analytics/seller/export (데이터 내보내기)

**알림**
- GET /api/notifications (알림 목록)
- POST /api/notifications/:id/read (알림 읽음)
- POST /api/notifications/mark-all-read (모두 읽음)
- DELETE /api/notifications/clear-all (모두 삭제)

**사용자 설정**
- POST /api/user/bank-account (은행 계좌 등록)
- GET /api/user/notification-settings (알림 설정)
- PUT /api/user/notification-settings (알림 설정 변경)

**파일**
- POST /api/upload (파일 업로드)
- POST /api/upload/batch (배치 업로드)
- GET /api/files/:fileId/download (파일 다운로드)

#### ❌ 미구현
**개발 의뢰** (Phase 2)
- POST /api/project-requests
- GET /api/project-requests
- POST /api/proposals
- GET /api/proposals/my-proposals
- POST /api/project-contracts

**검증 시스템 개선 필요**
- Level 3 전문가별 할당 및 리뷰 기능
- 전문가 유형별 필터링

---

### 4.3 프론트엔드 페이지

#### ✅ 구현됨
- `/dashboard` - 판매자 대시보드 메인
- `/dashboard/products/new` - 상품 등록
- `/dashboard/orders` - 주문 관리
- `/dashboard/settlements` - 정산 내역
- `/dashboard/verifications/:id` - 검증 상세
- `/products/:id/edit` - 상품 수정

#### ⚠️ 확인 필요
- 대시보드 메인 페이지 완성도
  - 매출 차트 컴포넌트
  - 인기 상품 위젯
  - 고객 분석 위젯
  - 대기 작업 알림
- 상품 등록 폼 검증
- 리뷰 관리 페이지 (답변 기능)

#### ❌ 미구현
- `/dashboard/reviews` - 리뷰 관리 페이지
- `/dashboard/analytics` - 상세 분석 페이지
- `/dashboard/settings` - 판매자 설정 페이지
- `/dashboard/verifications` - 검증 요청 목록 페이지
- 개발 의뢰 관련 페이지 (Phase 2)

---

### 4.4 컴포넌트

#### ✅ 구현됨
- `ProductCard` - 상품 카드
- `ProductSkeleton` - 로딩 스켈레톤
- `ReviewList` - 리뷰 목록
- `ReviewCard` - 리뷰 카드
- `OrdersTable` - 주문 테이블
- `TopProductsList` - 인기 상품 리스트
- `FinancialDashboard` - 재무 대시보드
- `VerificationCard` - 검증 카드

#### ⚠️ 확인 필요
- 판매자 답변 UI (ReviewCard 내)
- 상품 상태 표시 (배지, 색상)
- 검증 레벨 배지

#### ❌ 미구현
- `RevenueChart` - 매출 차트 컴포넌트
- `CustomerAnalytics` - 고객 분석 컴포넌트
- `PendingActions` - 대기 작업 위젯
- `SettlementDetails` - 정산 상세 컴포넌트
- `ProductForm` - 상품 등록/수정 폼 (재사용 가능)
- `VerificationRequestForm` - 검증 요청 폼
- `ExpertReviewDisplay` - Level 3 전문가 리뷰 표시

---

## 5. 구현 로드맵

### Phase 1: MVP (Week 1-8) - 2개월

**목표**: 판매자가 상품을 등록하고 판매할 수 있는 최소 기능

**Week 1-2: 상품 관리 완성**
- [ ] 상품 등록 페이지 UI 개선
  - 단계별 폼 (정보 입력 → 파일 업로드 → 미리보기)
  - 유효성 검증 강화
  - 드래그 앤 드롭 파일 업로드
- [ ] 상품 수정 페이지
- [ ] 상품 목록 페이지 (판매자용)
  - 필터링 (상태별, 카테고리별)
  - 정렬 (최신순, 판매량순)
  - 일괄 작업 (삭제, 게시 요청)

**Week 3-4: 주문 관리**
- [ ] 주문 목록 페이지 개선
  - 상태별 탭 (전체, 진행중, 완료, 취소)
  - 검색 기능
  - 날짜 필터
- [ ] 주문 상세 페이지
  - 구매자 정보
  - 상품 정보
  - 결제 정보
  - 타임라인

**Week 5-6: 기본 대시보드**
- [ ] 대시보드 메인 페이지
  - 핵심 지표 카드 (매출, 주문, 평점)
  - 최근 주문 목록
  - 빠른 링크 (상품 등록, 정산 보기)
- [ ] 반응형 레이아웃
- [ ] 로딩 상태 처리

**Week 7-8: 정산 기본**
- [ ] 정산 목록 페이지
  - 기간별 정산 내역
  - 상태별 필터
- [ ] 정산 상세 페이지
  - 상품별 매출 내역
  - 수수료 계산 내역
  - PDF 다운로드
- [ ] 은행 계좌 등록 폼
  - 계좌 검증 (소액 입금)

**Week 8: 테스트 및 버그 수정**
- [ ] E2E 테스트 (상품 등록 → 판매 → 정산)
- [ ] 성능 최적화
- [ ] 사용성 개선

**MVP 릴리스 체크리스트**:
- [ ] 상품 등록/수정/삭제 가능
- [ ] 주문 조회 가능
- [ ] 정산 내역 확인 가능
- [ ] 은행 계좌 등록 가능
- [ ] 기본 대시보드 작동
- [ ] 모바일 반응형 지원
- [ ] 에러 핸들링

---

### Phase 2: 핵심 기능 (Week 9-18) - 2.5개월

**목표**: 검증 시스템, 리뷰 관리, 고급 분석 등 핵심 기능 구현

**Week 9-10: 검증 시스템 Level 1**
- [ ] 검증 요청 폼
  - 레벨 선택
  - 비용 확인
  - 결제 연동
- [ ] 검증 상태 추적 페이지
- [ ] 검증 완료 시 배지 표시
- [ ] 관리자 승인 워크플로우

**Week 11-12: 리뷰 관리**
- [ ] 리뷰 관리 페이지 (/dashboard/reviews)
  - 상품별 필터
  - 평점별 필터
  - 답변 여부 필터
- [ ] 리뷰 답변 UI
  - 답변 작성 폼
  - 답변 수정/삭제
- [ ] 평점 통계 대시보드
  - 평균 평점
  - 평점 분포 차트
  - 리뷰 트렌드

**Week 13-14: 고급 대시보드**
- [ ] 매출 차트 컴포넌트
  - Chart.js 또는 Recharts 사용
  - 일별/주별/월별 토글
  - 전년 동기 대비
- [ ] 인기 상품 위젯
  - 판매량 TOP 5
  - 매출액 TOP 5
  - 평점 TOP 5
- [ ] 고객 분석 위젯
  - 신규 vs 재구매
  - 고객 지역 분포
  - 구매 패턴
- [ ] 데이터 내보내기 기능
  - CSV/Excel 다운로드
  - 날짜 범위 선택
  - 항목 선택

**Week 15-16: 알림 시스템**
- [ ] 실시간 알림 (WebSocket 또는 SSE)
- [ ] 알림 센터 UI
  - 읽지 않은 알림 배지
  - 알림 목록
  - 알림 타입별 아이콘
- [ ] 이메일 알림
  - 템플릿 디자인
  - SendGrid 또는 AWS SES 연동
- [ ] 알림 설정 페이지
  - 알림 유형별 On/Off
  - 이메일 vs 앱 선택

**Week 17-18: 판매자 등급**
- [ ] 등급 자동 계산 로직
  - 매일 크론잡 실행
  - 판매자 통계 업데이트
  - 등급 업그레이드 확인
- [ ] 등급 배지 UI
  - 프로필에 표시
  - 상품 카드에 표시
- [ ] 등급별 수수료 적용
  - 정산 시 등급별 수수료 계산
- [ ] 등급 안내 페이지
  - 현재 등급 및 진행률
  - 다음 등급 조건
  - 혜택 비교

---

### Phase 3: 고급 기능 (Month 6-9) - 3개월

**목표**: 검증 Level 2-3, 개발 의뢰, 마케팅 도구 등

**Month 6: 검증 시스템 Level 2-3**
- [ ] 전문가 검증자 등록 시스템
  - 검증자 프로필
  - 전문 분야 설정 (디자인, 기획, 개발, 도메인)
  - 포트폴리오
- [ ] 검증자 매칭 알고리즘
  - 카테고리 기반 매칭
  - 평점 기반 우선순위
  - 작업량 분배
- [ ] 검증 작업 페이지 (검증자용)
  - 할당된 검증 목록
  - 검증 진행 인터페이스
  - 보고서 템플릿
- [ ] Level 3 전문가별 리뷰
  - 디자인 전문가 체크리스트
  - 기획 전문가 체크리스트
  - 개발 전문가 체크리스트
  - 도메인 전문가 체크리스트
- [ ] 검증 보고서 UI
  - 점수 시각화
  - 배지 표시
  - 개선사항 목록
  - 전문가별 의견
- [ ] 검증자 정산 시스템
  - 검증 수수료 70% 지급
  - 월별 정산

**Month 7: 개발 의뢰 시스템**
- [ ] 의뢰 등록 페이지 (구매자용)
  - 요구사항 입력
  - 예산 범위 설정
  - 기한 설정
  - 파일 첨부
- [ ] 의뢰 목록 페이지 (판매자용)
  - 카테고리 필터
  - 예산 범위 필터
  - 정렬 (최신순, 예산 높은순)
- [ ] 제안서 작성 페이지
  - 견적 입력
  - 일정 제안
  - 포트폴리오 첨부
- [ ] 제안서 비교 페이지 (구매자용)
  - 제안서 목록
  - 판매자 프로필
  - 평점 및 리뷰
- [ ] 계약 생성 및 에스크로
  - 계약서 자동 생성
  - 에스크로 결제 (50% 선지급)
- [ ] 프로젝트 관리 페이지
  - 마일스톤 관리
  - 파일 공유
  - 메시징
  - 진행률 추적
- [ ] 프로젝트 완료 및 정산
  - 최종 검수
  - 잔금 정산
  - 리뷰 작성

**Month 8: 고급 분석**
- [ ] 코호트 분석
  - 구매자 리텐션
  - 재구매율
- [ ] 이탈 분석
  - 장바구니 이탈
  - 결제 이탈
- [ ] A/B 테스트 프레임워크
  - 상품 설명 A/B 테스트
  - 가격 테스트
- [ ] 예측 분석
  - 다음 달 매출 예측
  - 인기 카테고리 예측

**Month 9: 마케팅 도구**
- [ ] 쿠폰 시스템
  - 쿠폰 생성
  - 할인율/할인금액 설정
  - 유효기간 설정
  - 사용 횟수 제한
- [ ] 프로모션
  - 타임 세일
  - 번들 할인
  - 첫 구매 할인
- [ ] 이메일 캠페인
  - 고객 세그먼트
  - 이메일 템플릿
  - 발송 스케줄링
  - 오픈율/클릭률 추적
- [ ] 추천 프로그램
  - 추천 링크 생성
  - 추천 보상
  - 추천 통계

---

### Phase 4: 최적화 및 확장 (Month 10-12) - 3개월

**목표**: 성능 최적화, 확장성, 엔터프라이즈 기능

**Month 10: 성능 최적화**
- [ ] 데이터베이스 쿼리 최적화
  - 인덱스 추가
  - N+1 문제 해결
  - 쿼리 캐싱
- [ ] Redis 캐싱
  - 인기 상품 캐싱
  - 통계 데이터 캐싱
  - 세션 캐싱
- [ ] CDN 도입
  - 이미지 최적화
  - 정적 파일 캐싱
- [ ] 코드 스플리팅
  - 페이지별 lazy loading
  - 컴포넌트 lazy loading
- [ ] 모니터링
  - Sentry (에러 추적)
  - DataDog (성능 모니터링)
  - 커스텀 대시보드

**Month 11: 확장성**
- [ ] 마이크로서비스 아키텍처 검토
  - 결제 서비스 분리
  - 알림 서비스 분리
  - 검증 서비스 분리
- [ ] 메시지 큐 도입 (RabbitMQ/Kafka)
  - 비동기 작업 처리
  - 이메일 발송 큐
  - 정산 처리 큐
- [ ] 수평적 확장
  - 로드 밸런서
  - 오토 스케일링
- [ ] 데이터베이스 샤딩 전략

**Month 12: 엔터프라이즈 기능**
- [ ] 팀 협업 기능
  - 팀 계정
  - 역할 기반 권한 (RBAC)
  - 팀원 초대
- [ ] API 공개
  - REST API 문서
  - GraphQL API
  - Rate limiting
  - API 키 관리
- [ ] 화이트 라벨
  - 커스텀 브랜딩
  - 커스텀 도메인
- [ ] SLA 보증
  - 99.9% 업타임
  - 전담 지원
- [ ] 엔터프라이즈 플랜
  - 볼륨 할인
  - 우선 지원
  - 맞춤 기능 개발

---

## 6. 기술 스택 및 도구

### 6.1 백엔드
- **프레임워크**: Next.js API Routes
- **데이터베이스**: PostgreSQL (Prisma ORM)
- **캐싱**: Redis
- **파일 스토리지**: AWS S3 또는 Cloudinary
- **결제**: Stripe, Toss Payments
- **이메일**: SendGrid, AWS SES
- **스케줄링**: node-cron (정산, 등급 업데이트)

### 6.2 프론트엔드
- **프레임워크**: Next.js 14 (App Router)
- **UI 라이브러리**: React
- **스타일링**: Tailwind CSS
- **컴포넌트**: Radix UI, shadcn/ui
- **차트**: Chart.js 또는 Recharts
- **폼 관리**: React Hook Form + Zod
- **상태 관리**: React Context API, Zustand (필요시)

### 6.3 인프라
- **호스팅**: Vercel (Next.js), AWS EC2 (백엔드 서비스)
- **데이터베이스**: AWS RDS (PostgreSQL)
- **캐시**: AWS ElastiCache (Redis)
- **CDN**: Cloudflare
- **모니터링**: Sentry, DataDog
- **CI/CD**: GitHub Actions

---

## 7. 성공 지표 (KPI)

### 7.1 판매자 활동 지표
- **등록 판매자 수**: 목표 50명 (Q1), 200명 (Q2), 1,000명 (Q3)
- **활성 판매자 비율**: 30일 내 로그인한 판매자 비율 > 60%
- **상품 등록 수**: 목표 200개 (Q1), 1,000개 (Q2), 5,000개 (Q3)
- **검증 상품 비율**: 전체 상품 중 검증된 상품 > 30%

### 7.2 비즈니스 지표
- **총 거래액 (GMV)**: 목표 $10,000 (Q1), $50,000 (Q2), $200,000 (Q3)
- **플랫폼 수수료 수익**: GMV의 10-20%
- **검증 수수료 수익**: 검증비의 30%
- **판매자 평균 수익**: 판매자당 월 평균 $200 (Q3)

### 7.3 사용자 경험 지표
- **상품 등록 완료율**: 상품 등록 시작 대비 완료 비율 > 70%
- **정산 만족도**: 정산 프로세스 만족도 설문 > 4.0/5.0
- **대시보드 활용도**: 주간 대시보드 방문 횟수 > 3회
- **지원 티켓 응답 시간**: 평균 < 24시간

### 7.4 기술 지표
- **API 응답 시간**: P95 < 200ms
- **에러율**: < 0.1%
- **업타임**: > 99.9%
- **페이지 로드 시간**: < 2초

---

## 8. 위험 요소 및 완화 전략

### 8.1 초기 판매자 부족
**위험**: 플랫폼 초기 판매자 확보 어려움
**완화 전략**:
- 수수료 면제 프로모션 (처음 3개월)
- 검증 무료 제공 (Level 1)
- 얼리어답터 인센티브 (추가 노출, 마케팅 지원)
- 직접 판매자 리크루팅 (n8n 커뮤니티, AI 개발자 커뮤니티)

### 8.2 품질 이슈
**위험**: 저품질 상품으로 인한 신뢰도 하락
**완화 전략**:
- 검증 시스템 강화
- 관리자 승인 프로세스 (Level 0도 승인 필요)
- 명확한 환불 정책
- 평점 및 리뷰 시스템
- 저평점 상품 자동 숨김 (평점 < 3.0)

### 8.3 정산 지연
**위험**: 정산 지연으로 인한 판매자 불만
**완화 전략**:
- 자동화된 정산 프로세스
- 명확한 정산 일정 공지
- 정산 상태 실시간 추적
- 문제 발생 시 우선 지원

### 8.4 검증자 부족
**위험**: 검증 요청 대비 검증자 부족
**완화 전략**:
- 검증자 리크루팅 (프리랜서 플랫폼, 개발자 커뮤니티)
- 검증 수수료 매력적으로 설정 (70%)
- 검증자 등급 및 보상 시스템
- Level 1 자동화 (관리자 부담 감소)

### 8.5 확장성 문제
**위험**: 사용자 증가 시 성능 저하
**완화 전략**:
- 초기부터 확장 가능한 아키텍처 설계
- 데이터베이스 인덱싱 최적화
- Redis 캐싱 활용
- CDN 도입
- 모니터링 및 알림 시스템

---

## 9. 다음 단계

### 즉시 수행
1. **데이터베이스 스키마 보완**
   - Verification 모델에 Level 3 전문가 필드 추가
   - 마이그레이션 실행

2. **API 엔드포인트 검증**
   - 모든 판매자 관련 API 테스트
   - Postman 또는 Insomnia 컬렉션 작성

3. **대시보드 페이지 완성**
   - 매출 차트 컴포넌트 구현
   - 인기 상품 위젯 구현
   - 반응형 레이아웃 검증

4. **상품 등록 폼 개선**
   - 유효성 검증 강화
   - 에러 메시지 개선
   - 미리보기 기능

### 단기 (1-2주)
5. **리뷰 관리 페이지 구현**
   - 리뷰 목록 및 필터
   - 판매자 답변 UI
   - 평점 통계

6. **알림 시스템 구현**
   - 실시간 알림
   - 이메일 알림
   - 알림 설정

7. **E2E 테스트 작성**
   - 상품 등록 플로우
   - 주문 플로우
   - 정산 플로우

### 중기 (1-2개월)
8. **검증 시스템 Level 1 완성**
   - 검증 요청 UI
   - 관리자 승인 워크플로우
   - 검증 배지 표시

9. **고급 대시보드 구현**
   - 매출 차트
   - 고객 분석
   - 데이터 내보내기

10. **판매자 등급 시스템**
    - 등급 계산 로직
    - 등급 배지 UI
    - 등급별 수수료

---

## 부록

### A. 참고 문서
- `/Volumes/DATA/2026-프로젝트/1.실험실/AI_marketplace/AI_Marketplace_PRD.md`
- `/Volumes/DATA/2026-프로젝트/1.실험실/AI_marketplace/PRODUCT_UI_README.md`
- `/Volumes/DATA/2026-프로젝트/1.실험실/AI_marketplace/prisma/schema.prisma`

### B. 데이터베이스 스키마 (핵심 모델)

**User (판매자 정보)**
```prisma
model User {
  id                String   @id @default(cuid())
  email             String   @unique
  name              String
  role              Role     @default(BUYER)
  seller_tier       SellerTier @default(NEW)

  // 정산 정보
  stripe_account_id String?
  bank_name         String?
  bank_account      String?
  account_holder    String?
  bank_verified     Boolean  @default(false)
  platform_fee_rate Float    @default(0.15)

  // 검증자 정보
  verifier_stats    Json?

  // 관계
  products          Product[] @relation("ProductSeller")
  settlements       Settlement[]
  verificationsAsVerifier Verification[] @relation("VerificationVerifier")
  verifierPayouts   VerifierPayout[]
}

enum Role {
  BUYER
  SELLER
  VERIFIER
  ADMIN
}

enum SellerTier {
  NEW
  VERIFIED
  PRO
  MASTER
}
```

**Product (상품)**
```prisma
model Product {
  id                  String      @id @default(cuid())
  seller_id           String
  title               String
  description         String
  category            String
  price               Int
  status              ProductStatus @default(DRAFT)
  verification_level  Int         @default(0)
  rating_average      Float?
  rating_count        Int         @default(0)

  seller              User        @relation("ProductSeller", fields: [seller_id], references: [id])
  verifications       Verification[]
  orders              Order[]
  reviews             Review[]
  settlementItems     SettlementItem[]
}

enum ProductStatus {
  DRAFT
  PENDING
  APPROVED
  PUBLISHED
  REJECTED
  SUSPENDED
}
```

**Order (주문)**
```prisma
model Order {
  id              String      @id @default(cuid())
  buyer_id        String
  product_id      String
  price           Int
  platform_fee    Int
  seller_revenue  Int
  status          OrderStatus @default(PENDING)

  buyer           User        @relation("OrderBuyer", fields: [buyer_id], references: [id])
  product         Product     @relation(fields: [product_id], references: [id])
}

enum OrderStatus {
  PENDING
  PROCESSING
  COMPLETED
  CANCELLED
  REFUNDED
}
```

**Settlement (정산)**
```prisma
model Settlement {
  id              String           @id @default(cuid())
  seller_id       String
  total_sales     Int
  platform_fee    Int
  net_amount      Int
  status          SettlementStatus @default(PENDING)
  period_start    DateTime
  period_end      DateTime
  payout_date     DateTime?

  seller          User             @relation(fields: [seller_id], references: [id])
  items           SettlementItem[]
}

enum SettlementStatus {
  PENDING
  PROCESSING
  PAID
  FAILED
  CANCELLED
}
```

**Verification (검증)**
```prisma
model Verification {
  id             String             @id @default(cuid())
  product_id     String
  verifier_id    String?
  level          Int
  status         VerificationStatus @default(PENDING)
  fee            Int
  platform_share Int
  verifier_share Int
  report         Json?
  score          Float?
  badges         String[]

  product        Product            @relation(fields: [product_id], references: [id])
  verifier       User?              @relation("VerificationVerifier", fields: [verifier_id], references: [id])
}

enum VerificationStatus {
  PENDING
  ASSIGNED
  IN_PROGRESS
  COMPLETED
  APPROVED
  REJECTED
  CANCELLED
}
```

### C. API 엔드포인트 전체 목록

**상품 관리**
- POST   /api/products
- GET    /api/products
- GET    /api/products/:id
- PUT    /api/products/:id
- DELETE /api/products/:id
- GET    /api/products/me
- POST   /api/products/:id/publish
- POST   /api/products/:id/approve

**주문 관리**
- GET    /api/orders

**정산**
- GET    /api/settlements
- GET    /api/settlements/:id
- GET    /api/settlements/current
- GET    /api/settlements/summary
- POST   /api/settlements/process/:id

**검증**
- POST   /api/verifications
- GET    /api/verifications
- GET    /api/verifications/:id
- POST   /api/verifications/:id/assign
- POST   /api/verifications/:id/start
- POST   /api/verifications/:id/submit
- POST   /api/verifications/:id/cancel
- GET    /api/verifications/my-verifications
- GET    /api/verifications/assigned-to-me

**리뷰**
- GET    /api/reviews
- POST   /api/reviews/:id/reply
- POST   /api/reviews/:id/report
- POST   /api/reviews/:id/vote

**분석**
- GET    /api/analytics/seller/overview
- GET    /api/analytics/seller/revenue
- GET    /api/analytics/seller/orders-timeline
- GET    /api/analytics/seller/top-products
- GET    /api/analytics/seller/customers
- GET    /api/analytics/seller/pending-actions
- GET    /api/analytics/seller/export

**알림**
- GET    /api/notifications
- POST   /api/notifications/:id/read
- POST   /api/notifications/mark-all-read
- DELETE /api/notifications/clear-all

**사용자 설정**
- POST   /api/user/bank-account
- GET    /api/user/notification-settings
- PUT    /api/user/notification-settings

**파일**
- POST   /api/upload
- POST   /api/upload/batch
- GET    /api/files/:fileId/download

---

**문서 버전**: 1.0
**최종 수정일**: 2025-01-10
**작성자**: BMAD Product Manager Agent
