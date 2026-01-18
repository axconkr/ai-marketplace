# Verifier Settlement Migration Notes

## Migration: add-verifier-settlement

### Overview

This migration adds support for verifier settlement tracking, integrated with the existing seller settlement system.

## Changes

### 1. Settlement Model Updates

**Added Fields:**
- `verification_earnings` (Int, default 0) - Verifier earnings in cents
- `verification_count` (Int, default 0) - Number of verifications

**Modified Fields:**
- `total_amount` - Added default(0)
- `platform_fee` - Added default(0)

**New Relations:**
- `verifierPayouts` - VerifierPayout[]

### 2. New VerifierPayout Model

Tracks individual verification payouts and their settlement status.

**Fields:**
- `id` - String (cuid)
- `verifier_id` - String (FK to User)
- `verification_id` - String (unique, FK to Verification)
- `settlement_id` - String? (FK to Settlement)
- `amount` - Int (verifier share in cents)
- `status` - PayoutStatus
- `paid_at` - DateTime?
- `createdAt` - DateTime
- `updatedAt` - DateTime

**Indexes:**
- verifier_id
- verification_id
- settlement_id
- status
- createdAt

### 3. New PayoutStatus Enum

```prisma
enum PayoutStatus {
  PENDING                 // Payout record created
  INCLUDED_IN_SETTLEMENT  // Included in monthly settlement
  PAID                    // Payment completed
}
```

### 4. User Model Updates

**Added Fields:**
- `verifier_stats` - Json? (JSONB for performance metrics)

**New Relations:**
- `verifierPayouts` - VerifierPayout[]

**New Index:**
- `role` - For filtering verifiers

### 5. Verification Model Updates

**Added Fields:**
- `badges` - Default value: []

**Modified Fields:**
- `report` - Changed to optional (Json?)

**New Relations:**
- `verifierPayout` - VerifierPayout?

**New Index:**
- `completed_at` - For settlement queries

## Migration SQL

The migration will generate SQL similar to:

```sql
-- AlterTable Settlement
ALTER TABLE "Settlement"
  ALTER COLUMN "total_amount" SET DEFAULT 0,
  ALTER COLUMN "platform_fee" SET DEFAULT 0,
  ADD COLUMN "verification_earnings" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "verification_count" INTEGER NOT NULL DEFAULT 0;

-- AlterTable User
ALTER TABLE "User"
  ADD COLUMN "verifier_stats" JSONB;

CREATE INDEX "User_role_idx" ON "User"("role");

-- AlterTable Verification
ALTER TABLE "Verification"
  ALTER COLUMN "report" DROP NOT NULL,
  ALTER COLUMN "badges" SET DEFAULT ARRAY[]::TEXT[];

CREATE INDEX "Verification_completed_at_idx" ON "Verification"("completed_at");

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM (
  'PENDING',
  'INCLUDED_IN_SETTLEMENT',
  'PAID'
);

-- CreateTable VerifierPayout
CREATE TABLE "VerifierPayout" (
    "id" TEXT NOT NULL,
    "verifier_id" TEXT NOT NULL,
    "verification_id" TEXT NOT NULL,
    "settlement_id" TEXT,
    "amount" INTEGER NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "paid_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerifierPayout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VerifierPayout_verification_id_key"
  ON "VerifierPayout"("verification_id");
CREATE INDEX "VerifierPayout_verifier_id_idx" ON "VerifierPayout"("verifier_id");
CREATE INDEX "VerifierPayout_verification_id_idx" ON "VerifierPayout"("verification_id");
CREATE INDEX "VerifierPayout_settlement_id_idx" ON "VerifierPayout"("settlement_id");
CREATE INDEX "VerifierPayout_status_idx" ON "VerifierPayout"("status");
CREATE INDEX "VerifierPayout_createdAt_idx" ON "VerifierPayout"("createdAt");

-- AddForeignKey
ALTER TABLE "VerifierPayout"
  ADD CONSTRAINT "VerifierPayout_verifier_id_fkey"
  FOREIGN KEY ("verifier_id") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "VerifierPayout"
  ADD CONSTRAINT "VerifierPayout_verification_id_fkey"
  FOREIGN KEY ("verification_id") REFERENCES "Verification"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "VerifierPayout"
  ADD CONSTRAINT "VerifierPayout_settlement_id_fkey"
  FOREIGN KEY ("settlement_id") REFERENCES "Settlement"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
```

## Data Migration Steps

### Step 1: Apply Schema Migration

```bash
npx prisma migrate dev --name add-verifier-settlement
```

### Step 2: Backfill Historical Data (Optional)

If you have existing completed verifications without payouts:

```typescript
// scripts/backfill-verifier-payouts.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function backfillPayouts() {
  const verifications = await prisma.verification.findMany({
    where: {
      status: { in: ['APPROVED', 'COMPLETED'] },
      verifier_id: { not: null },
      // Only verifications without payouts
      verifierPayout: null,
    },
  });

  console.log(`Found ${verifications.length} verifications to backfill`);

  for (const verification of verifications) {
    await prisma.verifierPayout.create({
      data: {
        verifier_id: verification.verifier_id!,
        verification_id: verification.id,
        amount: verification.verifier_share,
        status: 'PAID', // Historical records are already paid
        paid_at: verification.completed_at,
      },
    });
  }

  console.log('Backfill completed!');
}

backfillPayouts()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

### Step 3: Update Verifier Stats

```bash
npm run update-verifier-stats update
```

### Step 4: Verify Migration

```bash
# Open Prisma Studio
npx prisma studio

# Verify:
# 1. VerifierPayout table exists
# 2. Existing settlements have verification_earnings = 0
# 3. User.verifier_stats is null for existing users
# 4. Verification.completed_at index exists
```

## Rollback Procedure

If you need to rollback this migration:

### Option 1: Prisma Migrate Resolve

```bash
# Mark migration as rolled back
npx prisma migrate resolve --rolled-back add-verifier-settlement
```

### Option 2: Manual Rollback Migration

Create a new migration to reverse changes:

```bash
npx prisma migrate dev --name revert-verifier-settlement
```

In the migration file:

```sql
-- Drop VerifierPayout table
DROP TABLE "VerifierPayout";

-- Drop PayoutStatus enum
DROP TYPE "PayoutStatus";

-- Revert Settlement changes
ALTER TABLE "Settlement"
  DROP COLUMN "verification_earnings",
  DROP COLUMN "verification_count";

-- Revert User changes
ALTER TABLE "User"
  DROP COLUMN "verifier_stats";

DROP INDEX "User_role_idx";

-- Revert Verification changes
DROP INDEX "Verification_completed_at_idx";
```

## Testing After Migration

### 1. Test Payout Creation

```typescript
import { processVerificationPayout } from '@/lib/services/verifier-earnings';

// Create test verification
const verification = await prisma.verification.create({
  data: {
    product_id: 'test-product',
    verifier_id: 'test-verifier',
    level: 1,
    fee: 5000,
    platform_share: 1500,
    verifier_share: 3500,
    status: 'COMPLETED',
    completed_at: new Date(),
  },
});

// Process payout
const payout = await processVerificationPayout(verification.id);

// Verify
console.log(payout.status); // Should be 'PENDING'
console.log(payout.amount); // Should be 3500
```

### 2. Test Monthly Settlement

```bash
npm run monthly-settlement
```

Expected output:
- Finds verifiers with pending payouts
- Creates settlements
- Links payouts to settlements
- Updates payout status

### 3. Test API Endpoints

```bash
# Current earnings
curl http://localhost:3000/api/verifier/earnings/current?verifierId=test-id

# Breakdown
curl http://localhost:3000/api/verifier/earnings/breakdown?verifierId=test-id

# Settlements
curl http://localhost:3000/api/verifier/settlements?verifierId=test-id
```

## Performance Considerations

### Index Usage

The migration adds several indexes for query optimization:

1. **VerifierPayout.verifier_id** - For verifier earnings queries
2. **VerifierPayout.status** - For pending payout queries
3. **VerifierPayout.createdAt** - For period-based queries
4. **Verification.completed_at** - For settlement period queries
5. **User.role** - For verifier filtering

### Query Performance

Expected query times (with proper indexes):

- Get current month earnings: <50ms
- Get earnings breakdown: <100ms
- Get settlement history: <100ms
- Monthly settlement generation: <5s per verifier

### Data Volume Estimates

For 1000 verifiers with 100 verifications each per month:

- VerifierPayout records: ~100,000/month
- Settlement records: ~1,000/month
- Storage growth: ~10MB/month

After 1 year:
- VerifierPayout: ~1.2M records (~120MB)
- Settlement: ~12K records (~12MB)

## Backup Recommendations

Before migration:

```bash
# PostgreSQL
pg_dump -U user -d database > backup_before_verifier_settlement.sql

# MySQL
mysqldump -u user -p database > backup_before_verifier_settlement.sql
```

After migration:

```bash
# Test restore on staging
psql -U user -d staging_db < backup_before_verifier_settlement.sql
```

## Post-Migration Checklist

- [ ] Migration applied successfully
- [ ] No errors in migration logs
- [ ] All tables and indexes created
- [ ] Foreign keys validated
- [ ] Backfill completed (if needed)
- [ ] Verifier stats updated
- [ ] Test data created
- [ ] API endpoints tested
- [ ] Dashboard accessible
- [ ] Email notifications working
- [ ] Monthly settlement tested
- [ ] Performance verified
- [ ] Backup created
- [ ] Team notified

## Support

If you encounter issues during migration:

1. Check migration logs: `npx prisma migrate status`
2. Review Prisma Studio: `npx prisma studio`
3. Check database logs
4. Verify schema sync: `npx prisma validate`
5. Test rollback on staging first

## Notes

- This migration is **backward compatible** - existing seller settlements continue to work
- New fields have default values to avoid breaking existing code
- Foreign key constraints ensure data integrity
- Indexes optimize common queries
- JSONB used for flexible verifier stats storage
