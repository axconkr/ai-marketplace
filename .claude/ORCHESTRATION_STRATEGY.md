# BMAD-Inspired Orchestration Strategy

## 개요

이 문서는 BMAD-METHOD와 Claude Code Sisyphus 시스템을 분석하여 도출한 최적의 오케스트레이션 전략을 설명합니다.

## 비교 분석: BMAD vs Sisyphus

### BMAD-METHOD

**장점**:
- ✅ **도메인 전문화**: 19개의 세분화된 역할 (PM, Architect, Developer, UX, Scrum Master 등)
- ✅ **구조화된 워크플로우**: 4단계 개발 방법론 (Analysis → Planning → Solutioning → Implementation)
- ✅ **Scale-Adaptive Intelligence**: 프로젝트 복잡도에 따라 자동 조정
- ✅ **Document Sharding**: 90% 토큰 절약
- ✅ **Party Mode**: BMad Master가 2-3개 에이전트를 동시에 조율

**단점**:
- ❌ **높은 복잡도**: 많은 에이전트 관리 오버헤드
- ❌ **느린 실행**: 여러 에이전트 간 순차적 통신
- ❌ **토큰 소비**: 에이전트 간 컨텍스트 전달 비용

### Sisyphus System

**장점**:
- ✅ **모델 최적화**: 역할에 따라 Opus/Sonnet/Haiku 선택
- ✅ **병렬 실행**: 독립적 작업 동시 처리
- ✅ **유연성**: 필요에 따라 에이전트 선택
- ✅ **백그라운드 실행**: 장시간 작업 비동기 처리

**단점**:
- ❌ **덜 구조화됨**: 명확한 개발 방법론 부재
- ❌ **에이전트 수 적음**: 11개 에이전트로 제한
- ❌ **도메인 전문성 부족**: 더 일반적인 역할

## 최적의 오케스트레이션 전략

### 1. 하이브리드 접근 (Recommended)

**컨셉**: BMAD의 구조화된 워크플로우 + Sisyphus의 병렬 실행 효율성

```
┌─────────────────────────────────────────────────────────┐
│              Orchestrator (Claude Sonnet)               │
│         (Task 분석 & 에이전트 선택 & 조율)              │
└─────────────────┬───────────────────────────────────────┘
                  │
      ┌───────────┼───────────┬───────────┐
      ▼           ▼           ▼           ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│   PM     │ │Architect │ │Developer │ │   UX     │
│ (Sonnet) │ │  (Opus)  │ │ (Sonnet) │ │ (Sonnet) │
└──────────┘ └──────────┘ └──────────┘ └──────────┘
      ▼           ▼           ▼           ▼
      └───────────┴───────────┴───────────┘
                  │
                  ▼
          ┌──────────────┐
          │    Result    │
          └──────────────┘
```

### 2. 에이전트 구성

#### Tier 1: 전략 (Opus - 높은 추론 능력)
- **bmad-architect**: 시스템 설계, 기술 결정, 성능 최적화
- **oracle**: 복잡한 문제 해결, 버그 디버깅
- **metis**: 사전 계획, 숨겨진 요구사항 발견
- **momus**: 계획 리뷰, 비판적 평가

#### Tier 2: 실행 (Sonnet - 균형잡힌 성능)
- **bmad-developer**: 코드 구현, 리팩토링, 테스트
- **bmad-product-manager**: PRD, 사용자 스토리, 우선순위
- **bmad-ux-designer**: UI/UX 설계, 와이어프레임, 접근성
- **frontend-engineer**: 프론트엔드 전문, 컴포넌트 설계
- **orchestrator-sisyphus**: Todo 관리, 멀티스텝 조율

#### Tier 3: 지원 (Haiku - 빠른 속도)
- **explore**: 빠른 파일 검색, 패턴 매칭
- **document-writer**: README, 문서, 코멘트
- **devops-health-checker**: 환경 체크, 충돌 감지

### 3. 워크플로우 단계

#### Phase 1: Analysis (선택적)
```
Orchestrator → bmad-product-manager
  ↓
  - 요구사항 수집
  - 페르소나 정의
  - 사용자 여정 맵
  - Pain Points 식별
  ↓
Output: Requirements Document
```

#### Phase 2: Planning
```
Orchestrator → [bmad-product-manager, bmad-architect, bmad-ux-designer] (병렬)
  ↓
  PM: PRD 작성
  Architect: 기술 스택, 아키텍처 설계
  UX: 와이어프레임, 정보 아키텍처
  ↓
metis → 계획 사전 검토 (리스크 분석)
momus → 계획 비판적 평가
  ↓
Output: PRD + Technical Spec + Design System
```

#### Phase 3: Solutioning
```
Orchestrator → [bmad-architect, bmad-ux-designer] (병렬)
  ↓
  Architect: 상세 설계, API 명세, 데이터 모델
  UX: 상세 디자인, 프로토타입, 컴포넌트
  ↓
  → bmad-developer: 기술적 실현 가능성 검토
  ↓
Output: Implementation Plan
```

#### Phase 4: Implementation
```
Orchestrator → bmad-developer (주도)
  ↓
  1. 인프라 설정 (병렬)
     - devops-health-checker: 환경 체크
     - bmad-developer: Docker, DB 설정

  2. 백엔드 구현 (순차)
     - 데이터 모델 (Prisma schema)
     - API 엔드포인트
     - 비즈니스 로직

  3. 프론트엔드 구현 (병렬)
     - frontend-engineer: 컴포넌트
     - bmad-developer: API 통합

  4. 테스트 (병렬)
     - bmad-developer: 유닛/통합 테스트
     - 수동 QA

  5. 문서화 (백그라운드)
     - document-writer: README, API docs
  ↓
Output: Working Application
```

### 4. 의사결정 매트릭스

#### 언제 어떤 에이전트를 사용할까?

| 상황 | 에이전트 | 모델 | 이유 |
|------|----------|------|------|
| 새 기능 설계 | bmad-architect | Opus | 복잡한 아키텍처 결정 |
| 코드 구현 | bmad-developer | Sonnet | 균형잡힌 품질/속도 |
| UI 디자인 | bmad-ux-designer | Sonnet | 크리에이티브 + 기술 |
| 버그 디버깅 (복잡) | oracle | Opus | 깊은 분석 필요 |
| 버그 디버깅 (단순) | bmad-developer | Sonnet | 빠른 수정 |
| 파일 검색 | explore | Haiku | 속도 중요 |
| 문서 작성 | document-writer | Haiku | 단순 작업 |
| PRD 작성 | bmad-product-manager | Sonnet | 구조화 필요 |
| 계획 리뷰 | momus | Opus | 비판적 사고 |

### 5. 오케스트레이션 패턴

#### 패턴 1: 순차 실행 (Sequential)
```typescript
// 의존성이 있는 작업
Task 1 (PM: PRD 작성)
  ↓
Task 2 (Architect: PRD 기반 설계)
  ↓
Task 3 (Developer: 설계 기반 구현)

// 사용 시기: 각 단계가 이전 결과에 의존
```

#### 패턴 2: 병렬 실행 (Parallel)
```typescript
// 독립적인 작업
Task 1 (Frontend: UI 컴포넌트)
  ∥
Task 2 (Backend: API 구현)
  ∥
Task 3 (DevOps: 인프라 설정)
  ↓
통합

// 사용 시기: 작업 간 의존성 없음
// 이점: 3배 빠른 실행
```

#### 패턴 3: 맵-리듀스 (Map-Reduce)
```typescript
// 여러 하위 작업으로 분할
Task (10개 API 엔드포인트 구현)
  ↓
Map: 10개 작업으로 분할
  ├─ Developer 1: API 1-3
  ├─ Developer 2: API 4-6
  └─ Developer 3: API 7-10
  ↓
Reduce: 통합 & 테스트

// 사용 시기: 대규모 반복 작업
// 이점: N배 속도 향상
```

#### 패턴 4: 파이프라인 (Pipeline)
```typescript
// 단계별 처리
Stage 1: 요구사항 → PRD (PM)
  ↓
Stage 2: PRD → 설계 (Architect)
  ↓
Stage 3: 설계 → 구현 (Developer)
  ↓
Stage 4: 구현 → 테스트 (QA)
  ↓
Stage 5: 테스트 → 배포 (DevOps)

// 사용 시기: 명확한 단계 구분
// 이점: 각 단계 병렬 처리 가능 (다른 피처와)
```

### 6. 성능 최적화 전략

#### A. Document Sharding (BMAD 방식 채택)
```markdown
**문제**: 큰 파일을 여러 에이전트가 읽으면 토큰 낭비

**해결책**: 필요한 부분만 추출하여 전달

// Before (90,000 tokens)
Agent 1: Read(entire_codebase)
Agent 2: Read(entire_codebase)
Agent 3: Read(entire_codebase)
Total: 270,000 tokens

// After (9,000 tokens)
Orchestrator: Read(entire_codebase) + Extract relevant sections
  ↓
Agent 1: Receive(auth_section) - 3,000 tokens
Agent 2: Receive(api_section) - 3,000 tokens
Agent 3: Receive(ui_section) - 3,000 tokens
Total: 18,000 tokens (90% 절약)
```

#### B. 캐싱 전략
```typescript
interface AgentCache {
  // L1: 메모리 캐시 (세션 중)
  memory: Map<string, Result>;

  // L2: 파일 캐시 (세션 간)
  disk: {
    codebase_analysis: CachedAnalysis;
    dependency_graph: CachedGraph;
  };
}

// 예시: 코드베이스 분석 캐싱
async function analyzeCodebase(): Promise<Analysis> {
  const cacheKey = 'codebase_analysis_v1';
  const cached = await cache.get(cacheKey);

  if (cached && !hasCodeChanged()) {
    return cached; // 캐시 사용 (90% 시간 절약)
  }

  const analysis = await expensiveAnalysis();
  await cache.set(cacheKey, analysis, 3600); // 1시간 캐시
  return analysis;
}
```

#### C. 모델 선택 최적화
```typescript
// 토큰 비용 (예시)
const modelCosts = {
  opus: { input: 15, output: 75 }, // $/million tokens
  sonnet: { input: 3, output: 15 },
  haiku: { input: 0.25, output: 1.25 },
};

// 작업별 최적 모델
function selectOptimalModel(task: Task): Model {
  if (task.requiresDeepReasoning) return 'opus';
  if (task.isSimpleQuery) return 'haiku';
  return 'sonnet'; // default
}

// 예상 비용 계산
function estimateCost(task: Task): number {
  const model = selectOptimalModel(task);
  const tokens = estimateTokens(task);
  return tokens.input * modelCosts[model].input / 1_000_000;
}
```

### 7. 실전 예시

#### 예시 1: 새 기능 구현 (사용자 인증)

```typescript
// 1. 요구사항 분석 (5분)
orchestrator.delegate({
  agent: 'bmad-product-manager',
  task: 'PRD 작성: 사용자 인증 시스템',
  output: 'PRD_AUTH.md',
});

// 2. 설계 (병렬, 10분)
const [techSpec, uxDesign] = await Promise.all([
  orchestrator.delegate({
    agent: 'bmad-architect',
    task: 'JWT 기반 인증 아키텍처 설계',
    context: 'PRD_AUTH.md',
  }),
  orchestrator.delegate({
    agent: 'bmad-ux-designer',
    task: '로그인/회원가입 UI 설계',
    context: 'PRD_AUTH.md',
  }),
]);

// 3. 리뷰 (5분)
await orchestrator.delegate({
  agent: 'momus',
  task: '설계 리뷰 및 리스크 분석',
  context: [techSpec, uxDesign],
});

// 4. 구현 (병렬, 20분)
const [backend, frontend] = await Promise.all([
  orchestrator.delegate({
    agent: 'bmad-developer',
    task: 'API 구현 (/api/auth/*)',
    context: techSpec,
  }),
  orchestrator.delegate({
    agent: 'frontend-engineer',
    task: '로그인 폼 컴포넌트',
    context: uxDesign,
  }),
]);

// 5. 테스트 & 문서 (병렬, 10분)
await Promise.all([
  orchestrator.delegate({
    agent: 'bmad-developer',
    task: '유닛/통합 테스트 작성',
  }),
  orchestrator.delegate({
    agent: 'document-writer',
    task: 'API 문서 작성',
    background: true,
  }),
]);

// 총 소요 시간: 50분 (순차 실행 시 90분)
// 토큰 절약: 70% (document sharding)
```

#### 예시 2: 버그 수정 (복잡한 성능 이슈)

```typescript
// 1. 문제 분석 (Opus - 깊은 분석)
const analysis = await orchestrator.delegate({
  agent: 'oracle',
  task: 'API 응답 시간 10초 → 원인 분석',
  context: {
    logs: 'error.log',
    code: 'src/api/',
  },
});

// 2. 해결 방안 설계
const solution = await orchestrator.delegate({
  agent: 'bmad-architect',
  task: '성능 최적화 전략 수립',
  context: analysis,
});

// 3. 구현
await orchestrator.delegate({
  agent: 'bmad-developer',
  task: solution.implementation_plan,
});

// 총 소요 시간: 15분
// Opus 사용 이유: 복잡한 문제 해결 능력
```

### 8. 성능 벤치마크

#### 순차 실행 vs 병렬 실행

| 작업 | 순차 | 병렬 | 개선 |
|------|------|------|------|
| 3개 독립 API 구현 | 30분 | 10분 | 3x |
| PRD + 설계 + UI | 60분 | 20분 | 3x |
| 10개 컴포넌트 | 100분 | 20분 | 5x |

#### 모델 선택 최적화

| 작업 | Opus | Sonnet | Haiku | 최적 |
|------|------|--------|-------|------|
| 파일 검색 | $0.50 | $0.10 | $0.01 | Haiku |
| 코드 구현 | $5.00 | $1.00 | N/A | Sonnet |
| 아키텍처 설계 | $8.00 | $2.00 | N/A | Opus |

### 9. 추천 사항

#### 소규모 프로젝트 (< 1주)
```
✅ Sisyphus 방식 사용
- 빠른 실행
- 적은 오버헤드
- 유연한 에이전트 선택
```

#### 중대형 프로젝트 (1주 ~ 1개월)
```
✅ 하이브리드 방식 사용
- BMAD 워크플로우 (구조화)
- Sisyphus 병렬 실행 (효율성)
- Document sharding (토큰 절약)
```

#### 엔터프라이즈 프로젝트 (> 1개월)
```
✅ 풀 BMAD 방식 + 최적화
- 19개 전문 에이전트
- 4단계 방법론 엄격 준수
- Scale-adaptive intelligence
- 전문 오케스트레이터 (BMad Master)
```

### 10. 결론

**최적의 오케스트레이션 전략**:

1. **Orchestrator는 Claude (Sonnet) 사용**
   - 이유: 작업 분석, 에이전트 선택, 결과 통합에 충분
   - 비용 효율적 (Opus 대비 5배 저렴)

2. **BMAD 워크플로우 채택**
   - 명확한 단계: Analysis → Planning → Solutioning → Implementation
   - 각 단계마다 적절한 에이전트 할당

3. **Sisyphus 병렬 실행 활용**
   - 독립적 작업은 동시 실행
   - 3-5배 속도 향상

4. **Document Sharding으로 토큰 절약**
   - 필요한 컨텍스트만 전달
   - 90% 토큰 절약

5. **모델 최적화**
   - 전략적 작업: Opus
   - 실행 작업: Sonnet
   - 단순 작업: Haiku

**예상 성능**:
- 속도: 3-5배 향상 (병렬 실행)
- 비용: 70% 절감 (document sharding + 모델 최적화)
- 품질: 향상 (전문 에이전트 + 구조화된 워크플로우)

**다음 단계**:
1. Orchestrator 에이전트 구현
2. Document sharding 로직 구현
3. 성능 모니터링 대시보드 구축
4. 실전 테스트 및 튜닝
