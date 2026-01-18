# Product Verification System

Complete implementation guide for the AI Marketplace product verification system.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [Verification Levels](#verification-levels)
5. [API Endpoints](#api-endpoints)
6. [Testing Guide](#testing-guide)
7. [Deployment](#deployment)

---

## Overview

The verification system provides multi-level quality assurance for AI products:

- **Level 0**: Free automatic checks (file format, virus scan, metadata)
- **Level 1**: $50 - Automated tests + basic manual review
- **Level 2**: $150 - Expert code review (Phase 2)
- **Level 3**: $500 - Security audit + performance test (Phase 2)

### Revenue Split

- Platform: 30%
- Verifier: 70%

---

## Architecture

### Components

```
lib/services/verification/
├── types.ts           # TypeScript types
├── level0.ts          # Automatic verification
├── level1.ts          # Basic verification
├── review.ts          # Manual review logic
├── payment.ts         # Payment & payouts
└── utils.ts           # Helper functions

app/api/verifications/
├── route.ts                    # POST (request), GET (list)
├── [id]/route.ts               # GET (details)
├── [id]/assign/route.ts        # PATCH (assign)
├── [id]/start/route.ts         # PATCH (start review)
├── [id]/submit/route.ts        # POST (submit review)
├── [id]/cancel/route.ts        # POST (cancel)
├── [id]/claim/route.ts         # POST (claim)
└── available/route.ts          # GET (available)
```

### Workflow

```
Seller Request → Payment (Level 1+) → Verification Created
                                    ↓
                         Level 0: Auto-checks
                                    ↓
                         Level 1+: Assign Verifier
                                    ↓
                         Verifier Reviews
                                    ↓
                         Submit Review
                                    ↓
                         Update Product → Payout Verifier
```

---

## Database Schema

### Verification Model

```prisma
model Verification {
  id              String   @id @default(cuid())
  product_id      String
  verifier_id     String?  // null for Level 0

  level           Int      // 0, 1, 2, 3
  status          VerificationStatus @default(PENDING)

  fee             Int      // Verification fee in cents
  platform_share  Int      // 30% platform
  verifier_share  Int      // 70% verifier

  report          Json?    // JSONB report structure
  score           Float?   // 0-100 quality score
  badges          String[] @default([])

  requested_at    DateTime @default(now())
  assigned_at     DateTime?
  reviewed_at     DateTime?
  completed_at    DateTime?

  product         Product  @relation(...)
  verifier        User?    @relation(...)
  verifierPayout  VerifierPayout?
}

enum VerificationStatus {
  PENDING       // Awaiting assignment
  ASSIGNED      // Assigned to verifier
  IN_PROGRESS   // Review in progress
  COMPLETED     // Verification done
  APPROVED      // Product approved
  REJECTED      // Product rejected
  CANCELLED     // Verification cancelled
}
```

### Product Updates

```prisma
model Product {
  // ... existing fields
  verification_level  Int      @default(0)
  verification_badges String[]
  verification_score  Float?
  verifications       Verification[]
}
```

### Verifier Payout

```prisma
model VerifierPayout {
  id              String   @id @default(cuid())
  verifier_id     String
  verification_id String   @unique
  settlement_id   String?

  amount          Int      // Verifier share (70%)
  status          PayoutStatus @default(PENDING)

  paid_at         DateTime?
  createdAt       DateTime @default(now())

  verifier        User         @relation(...)
  verification    Verification @relation(...)
  settlement      Settlement?  @relation(...)
}

enum PayoutStatus {
  PENDING
  INCLUDED_IN_SETTLEMENT
  PAID
}
```

### User Updates

```prisma
model User {
  // ... existing fields
  role                    String   @default("user") // add "verifier"
  verifier_stats          Json?    // { total_verifications, total_earnings, approval_rate, avg_score }
  verificationsAsVerifier Verification[]
  verifierPayouts         VerifierPayout[]
}
```

### Settlement Updates

```prisma
model Settlement {
  // ... existing fields
  verification_earnings Int      @default(0)
  verification_count    Int      @default(0)
  verifierPayouts       VerifierPayout[]
}
```

---

## Verification Levels

### Level 0: Automatic Verification (Free)

**Checks**:
- File format validation
- File size limits (500MB max)
- Virus/malware scanning (basic)
- Metadata validation (title, description, category, price)
- Description quality (min 50 chars)

**Implementation**: `lib/services/verification/level0.ts`

**Usage**:
```typescript
import { runLevel0Verification } from '@/lib/services/verification/level0';

const verification = await runLevel0Verification(productId);
// Returns: { status: 'APPROVED' | 'REJECTED', report, score }
```

**Report Structure**:
```typescript
{
  level: 0,
  timestamp: "2025-12-28T...",
  passed: true,
  score: 85,
  checks: {
    fileFormat: { passed: true, message: "...", details: {...} },
    fileSize: { passed: true, message: "...", details: {...} },
    virusScan: { passed: true, message: "...", details: {...} },
    metadata: { passed: true, message: "...", details: {...} },
    description: { passed: true, message: "...", details: {...} }
  }
}
```

### Level 1: Basic Verification ($50)

**Includes**: All Level 0 checks + automated tests + manual review

**Automated Tests**:
- Code quality (function length, comments, code smells)
- Documentation (README, description quality)
- Dependencies (package.json, vulnerabilities)
- Project structure (tests, config files, license)

**Manual Review**:
- Verifier reviews automated test results
- Provides score (0-100)
- Adds comments and improvement suggestions
- Assigns badges (quality, security, documentation)
- Approves or rejects product

**Implementation**: `lib/services/verification/level1.ts`, `review.ts`

**Usage**:
```typescript
import { requestLevel1Verification } from '@/lib/services/verification/level1';

// Request verification (creates payment intent)
const verification = await requestLevel1Verification(productId);

// After payment confirmed, verifier is assigned
// Verifier submits review
import { submitVerificationReview } from '@/lib/services/verification/review';

await submitVerificationReview({
  verificationId,
  verifierId,
  review: {
    approved: true,
    score: 90,
    comments: "Excellent code quality...",
    badges: ["quality", "documentation"],
    improvements: ["Add more test coverage"]
  }
});
```

---

## API Endpoints

### 1. Request Verification

**POST /api/verifications**

```bash
curl -X POST /api/verifications \
  -H "Content-Type: application/json" \
  -H "x-user-id: seller123" \
  -d '{
    "productId": "prod_abc123",
    "level": 1
  }'
```

**Response**:
```json
{
  "verification": {
    "id": "ver_xyz789",
    "product_id": "prod_abc123",
    "level": 1,
    "status": "PENDING",
    "fee": 5000
  },
  "paymentIntent": {
    "id": "pi_123",
    "clientSecret": "pi_123_secret_xyz",
    "amount": 5000
  },
  "message": "Payment required to proceed with verification"
}
```

### 2. List Verifications

**GET /api/verifications**

```bash
curl /api/verifications?page=1&limit=10&status=PENDING \
  -H "x-user-id: seller123" \
  -H "x-user-role: seller"
```

**Response**:
```json
{
  "verifications": [
    {
      "id": "ver_xyz789",
      "product": {
        "id": "prod_abc123",
        "name": "AI Model Package",
        "seller": { "id": "seller123", "name": "John Doe" }
      },
      "level": 1,
      "status": "PENDING",
      "requested_at": "2025-12-28T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "totalPages": 2
  }
}
```

### 3. Get Verification Details

**GET /api/verifications/[id]**

```bash
curl /api/verifications/ver_xyz789 \
  -H "x-user-id: seller123"
```

**Response**: Full verification object with product, files, and report

### 4. Assign Verification (Admin)

**PATCH /api/verifications/[id]/assign**

```bash
curl -X PATCH /api/verifications/ver_xyz789/assign \
  -H "Content-Type: application/json" \
  -H "x-user-id: admin123" \
  -H "x-user-role: admin" \
  -d '{"verifierId": "verifier456"}'
```

### 5. Start Review (Verifier)

**PATCH /api/verifications/[id]/start**

```bash
curl -X PATCH /api/verifications/ver_xyz789/start \
  -H "x-user-id: verifier456" \
  -H "x-user-role: verifier"
```

**Response**: Status updated to IN_PROGRESS

### 6. Submit Review (Verifier)

**POST /api/verifications/[id]/submit**

```bash
curl -X POST /api/verifications/ver_xyz789/submit \
  -H "Content-Type: application/json" \
  -H "x-user-id: verifier456" \
  -H "x-user-role: verifier" \
  -d '{
    "approved": true,
    "score": 90,
    "comments": "Excellent product with good documentation",
    "badges": ["quality", "documentation"],
    "improvements": ["Add unit test coverage"]
  }'
```

**Response**: Verification completed, product updated, payout created

### 7. Cancel Verification

**POST /api/verifications/[id]/cancel**

```bash
curl -X POST /api/verifications/ver_xyz789/cancel \
  -H "x-user-id: seller123"
```

### 8. List Available Verifications (Verifiers)

**GET /api/verifications/available**

```bash
curl /api/verifications/available?level=1&page=1 \
  -H "x-user-id: verifier456" \
  -H "x-user-role: verifier"
```

**Response**: List of PENDING verifications available for claiming

### 9. Claim Verification (Verifier)

**POST /api/verifications/[id]/claim**

```bash
curl -X POST /api/verifications/ver_xyz789/claim \
  -H "x-user-id: verifier456" \
  -H "x-user-role: verifier"
```

**Response**: Verification assigned to verifier

---

## Testing Guide

### Setup

1. **Run Prisma Migration**:
```bash
npx prisma migrate dev --name add_verification_system
npx prisma generate
```

2. **Seed Test Data**:
```bash
npx prisma db seed
```

### Test Cases

#### Test 1: Level 0 Automatic Verification (Pass)

```typescript
// Create test product with valid files
const product = await prisma.product.create({
  data: {
    name: "Test AI Model",
    description: "A comprehensive AI model package with full documentation and examples for production use.",
    price: 99.99,
    category: "AI_MODELS",
    seller_id: "seller123",
  }
});

// Add valid files
await prisma.file.createMany({
  data: [
    { product_id: product.id, filename: "model.zip", size: 1024000 },
    { product_id: product.id, filename: "README.md", size: 5000 }
  ]
});

// Request Level 0 verification
const response = await fetch('/api/verifications', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-user-id': 'seller123' },
  body: JSON.stringify({ productId: product.id, level: 0 })
});

const result = await response.json();

// Assertions
expect(result.verification.status).toBe('APPROVED');
expect(result.verification.score).toBeGreaterThan(70);
expect(result.message).toContain('passed');
```

#### Test 2: Level 0 Automatic Verification (Fail)

```typescript
// Create product with invalid data
const product = await prisma.product.create({
  data: {
    name: "Bad",  // Too short
    description: "Short",  // Too short
    price: 99.99,
    category: "AI_MODELS",
    seller_id: "seller123",
  }
});

// Request verification
const response = await fetch('/api/verifications', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-user-id': 'seller123' },
  body: JSON.stringify({ productId: product.id, level: 0 })
});

const result = await response.json();

// Assertions
expect(result.verification.status).toBe('REJECTED');
expect(result.verification.report.checks.metadata.passed).toBe(false);
```

#### Test 3: Level 1 Request with Payment

```typescript
// Create valid product
const product = await prisma.product.create({ /* valid data */ });

// Request Level 1 verification
const response = await fetch('/api/verifications', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-user-id': 'seller123' },
  body: JSON.stringify({ productId: product.id, level: 1 })
});

const result = await response.json();

// Assertions
expect(result.verification.level).toBe(1);
expect(result.verification.status).toBe('PENDING');
expect(result.paymentIntent).toBeDefined();
expect(result.paymentIntent.amount).toBe(5000); // $50
```

#### Test 4: Verifier Assignment

```typescript
// Admin assigns verifier
const response = await fetch(`/api/verifications/${verificationId}/assign`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'x-user-id': 'admin123',
    'x-user-role': 'admin'
  },
  body: JSON.stringify({ verifierId: 'verifier456' })
});

const result = await response.json();

// Assertions
expect(result.verification.status).toBe('ASSIGNED');
expect(result.verification.verifier_id).toBe('verifier456');
```

#### Test 5: Verifier Review Submission

```typescript
// Verifier submits review
const response = await fetch(`/api/verifications/${verificationId}/submit`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-user-id': 'verifier456',
    'x-user-role': 'verifier'
  },
  body: JSON.stringify({
    approved: true,
    score: 90,
    comments: "Excellent product quality",
    badges: ["quality", "documentation"],
    improvements: ["Add more examples"]
  })
});

const result = await response.json();

// Assertions
expect(result.verification.status).toBe('APPROVED');
expect(result.verification.score).toBe(90);

// Check product updated
const product = await prisma.product.findUnique({ where: { id: productId } });
expect(product.verification_level).toBe(1);
expect(product.verification_score).toBeCloseTo(90, 1);
expect(product.verification_badges).toContain('quality');

// Check payout created
const payout = await prisma.verifierPayout.findUnique({
  where: { verification_id: verificationId }
});
expect(payout).toBeDefined();
expect(payout.amount).toBe(3500); // 70% of $50 = $35
```

#### Test 6: Verifier Payout Calculation

```typescript
import { getVerifierEarnings } from '@/lib/services/verification/payment';

const earnings = await getVerifierEarnings('verifier456');

// Assertions
expect(earnings.total).toBeGreaterThan(0);
expect(earnings.count).toBeGreaterThan(0);
expect(earnings.byStatus.pending).toBeDefined();
expect(earnings.byStatus.paid).toBeDefined();
```

#### Test 7: Cancellation and Refund

```typescript
// Seller cancels verification
const response = await fetch(`/api/verifications/${verificationId}/cancel`, {
  method: 'POST',
  headers: { 'x-user-id': 'seller123' }
});

const result = await response.json();

// Assertions
expect(result.verification.status).toBe('CANCELLED');

// TODO: Check refund processed (depends on payment integration)
```

---

## Deployment

### Pre-Deployment Checklist

- [ ] Prisma migration applied
- [ ] Environment variables configured
- [ ] Payment provider integrated (Stripe/Toss)
- [ ] File storage configured
- [ ] Notification system enabled
- [ ] Cron job for monthly settlements
- [ ] Monitoring and logging setup

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# Payment
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
TOSS_SECRET_KEY="..."

# File Storage
UPLOAD_DIR="/path/to/uploads"
MAX_FILE_SIZE=524288000  # 500MB
```

### Migration Commands

```bash
# Create migration
npx prisma migrate dev --name add_verification_system

# Apply to production
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### Monitoring

Track these metrics:
- Verification requests per level
- Approval rate by level
- Average review time
- Verifier earnings
- Platform revenue from verifications
- Failed automatic checks (identify common issues)

### Support

For issues or questions:
- Check logs: `lib/services/verification/*.ts`
- Review verification report in database
- Contact development team

---

## Future Enhancements (Phase 2)

- **Level 2**: Expert code review
- **Level 3**: Security audit + performance testing
- **Automated code analysis**: ESLint, SonarQube integration
- **Real virus scanning**: ClamAV or cloud antivirus
- **Performance testing**: Load testing, benchmarking
- **Security scanning**: OWASP dependency check, vulnerability scanning
- **Verifier reputation system**: Ratings, badges, leaderboard
- **Appeal process**: Sellers can appeal rejected verifications
- **Batch verification**: Verify multiple products at once

---

## License

This verification system is part of the AI Marketplace platform.
