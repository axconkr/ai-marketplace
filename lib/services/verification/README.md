# Verification Services

Product verification system for AI Marketplace.

## Quick Start

### 1. Run Prisma Migration

```bash
npx prisma migrate dev --name add_verification_system
npx prisma generate
```

### 2. Basic Usage

```typescript
import {
  runLevel0Verification,
  requestLevel1Verification,
  submitVerificationReview,
} from '@/lib/services/verification';

// Level 0: Free automatic checks
const level0 = await runLevel0Verification(productId);
// Returns: { status: 'APPROVED' | 'REJECTED', report, score }

// Level 1: $50 with manual review
const level1 = await requestLevel1Verification(productId, verifierId);
// Returns: verification object with PENDING status

// Submit review (verifier)
const result = await submitVerificationReview({
  verificationId,
  verifierId,
  review: {
    approved: true,
    score: 90,
    comments: "Great quality",
    badges: ["quality"],
  },
});
```

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/verifications` | Request verification | Seller |
| GET | `/api/verifications` | List verifications | Seller/Verifier/Admin |
| GET | `/api/verifications/[id]` | Get details | Seller/Verifier/Admin |
| PATCH | `/api/verifications/[id]/assign` | Assign to verifier | Admin |
| PATCH | `/api/verifications/[id]/start` | Start review | Verifier |
| POST | `/api/verifications/[id]/submit` | Submit review | Verifier |
| POST | `/api/verifications/[id]/cancel` | Cancel verification | Seller/Admin |
| GET | `/api/verifications/available` | List available | Verifier |
| POST | `/api/verifications/[id]/claim` | Claim verification | Verifier |

## Verification Levels

| Level | Price | Features | Status |
|-------|-------|----------|--------|
| 0 | Free | Automatic checks only | ✅ MVP |
| 1 | $50 | Automated tests + manual review | ✅ MVP |
| 2 | $150 | Expert code review | 🚧 Phase 2 |
| 3 | $500 | Security audit + performance | 🚧 Phase 2 |

## File Structure

```
lib/services/verification/
├── index.ts           # Main exports
├── types.ts           # TypeScript types
├── level0.ts          # Level 0 automatic verification
├── level1.ts          # Level 1 basic verification
├── review.ts          # Manual review logic
├── payment.ts         # Payment & payout processing
├── utils.ts           # Helper functions
└── README.md          # This file

app/api/verifications/
├── route.ts                    # POST request, GET list
├── [id]/route.ts               # GET details
├── [id]/assign/route.ts        # PATCH assign
├── [id]/start/route.ts         # PATCH start
├── [id]/submit/route.ts        # POST submit
├── [id]/cancel/route.ts        # POST cancel
├── [id]/claim/route.ts         # POST claim
└── available/route.ts          # GET available
```

## Database Models

### Verification
- `id`, `product_id`, `verifier_id`
- `level`, `status`, `fee`, `platform_share`, `verifier_share`
- `report` (JSON), `score`, `badges`
- `requested_at`, `assigned_at`, `reviewed_at`, `completed_at`

### VerificationStatus Enum
- PENDING, ASSIGNED, IN_PROGRESS
- COMPLETED, APPROVED, REJECTED, CANCELLED

### VerifierPayout
- `id`, `verifier_id`, `verification_id`, `settlement_id`
- `amount`, `status`, `paid_at`

### Product Updates
- `verification_level` (0-3)
- `verification_badges` (string[])
- `verification_score` (0-100)

### User Updates
- `role` (add "verifier")
- `verifier_stats` (JSON)

## Testing

Run tests:
```bash
npm test -- verification
```

See `/Volumes/DATA/2026-프로젝트/1.실험실/AI_marketplace/docs/VERIFICATION_SYSTEM.md` for comprehensive testing guide.

## Common Tasks

### Request Level 0 Verification

```bash
curl -X POST /api/verifications \
  -H "Content-Type: application/json" \
  -H "x-user-id: seller123" \
  -d '{"productId": "prod_abc", "level": 0}'
```

### Request Level 1 Verification

```bash
curl -X POST /api/verifications \
  -H "Content-Type: application/json" \
  -H "x-user-id: seller123" \
  -d '{"productId": "prod_abc", "level": 1}'
```

### List Available Verifications

```bash
curl /api/verifications/available?level=1 \
  -H "x-user-id: verifier456" \
  -H "x-user-role: verifier"
```

### Claim Verification

```bash
curl -X POST /api/verifications/ver_xyz/claim \
  -H "x-user-id: verifier456" \
  -H "x-user-role: verifier"
```

### Submit Review

```bash
curl -X POST /api/verifications/ver_xyz/submit \
  -H "Content-Type: application/json" \
  -H "x-user-id: verifier456" \
  -H "x-user-role: verifier" \
  -d '{
    "approved": true,
    "score": 90,
    "comments": "Excellent quality",
    "badges": ["quality", "documentation"]
  }'
```

## Revenue Split

- **Platform**: 30% ($15 from $50 Level 1)
- **Verifier**: 70% ($35 from $50 Level 1)

Payouts processed monthly via settlement system.

## Support

- Full documentation: `/docs/VERIFICATION_SYSTEM.md`
- PRD: Section 4.4 Product Verification
- Settlement integration: `/lib/services/settlement.ts`

## Phase 2 Roadmap

- [ ] Level 2: Expert code review
- [ ] Level 3: Security audit + performance testing
- [ ] Integration with ESLint, SonarQube
- [ ] Real antivirus scanning (ClamAV)
- [ ] Performance benchmarking
- [ ] Verifier reputation system
- [ ] Appeal process
