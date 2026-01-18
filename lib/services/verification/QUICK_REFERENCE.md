# Verification Service - Quick Reference

## 🚀 Quick Start

```typescript
import {
  // Level-specific
  runLevel0Verification,
  requestLevel1Verification,

  // Claim
  claimVerification,
  canClaimVerification,

  // Review
  startVerificationReview,
  submitVerificationReview,

  // Payment
  processVerificationFee,
  getVerifierEarnings,

  // Utilities
  getLevelDisplayName,
  formatVerificationFee,
} from '@/lib/services/verification';
```

---

## 📖 Common Use Cases

### 1. Request Level 0 Verification (Free)
```typescript
const verification = await runLevel0Verification(productId);
// Returns: { status: 'APPROVED' | 'REJECTED', score: number, report: object }
```

### 2. Request Level 1 Verification ($50)
```typescript
// Create payment
const paymentIntent = await processVerificationFee(productId, 1, sellerId);

// After payment success
const verification = await requestLevel1Verification(productId);
// Returns: { status: 'PENDING', level: 1, fee: 5000, ... }
```

### 3. Verifier Claims Verification
```typescript
// Check if can claim
const { canClaim, reason } = await canClaimVerification(verificationId, verifierId);

if (canClaim) {
  const verification = await claimVerification(verificationId, verifierId);
  // Returns: { status: 'ASSIGNED', verifier_id: verifierId, ... }
}
```

### 4. Start Review
```typescript
const verification = await startVerificationReview(verificationId, verifierId);
// Returns: { status: 'IN_PROGRESS', ... }
```

### 5. Submit Review
```typescript
const result = await submitVerificationReview({
  verificationId,
  verifierId,
  review: {
    approved: true,
    score: 85,                    // 0-100
    comments: 'Excellent code quality!',
    badges: ['quality', 'security'],
    improvements: ['Add more tests']
  }
});
// Returns: { status: 'APPROVED' | 'REJECTED', score: number, ... }
```

### 6. Get Verifier Earnings
```typescript
const earnings = await getVerifierEarnings(verifierId, {
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31')
});
// Returns: { total: number, count: number, byStatus: {...}, payouts: [...] }
```

---

## 📋 Function Reference by Category

### Level-Specific Verification
| Function | Level | Price | Returns |
|----------|-------|-------|---------|
| `runLevel0Verification(productId)` | 0 | Free | Auto result |
| `requestLevel1Verification(productId, verifierId?)` | 1 | $50 | Verification |
| `assignLevel1Verification(verificationId, verifierId)` | 1 | - | Verification |

### Claim Management
| Function | Purpose | Required Auth |
|----------|---------|---------------|
| `claimVerification(verificationId, verifierId)` | Self-assign | Verifier |
| `canClaimVerification(verificationId, verifierId)` | Check eligibility | Verifier |
| `getClaimedVerifications(verifierId, options?)` | List claimed | Verifier |
| `unclaimVerification(verificationId, verifierId)` | Release claim | Verifier |

### Review Workflow
| Function | Status Transition | Required Auth |
|----------|-------------------|---------------|
| `startVerificationReview(verificationId, verifierId)` | ASSIGNED → IN_PROGRESS | Verifier |
| `submitVerificationReview(params)` | IN_PROGRESS → APPROVED/REJECTED | Verifier |
| `cancelVerification(verificationId, userId, isAdmin)` | Any → CANCELLED | Seller/Admin |
| `getVerificationForReview(verificationId, verifierId)` | - | Verifier |
| `listAvailableVerifications(options?)` | - | Any |

### Payment & Payouts
| Function | Purpose | Returns |
|----------|---------|---------|
| `processVerificationFee(productId, level, sellerId)` | Create payment | PaymentIntent |
| `confirmVerificationPayment(verificationId, paymentIntentId)` | Verify payment | Verification |
| `createVerifierPayout(verifierId, verificationId, amount)` | Create payout | VerifierPayout |
| `processVerifierPayouts(settlementId)` | Batch payout | PayoutResult |
| `getVerifierEarnings(verifierId, options?)` | Earnings report | EarningsData |
| `getVerifierStats(verifierId)` | Performance stats | Stats |
| `calculateVerificationFee(level)` | Fee breakdown | FeeBreakdown |

### Utility Functions
| Category | Functions |
|----------|-----------|
| **Status** | `isVerificationInProgress()`, `isVerificationCompleted()`, `canCancelVerification()`, `getStatusMessage()` |
| **Report** | `getReportScore()`, `getReportIssues()`, `getVerificationSummary()` |
| **Badge** | `getBadgeDisplayName()`, `getBadgeVariant()` |
| **Level** | `getLevelDisplayName()`, `getLevelDescription()`, `getLevelFeatures()` |
| **Format** | `formatVerificationFee()`, `formatVerificationDate()`, `getTimeElapsed()` |
| **Validate** | `isValidVerificationLevel()`, `isValidVerificationScore()`, `isValidBadge()` |

---

## 🎯 Status Flow

```
PENDING
  ↓ claimVerification()
ASSIGNED
  ↓ startVerificationReview()
IN_PROGRESS
  ↓ submitVerificationReview()
COMPLETED
  ↓ (based on score)
APPROVED / REJECTED

cancelVerification() → CANCELLED (from any status)
```

---

## 💰 Pricing & Revenue

| Level | Fee | Platform (30%) | Verifier (70%) |
|-------|-----|----------------|----------------|
| 0 | $0 | $0 | $0 |
| 1 | $50 | $15 | $35 |
| 2 | $150 | $45 | $105 |
| 3 | $500 | $150 | $350 |

---

## ✅ Approval Thresholds

| Level | Minimum Score | Method |
|-------|---------------|--------|
| 0 | 100 (all pass) | Automatic |
| 1 | 60 | Auto + Manual |
| 2 | 70 | Expert Review |
| 3 | 80 | Audit |

---

## 🏅 Available Badges

- **quality** - High quality code (score ≥ 85)
- **security** - Security verified
- **performance** - Performance optimized
- **documentation** - Well documented
- **accessibility** - Accessibility compliant
- **testing** - Well tested

---

## 🔧 Error Handling

All functions throw descriptive errors:

```typescript
try {
  await claimVerification(verificationId, verifierId);
} catch (error) {
  console.error(error.message);
  // Examples:
  // "Verification not found"
  // "Verification is not available. Current status: ASSIGNED"
  // "You cannot verify your own product"
  // "Verification is already assigned to another verifier"
}
```

---

## 📊 Return Types

### Verification Object
```typescript
{
  id: string
  product_id: string
  verifier_id: string | null
  level: number
  status: VerificationStatus
  fee: number
  platform_share: number
  verifier_share: number
  report: VerificationReport | null
  score: number | null
  badges: string[]
  requested_at: Date
  assigned_at: Date | null
  reviewed_at: Date | null
  completed_at: Date | null
}
```

### VerificationReport
```typescript
{
  level: number
  timestamp: string
  passed: boolean
  score: number
  checks?: Level0Checks         // Level 0
  automated?: AutomatedTests    // Level 1+
  manual?: ManualReview         // After review
  finalScore?: number           // After review
}
```

### Level0Checks
```typescript
{
  fileFormat: CheckResult
  fileSize: CheckResult
  virusScan: CheckResult
  metadata: CheckResult
  description: CheckResult
}
```

### AutomatedTests (Level 1)
```typescript
{
  codeQuality: CodeQualityResult
  documentation: DocumentationResult
  dependencies: DependencyResult
  structure: StructureResult
}
```

### ManualReview
```typescript
{
  approved: boolean
  score: number              // 0-100
  comments: string
  badges?: string[]
  improvements?: string[]
  reviewedBy: string
  reviewedAt: string
}
```

---

## 🧪 Testing Examples

### Unit Test
```typescript
import { runLevel0Verification } from '@/lib/services/verification';

describe('Level 0 Verification', () => {
  it('should approve valid product', async () => {
    const result = await runLevel0Verification(productId);
    expect(result.status).toBe('APPROVED');
    expect(result.score).toBe(100);
  });
});
```

### Integration Test
```typescript
describe('Full Workflow', () => {
  it('should complete verification workflow', async () => {
    // Request
    const verification = await requestLevel1Verification(productId);

    // Claim
    await claimVerification(verification.id, verifierId);

    // Review
    await startVerificationReview(verification.id, verifierId);

    // Submit
    const result = await submitVerificationReview({
      verificationId: verification.id,
      verifierId,
      review: { approved: true, score: 85, comments: 'Great!' }
    });

    expect(result.status).toBe('APPROVED');
  });
});
```

---

## 📚 Additional Resources

- **Full Documentation:** `IMPLEMENTATION_REPORT.md`
- **Summary:** `SUMMARY.md`
- **Service README:** `README.md`
- **Types:** `types.ts`

---

**Last Updated:** December 28, 2024
