# Verifier Settlement System Documentation

## Overview

The verifier settlement system handles monthly payouts for verification services, integrated with the existing seller settlement infrastructure.

## Revenue Split

- **Platform**: 30% of verification fee
- **Verifier**: 70% of verification fee

## Verification Pricing

| Level | Fee | Platform Share | Verifier Share |
|-------|-----|---------------|----------------|
| 0 (Basic) | $0 | $0 | $0 |
| 1 (Standard) | $50 | $15 | $35 |
| 2 (Professional) | $150 | $45 | $105 |
| 3 (Enterprise) | $500 | $150 | $350 |

## Database Schema

### Settlement Model (Updated)

```prisma
model Settlement {
  id                    String   @id @default(cuid())
  seller_id             String   // Also used for verifiers
  total_amount          Float    @default(0)
  platform_fee          Float    @default(0)
  payout_amount         Float

  // Verifier-specific fields
  verification_earnings Int      @default(0)  // Earnings from verifications (cents)
  verification_count    Int      @default(0)  // Number of verifications

  currency              String
  status                SettlementStatus @default(PENDING)
  period_start          DateTime
  period_end            DateTime
  payout_date           DateTime?
  payout_method         String?
  payout_reference      String?

  seller          User             @relation(...)
  items           SettlementItem[]
  verifierPayouts VerifierPayout[]
}
```

### VerifierPayout Model

```prisma
model VerifierPayout {
  id              String   @id @default(cuid())
  verifier_id     String
  verification_id String   @unique
  settlement_id   String?

  amount          Int      // Verifier share (70%) in cents
  status          PayoutStatus @default(PENDING)

  paid_at         DateTime?
  createdAt       DateTime @default(now())

  verifier        User         @relation(...)
  verification    Verification @relation(...)
  settlement      Settlement?  @relation(...)
}

enum PayoutStatus {
  PENDING                 // Payout record created
  INCLUDED_IN_SETTLEMENT  // Included in monthly settlement
  PAID                    // Payment completed
}
```

### User Model (Updated)

```prisma
model User {
  // ... existing fields

  role              String   // includes 'verifier'
  verifier_stats    Json?    // Performance metrics

  verifierPayouts   VerifierPayout[]
}
```

Verifier stats structure:
```typescript
{
  total_verifications: number,
  total_earnings: number,        // In cents
  approval_rate: number,         // 0-1
  average_score_given: number,   // 0-100
  average_review_time_hours: number
}
```

## Settlement Workflow

### 1. Verification Completion

When a verification is completed:

```typescript
import { processVerificationPayout } from '@/lib/services/verifier-earnings';

// After verification is approved
await processVerificationPayout(verificationId);
```

This creates a `VerifierPayout` record with status `PENDING`.

### 2. Monthly Settlement Generation

Run on the 1st of each month for the previous month:

```bash
npm run monthly-settlement
# or
node scripts/monthly-settlement.ts
```

Process:
1. Find all sellers with sales in the period
2. Find all verifiers with pending payouts in the period
3. Create settlements for sellers (existing logic)
4. Create settlements for verifiers (new logic)
5. Link payouts to settlements
6. Update payout status to `INCLUDED_IN_SETTLEMENT`
7. Send email notifications

### 3. Settlement Payout

Admin processes payout:

```typescript
import { processSettlementPayout, markSettlementAsPaid } from '@/lib/services/settlement';

// Initiate payout
await processSettlementPayout(settlementId, 'stripe_connect', transactionId);

// Mark as paid
await markSettlementAsPaid(settlementId);
```

This updates:
- Settlement status: `PENDING` → `PROCESSING` → `PAID`
- VerifierPayout status: `INCLUDED_IN_SETTLEMENT` → `PAID`

## API Endpoints

### GET /api/verifier/earnings/current

Get current month earnings estimate.

**Query Parameters:**
- `verifierId` (required): Verifier user ID

**Response:**
```json
{
  "currentMonth": {
    "totalEarnings": 35000,
    "verificationCount": 10,
    "averagePerVerification": 3500,
    "periodStart": "2024-01-01T00:00:00Z",
    "periodEnd": "2024-01-31T23:59:59Z"
  },
  "pending": {
    "totalAmount": 10500,
    "count": 3
  }
}
```

### GET /api/verifier/earnings/breakdown

Get earnings breakdown by verification level.

**Query Parameters:**
- `verifierId` (required): Verifier user ID
- `period` (optional): `current`, `last`, `all`

**Response:**
```json
{
  "breakdown": [
    {
      "level": 1,
      "count": 5,
      "earnings": 17500
    },
    {
      "level": 2,
      "count": 3,
      "earnings": 31500
    }
  ],
  "period": "current"
}
```

### GET /api/verifier/settlements

Get settlement history for verifier.

**Query Parameters:**
- `verifierId` (required): Verifier user ID
- `limit` (optional): Number of settlements to return (default: 12)

**Response:**
```json
{
  "settlements": [
    {
      "id": "settlement_123",
      "periodStart": "2024-01-01T00:00:00Z",
      "periodEnd": "2024-01-31T23:59:59Z",
      "totalEarnings": 49000,
      "verificationCount": 14,
      "status": "PAID",
      "payoutDate": "2024-02-05T00:00:00Z",
      "currency": "USD",
      "verifications": [...]
    }
  ]
}
```

## Services

### Verifier Earnings Service

**Location:** `/lib/services/verifier-earnings.ts`

Key functions:

```typescript
// Record earning when verification completes
recordVerifierEarning(verificationId, verifierId, amount)

// Get earnings for a period
getVerifierEarnings(verifierId, periodStart, periodEnd)

// Get current month estimate
getCurrentMonthEarnings(verifierId)

// Get breakdown by level
getEarningsBreakdown(verifierId, periodStart?, periodEnd?)

// Get/update verifier stats
getVerifierStats(verifierId)
updateVerifierStats(verifierId, stats?)

// Get pending payouts
getPendingPayouts(verifierId)

// Get settlement history
getVerifierSettlementHistory(verifierId, limit)

// Process verification payout
processVerificationPayout(verificationId)
```

### Verification Revenue Service

**Location:** `/lib/services/verification-revenue.ts`

Platform analytics functions:

```typescript
// Get verification revenue for period
getVerificationRevenue(periodStart, periodEnd)

// Get total platform revenue (products + verifications)
getTotalPlatformRevenue(periodStart, periodEnd)

// Get stats by verifier
getVerificationStatsByVerifier(periodStart?, periodEnd?)

// Get conversion rates
getVerificationConversionRate(periodStart, periodEnd)

// Get average turnaround time
getAverageTurnaroundTime(periodStart, periodEnd)
```

### Email Notifications

**Location:** `/lib/services/email-notifications.ts`

Email templates:

```typescript
// Verification assigned to verifier
sendVerificationAssignment(verifierId, verificationId)

// Verification completed (to seller)
sendVerificationComplete(verificationId)

// Monthly settlement notification
sendVerifierSettlementNotification(verifierId, settlementId)

// Payout confirmation
sendPayoutConfirmation(verifierId, settlementId)

// Pending verification reminder
sendVerificationReminder(verificationId, daysElapsed)

// Weekly earnings summary
sendWeeklyEarningsSummary(verifierId, weekStart, weekEnd)
```

## Verifier Dashboard

**Location:** `/app/(verifier)/dashboard/earnings/page.tsx`

Features:
- Current month earnings summary
- Pending payouts
- Earnings breakdown by level
- Settlement history
- Payment method settings

Components:
- `StatCard` - Metric display
- `SettlementStatusBadge` - Status indicator

## Admin Dashboard

Add to admin analytics:

```typescript
import { getVerificationRevenue, getTotalPlatformRevenue } from '@/lib/services/verification-revenue';

// In admin dashboard
const revenue = await getTotalPlatformRevenue(periodStart, periodEnd);

console.log(`
  Product Sales Platform Fee: $${revenue.productSales.platformFee / 100}
  Verification Platform Share: $${revenue.verifications.platformShare / 100}
  Total Platform Revenue: $${revenue.total / 100}
`);
```

## Maintenance Scripts

### Monthly Settlement

```bash
# Run for all sellers and verifiers (previous month)
npm run monthly-settlement

# Run for specific seller
node scripts/monthly-settlement.ts seller <seller_id>
```

### Update Verifier Stats

```bash
# Update all verifier stats
node scripts/update-verifier-stats.ts update

# Update specific verifier
node scripts/update-verifier-stats.ts verifier <verifier_id>

# Generate performance report
node scripts/update-verifier-stats.ts report [verifier_id]
```

## Cron Jobs

Recommended schedule:

```cron
# Monthly settlement (1st of each month at 2am)
0 2 1 * * node scripts/monthly-settlement.ts

# Update verifier stats (daily at 3am)
0 3 * * * node scripts/update-verifier-stats.ts update

# Send weekly summaries (Mondays at 9am)
0 9 * * 1 node scripts/send-weekly-summaries.ts
```

## Migration Guide

### 1. Update Database Schema

```bash
npx prisma migrate dev --name add-verifier-settlement
npx prisma generate
```

### 2. Backfill Existing Data (if needed)

```typescript
// scripts/backfill-verifier-payouts.ts
import { prisma } from '@/lib/prisma';

async function backfillPayouts() {
  const verifications = await prisma.verification.findMany({
    where: {
      status: { in: ['APPROVED', 'COMPLETED'] },
      verifier_id: { not: null },
      verifierPayout: null,
    },
  });

  for (const verification of verifications) {
    await prisma.verifierPayout.create({
      data: {
        verifier_id: verification.verifier_id!,
        verification_id: verification.id,
        amount: verification.verifier_share,
        status: 'PAID', // Historical records
        paid_at: verification.completed_at,
      },
    });
  }
}
```

### 3. Update Existing Code

Update verification completion logic:

```typescript
// After verification is approved
import { processVerificationPayout } from '@/lib/services/verifier-earnings';

await processVerificationPayout(verificationId);
```

### 4. Test Settlement Process

```bash
# Test with specific verifier
node scripts/monthly-settlement.ts

# Verify settlements created correctly
npx prisma studio
```

## Troubleshooting

### Settlement Not Created

Check:
1. Verifier has pending payouts in period
2. No existing settlement for period
3. VerifierPayout status is `PENDING`

### Incorrect Earnings Amount

Verify:
1. Verification fee split (30/70)
2. All completed verifications have payouts
3. Payout status transitions correctly

### Missing Email Notifications

Check:
1. Email service configured
2. User email verified
3. Email templates exist
4. SMTP credentials valid

## Testing

### Unit Tests

```typescript
// tests/verifier-earnings.test.ts
describe('Verifier Earnings', () => {
  test('should calculate 70% verifier share', () => {
    const { verifierShare } = calculateVerificationSplit(5000);
    expect(verifierShare).toBe(3500);
  });

  test('should create payout on verification completion', async () => {
    const payout = await processVerificationPayout(verificationId);
    expect(payout.status).toBe('PENDING');
  });
});
```

### Integration Tests

```typescript
// tests/monthly-settlement.test.ts
describe('Monthly Settlement', () => {
  test('should create verifier settlement', async () => {
    const result = await runMonthlySettlement();
    expect(result.verifiers.successful).toBeGreaterThan(0);
  });
});
```

## Security Considerations

1. **Authorization**: Verify verifier role before showing earnings
2. **Data Privacy**: Verifiers can only see their own data
3. **Payment Security**: Use secure payment methods (Stripe Connect)
4. **Audit Trail**: All payout changes logged
5. **Rate Limiting**: API endpoints have rate limits

## Performance Optimization

1. **Indexing**: Key indexes on `verifier_id`, `status`, `createdAt`
2. **Pagination**: Settlement history paginated
3. **Caching**: Cache current month earnings (5-minute TTL)
4. **Batch Processing**: Process settlements in batches
5. **Background Jobs**: Use queue for settlement generation

## Future Enhancements

1. **Multi-currency Support**: Handle different currencies per verifier
2. **Instant Payouts**: Stripe instant payouts for verifiers
3. **Bonus System**: Performance-based bonuses
4. **Referral Program**: Verifier referral rewards
5. **Analytics Dashboard**: Advanced verifier analytics
6. **Tax Documents**: Automatic 1099 generation

## Support

For issues or questions:
- Email: support@marketplace.com
- Docs: https://docs.marketplace.com/verifier-settlement
- Slack: #verifier-support
