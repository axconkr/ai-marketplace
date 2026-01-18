# Verifier Settlement - Quick Start Guide

## Installation & Setup

### 1. Update Database Schema

```bash
# Apply Prisma migrations
npx prisma migrate dev --name add-verifier-settlement

# Generate Prisma client
npx prisma generate
```

### 2. Verify Schema Changes

Check that the following were added:
- ✅ `Settlement.verification_earnings` field
- ✅ `Settlement.verification_count` field
- ✅ `VerifierPayout` model
- ✅ `PayoutStatus` enum
- ✅ `User.verifier_stats` field
- ✅ `User.verifierPayouts` relation

### 3. Add Package Scripts

Update `package.json`:

```json
{
  "scripts": {
    "monthly-settlement": "ts-node scripts/monthly-settlement.ts",
    "update-verifier-stats": "ts-node scripts/update-verifier-stats.ts"
  }
}
```

## Integration Points

### When Verification is Completed

In your verification completion handler:

```typescript
import { processVerificationPayout } from '@/lib/services/verifier-earnings';
import { sendVerificationComplete } from '@/lib/services/email-notifications';

// After setting verification status to APPROVED or COMPLETED
async function completeVerification(verificationId: string) {
  // Update verification status
  await prisma.verification.update({
    where: { id: verificationId },
    data: {
      status: 'APPROVED',
      completed_at: new Date(),
    },
  });

  // Create verifier payout record
  await processVerificationPayout(verificationId);

  // Send notification to seller
  await sendVerificationComplete(verificationId);
}
```

### When Verification is Assigned

```typescript
import { sendVerificationAssignment } from '@/lib/services/email-notifications';

async function assignVerification(verificationId: string, verifierId: string) {
  await prisma.verification.update({
    where: { id: verificationId },
    data: {
      verifier_id: verifierId,
      status: 'ASSIGNED',
      assigned_at: new Date(),
    },
  });

  // Notify verifier
  await sendVerificationAssignment(verifierId, verificationId);
}
```

## Monthly Settlement Process

### Automated (Recommended)

Set up a cron job to run on the 1st of each month:

```bash
# In your crontab or deployment platform
0 2 1 * * cd /path/to/app && npm run monthly-settlement
```

### Manual Trigger

```bash
# Run settlement for all sellers and verifiers (previous month)
npm run monthly-settlement

# Run for specific seller/verifier
node scripts/monthly-settlement.ts seller <user_id>
```

## Verifier Dashboard Access

Add route protection in your app:

```typescript
// app/(verifier)/layout.tsx
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export default async function VerifierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || user.role !== 'verifier') {
    redirect('/login');
  }

  return <>{children}</>;
}
```

## API Route Protection

Add authentication to verifier API routes:

```typescript
// middleware.ts or in each route
import { NextRequest } from 'next/server';

export async function requireAuth(request: NextRequest) {
  const session = await getSession(request);

  if (!session) {
    throw new Error('Unauthorized');
  }

  return session.user;
}

// In API route
export async function GET(request: NextRequest) {
  const user = await requireAuth(request);

  if (user.role !== 'verifier') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // ... rest of handler
}
```

## Testing the System

### 1. Create Test Verifier

```sql
-- In your database
UPDATE users
SET role = 'verifier'
WHERE email = 'test@example.com';
```

### 2. Create Test Verification

```typescript
// In Prisma Studio or via script
await prisma.verification.create({
  data: {
    product_id: 'test-product-id',
    verifier_id: 'test-verifier-id',
    level: 1,
    fee: 5000, // $50
    platform_share: 1500, // $15 (30%)
    verifier_share: 3500, // $35 (70%)
    status: 'COMPLETED',
    completed_at: new Date(),
  },
});
```

### 3. Process Payout

```bash
node -e "
  import('./lib/services/verifier-earnings').then(async (m) => {
    await m.processVerificationPayout('verification-id');
    console.log('Payout created!');
  });
"
```

### 4. Run Settlement

```bash
npm run monthly-settlement
```

### 5. Check Results

```bash
# Open Prisma Studio
npx prisma studio

# Check:
# - VerifierPayout created with PENDING status
# - Settlement created with verification_earnings
# - VerifierPayout.settlement_id linked
# - VerifierPayout.status = INCLUDED_IN_SETTLEMENT
```

## Monitoring & Maintenance

### Daily Tasks

```bash
# Update verifier stats
npm run update-verifier-stats update
```

### Weekly Tasks

```bash
# Generate performance reports
node scripts/update-verifier-stats.ts report
```

### Monthly Tasks

```bash
# Run settlement (automated via cron)
npm run monthly-settlement

# Review and approve settlements in admin panel
# Process payouts via Stripe Connect or bank transfer
```

## Common Issues

### Issue: Payout Not Created

**Solution:**
```typescript
// Check verification status and verifier assignment
const verification = await prisma.verification.findUnique({
  where: { id: verificationId },
  include: { verifierPayout: true },
});

console.log({
  status: verification.status,
  hasVerifier: !!verification.verifier_id,
  hasPayoutAlready: !!verification.verifierPayout,
});
```

### Issue: Settlement Not Generated

**Solution:**
```bash
# Check for pending payouts
npx prisma studio
# Navigate to VerifierPayout
# Filter by status = PENDING and date range
```

### Issue: Incorrect Earnings Amount

**Solution:**
```typescript
// Verify split calculation
import { calculateVerificationSplit } from '@/lib/services/verifier-earnings';

const fee = 5000; // $50
const split = calculateVerificationSplit(fee);
console.log(split);
// Should output: { platformShare: 1500, verifierShare: 3500 }
```

## Next Steps

1. ✅ Set up email service (SendGrid, AWS SES)
2. ✅ Configure Stripe Connect for payouts
3. ✅ Add admin settlement approval UI
4. ✅ Set up monitoring and alerts
5. ✅ Create verifier onboarding flow
6. ✅ Add payment method verification

## Support Resources

- **Full Documentation**: `docs/VERIFIER_SETTLEMENT.md`
- **API Reference**: Check individual route files in `app/api/verifier/`
- **Service Reference**: Check `lib/services/verifier-earnings.ts`
- **Database Schema**: `prisma/schema.prisma`

## Rollback Plan

If you need to rollback:

```bash
# Revert migration
npx prisma migrate resolve --rolled-back <migration_name>

# Or create down migration
npx prisma migrate dev --name revert-verifier-settlement
```

In the migration file, add:
```sql
-- Remove verifier settlement features
ALTER TABLE settlements DROP COLUMN verification_earnings;
ALTER TABLE settlements DROP COLUMN verification_count;
DROP TABLE verifier_payouts;
ALTER TABLE users DROP COLUMN verifier_stats;
```

## Production Checklist

Before deploying to production:

- [ ] Database migrations tested
- [ ] API routes have authentication
- [ ] Email service configured
- [ ] Payment provider setup (Stripe Connect)
- [ ] Cron jobs scheduled
- [ ] Monitoring alerts configured
- [ ] Error tracking setup (Sentry, etc.)
- [ ] Backup strategy in place
- [ ] Documentation reviewed
- [ ] Team trained on new features
