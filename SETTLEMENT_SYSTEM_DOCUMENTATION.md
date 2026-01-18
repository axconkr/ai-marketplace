# Settlement System Documentation

Complete seller settlement (정산) system for AI Marketplace with monthly payouts, bank transfer support, and comprehensive reporting.

## Table of Contents

1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [Core Services](#core-services)
4. [API Routes](#api-routes)
5. [User Interfaces](#user-interfaces)
6. [Cron Jobs](#cron-jobs)
7. [Notifications](#notifications)
8. [Configuration](#configuration)
9. [Testing](#testing)
10. [Deployment](#deployment)

---

## Overview

### Key Features

- **Monthly Settlement Cycle**: Automatic settlements on the 1st of each month
- **Platform Fee Management**: Configurable 10-20% platform fee based on seller tier
- **Multiple Payment Methods**: Bank transfer (Korea) and Stripe Connect (global)
- **Bank Account Verification**: Secure 1원 deposit verification for Korean banks
- **Settlement Reports**: HTML/CSV reports with detailed breakdowns
- **Email Notifications**: Automated notifications for settlement lifecycle events
- **Financial Analytics**: Comprehensive dashboard with revenue metrics and trends
- **Tax Reporting**: Support for Korean tax requirements (3.3% tax invoice)

### Settlement Flow

```
1. Orders Paid → Track in current month
2. Month End → Calculate total sales, fees, refunds
3. 1st of Month → Create settlement record
4. Admin Review → Verify bank details, process payout
5. Payment Sent → Mark as paid, send confirmation email
6. Seller Receives → Payment in 1-3 business days
```

---

## Database Schema

### Settlement Model

```prisma
model Settlement {
  id                String   @id @default(cuid())
  seller_id         String
  total_amount      Float    // Total sales amount
  platform_fee      Float    // Total platform fees
  payout_amount     Float    // Amount to be paid out
  currency          String
  status            SettlementStatus @default(PENDING)
  period_start      DateTime
  period_end        DateTime
  payout_date       DateTime?
  payout_method     String?  // stripe_connect, bank_transfer
  payout_reference  String?  // External payout reference

  seller User             @relation(...)
  items  SettlementItem[]
}

enum SettlementStatus {
  PENDING       // Settlement calculated, awaiting payout
  PROCESSING    // Payout in progress
  PAID          // Payout completed
  FAILED        // Payout failed
  CANCELLED     // Settlement cancelled
}
```

### SettlementItem Model

```prisma
model SettlementItem {
  id            String   @id @default(cuid())
  settlement_id String
  product_id    String
  order_id      String
  amount        Float    // Sale amount
  platform_fee  Float    // Platform fee for this sale
  payout_amount Float    // Amount seller receives

  settlement Settlement @relation(...)
  product    Product    @relation(...)
}
```

### User Settlement Fields

```prisma
model User {
  // Settlement-related fields
  stripe_account_id String?  // Stripe Connect account ID
  bank_name         String?
  bank_account      String?
  account_holder    String?
  bank_verified     Boolean  @default(false)
  platform_fee_rate Float    @default(0.15) // 15% default
}
```

---

## Core Services

### Settlement Service

**Location**: `lib/services/settlement.ts`

#### Key Functions

**calculateSettlement(params)**
```typescript
// Calculate settlement for a seller for a specific period
const { settlement, calculation } = await calculateSettlement({
  sellerId: 'user_123',
  periodStart: new Date('2024-01-01'),
  periodEnd: new Date('2024-01-31'),
});
```

**getCurrentMonthEstimate(sellerId)**
```typescript
// Get real-time earnings estimate for current month
const estimate = await getCurrentMonthEstimate('user_123');
// Returns: { totalSales, platformFee, netAmount, orderCount }
```

**processSettlementPayout(settlementId, method, transactionId?)**
```typescript
// Process payout (admin only)
await processSettlementPayout(
  'settlement_123',
  'bank_transfer',
  'TXN_456'
);
```

**markSettlementAsPaid(settlementId)**
```typescript
// Mark settlement as paid (admin only)
await markSettlementAsPaid('settlement_123');
```

**listSettlementsForSeller(sellerId, limit)**
```typescript
// List settlements for a seller
const settlements = await listSettlementsForSeller('user_123', 10);
```

**getSettlementSummary(sellerId?)**
```typescript
// Get summary statistics
const summary = await getSettlementSummary();
// Returns: { pending, processing, paid, failed }
```

### Settlement Report Service

**Location**: `lib/services/settlement-report.ts`

#### Key Functions

**generateSettlementReport(settlementId)**
```typescript
// Generate complete settlement report data
const report = await generateSettlementReport('settlement_123');
```

**generateHTMLReport(data)**
```typescript
// Generate HTML report for email/display
const html = generateHTMLReport(reportData);
```

**generateCSV(data)**
```typescript
// Generate CSV export
const csv = generateCSV(reportData);
```

### Notification Service

**Location**: `lib/services/notification.ts`

#### Key Functions

**sendSettlementCreatedEmail(sellerId, settlementId)**
```typescript
// Notify seller of new settlement
await sendSettlementCreatedEmail('user_123', 'settlement_123');
```

**sendSettlementPaidEmail(settlementId)**
```typescript
// Notify seller of successful payout
await sendSettlementPaidEmail('settlement_123');
```

**sendSettlementFailedEmail(settlementId, reason?)**
```typescript
// Notify seller of payout failure
await sendSettlementFailedEmail('settlement_123', 'Invalid bank account');
```

---

## API Routes

### Settlements

**GET /api/settlements**
- List settlements (seller: own, admin: all)
- Query params: `page`, `limit`, `status`, `sellerId`, `startDate`, `endDate`
- Response: `{ settlements, pagination }`

**POST /api/settlements**
- Create settlement manually (admin only)
- Body: `{ sellerId, periodStart, periodEnd }`
- Response: `{ settlement, calculation }`

**GET /api/settlements/[id]**
- Get settlement details
- Auth: Seller (own) or Admin (all)
- Response: Settlement with items and seller info

**GET /api/settlements/current**
- Get current month estimate (seller only)
- Response: `{ totalSales, platformFee, netAmount, orderCount }`

**GET /api/settlements/summary**
- Get settlement summary statistics
- Response: `{ pending, processing, paid, failed }`

**POST /api/settlements/process/[id]**
- Process settlement payout (admin only)
- Body: `{ paymentMethod, transactionId, action }`
- Actions: `process`, `mark_paid`, `mark_failed`

### Bank Account

**GET /api/user/bank-account**
- Get user's bank account details
- Response: `{ bank_name, bank_account, account_holder, bank_verified }`

**PUT /api/user/bank-account**
- Update bank account details
- Body: `{ bank_name, bank_account, account_holder }`
- Auto-resets verification if account changed

### Stripe Connect

**POST /api/user/stripe-connect**
- Create Stripe Connect onboarding link
- Response: `{ url }`

**GET /api/user/stripe-connect**
- Get Stripe Connect account status
- Response: `{ connected, account_id }`

### Cron Jobs

**GET /api/cron/monthly-settlement**
- Run monthly settlement job
- Auth: Bearer token via `CRON_SECRET`
- Response: `{ success, results }`

---

## User Interfaces

### Admin Settlement Dashboard

**Location**: `app/(admin)/settlements/page.tsx`

**Features**:
- Summary cards (pending, processing, paid, failed)
- Filter by status (pending, processing, paid, failed)
- Settlement table with seller info, amounts, status
- Process payout button (pending settlements)
- Mark as paid button (processing settlements)
- Pagination support
- View settlement details

**Access**: Admin role only

### Seller Settlement Dashboard

**Location**: `app/(marketplace)/dashboard/settlements/page.tsx`

**Features**:
- Current month earnings estimate card
- Bank account setup reminder
- Settlement history table
- Status badges (pending, processing, paid)
- View settlement details link
- Settlement information help section

**Access**: Sellers only

### Bank Account Settings

**Location**: `app/(marketplace)/dashboard/settings/bank-account/page.tsx`

**Features**:

#### Korean Bank Transfer
- Bank name dropdown (KB, Shinhan, Woori, Hana, etc.)
- Account number input
- Account holder name input
- Verification status indicator
- Save button

#### Stripe Connect (Global)
- Connection status
- "Connect with Stripe" button
- Account ID display (if connected)

**Access**: Sellers only

---

## Cron Jobs

### Monthly Settlement Job

**Script**: `scripts/monthly-settlement.ts`

**Schedule**: 1st of each month at midnight (configurable)

**Process**:
1. Calculate previous month period (start/end)
2. Find all sellers with paid orders in period
3. For each seller:
   - Check for existing settlement
   - Calculate total sales, fees, refunds
   - Create settlement record with items
   - Send email notification
4. Log results (successful, failed, errors)

**Manual Execution**:
```bash
# Run for all sellers (previous month)
npm run settlement

# Run for specific seller
npm run settlement seller <sellerId>

# Via API (production)
curl -H "Authorization: Bearer ${CRON_SECRET}" \
  https://your-domain.com/api/cron/monthly-settlement
```

### Vercel Cron Configuration

**File**: `vercel.json`

```json
{
  "crons": [{
    "path": "/api/cron/monthly-settlement",
    "schedule": "0 0 1 * *"
  }]
}
```

---

## Notifications

### Email Templates

All email templates use responsive HTML with inline styles.

#### Settlement Created
- **Trigger**: Settlement record created
- **To**: Seller
- **Subject**: "Settlement Ready: $XXX for Month YYYY"
- **Content**: Summary card, settlement details, next steps, CTA button

#### Settlement Paid
- **Trigger**: Settlement marked as paid
- **To**: Seller
- **Subject**: "Payment Sent: $XXX"
- **Content**: Success message, payment details, bank transfer timeline

#### Settlement Failed
- **Trigger**: Settlement marked as failed
- **To**: Seller
- **Subject**: "Action Required: Settlement Payment Issue"
- **Content**: Error details, action items, update bank account CTA

#### Bank Verification
- **Trigger**: Bank account updated/added
- **To**: Seller
- **Subject**: "Verify Your Bank Account"
- **Content**: Verification code from 1원 deposit, instructions

### Email Service Integration

**Recommended Services**:
- SendGrid (recommended)
- AWS SES
- Mailgun
- Postmark

**Configuration**:
```typescript
// lib/services/notification.ts
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
  to: seller.email,
  from: process.env.FROM_EMAIL,
  subject: 'Settlement Ready',
  html: emailHTML,
});
```

---

## Configuration

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# App
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Email Service (SendGrid example)
SENDGRID_API_KEY=SG.xxx
FROM_EMAIL=noreply@your-domain.com

# Stripe Connect (optional)
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx

# Cron Security
CRON_SECRET=your-secret-token

# Platform Settings
PLATFORM_FEE_DEFAULT=0.15  # 15%
SETTLEMENT_DAY=1           # 1st of month
```

### Platform Fee Tiers

Configure in database or app settings:

```typescript
// Example tier system
const feeRates = {
  starter: 0.20,   // 20% for new sellers
  standard: 0.15,  // 15% for verified sellers
  premium: 0.10,   // 10% for top sellers
};
```

### Bank Verification Settings

```typescript
// lib/config/settlement.ts
export const VERIFICATION_DEPOSIT_AMOUNT = 1; // 1원
export const VERIFICATION_EXPIRY_DAYS = 7;
export const MIN_SETTLEMENT_AMOUNT = 10000; // Minimum payout amount
```

---

## Testing

### Unit Tests

```typescript
// __tests__/services/settlement.test.ts
import { calculateSettlement } from '@/lib/services/settlement';

describe('Settlement Service', () => {
  it('should calculate settlement correctly', async () => {
    const result = await calculateSettlement({
      sellerId: 'test_seller',
      periodStart: new Date('2024-01-01'),
      periodEnd: new Date('2024-01-31'),
    });

    expect(result.settlement.total_amount).toBe(10000);
    expect(result.settlement.platform_fee).toBe(1500);
    expect(result.settlement.payout_amount).toBe(8500);
  });
});
```

### Integration Tests

```typescript
// __tests__/api/settlements.test.ts
import { GET, POST } from '@/app/api/settlements/route';

describe('Settlements API', () => {
  it('should list seller settlements', async () => {
    const request = new Request('http://localhost/api/settlements', {
      headers: { 'x-user-id': 'seller_123' },
    });

    const response = await GET(request);
    const data = await response.json();

    expect(data.settlements).toBeDefined();
  });
});
```

### Manual Testing

1. **Create Test Orders**:
   ```bash
   # Create orders in previous month
   npm run seed:orders
   ```

2. **Run Settlement Manually**:
   ```bash
   npm run settlement seller <sellerId>
   ```

3. **Verify Settlement**:
   - Check database for settlement record
   - Verify settlement items created
   - Check email notification sent

4. **Test Payout**:
   - Process settlement via admin dashboard
   - Verify status change
   - Check email notification

---

## Deployment

### Migration

```bash
# Generate Prisma migration
npx prisma migrate dev --name add_settlement_system

# Apply to production
npx prisma migrate deploy
```

### Vercel Deployment

1. **Deploy Application**:
   ```bash
   vercel --prod
   ```

2. **Configure Cron**:
   - Ensure `vercel.json` includes cron configuration
   - Verify cron secret is set in environment variables

3. **Test Cron**:
   ```bash
   curl -H "Authorization: Bearer ${CRON_SECRET}" \
     https://your-domain.com/api/cron/monthly-settlement
   ```

### AWS/Railway Deployment

1. **Set up Cron Job**:
   - AWS EventBridge: Create rule for monthly trigger
   - Railway: Use cron service or external scheduler

2. **Configure Environment**:
   - Set all required environment variables
   - Ensure database connection string is correct

3. **Test Email Service**:
   - Verify SendGrid/SES credentials
   - Send test email

---

## Troubleshooting

### Common Issues

**Settlement Not Created**
- Check: Are there paid orders in the period?
- Check: Is cron job running correctly?
- Check: Database connection

**Email Not Sent**
- Check: Email service API key
- Check: FROM_EMAIL domain verified
- Check: Email template rendering

**Payout Failed**
- Check: Bank account details correct
- Check: Account verified
- Check: Sufficient balance in platform account

**Stripe Connect Issues**
- Check: Stripe API keys
- Check: Webhook configuration
- Check: Account onboarding completed

### Debug Mode

Enable debug logging:

```typescript
// lib/services/settlement.ts
const DEBUG = process.env.DEBUG_SETTLEMENT === 'true';

if (DEBUG) {
  console.log('Settlement calculation:', {
    totalSales,
    platformFee,
    netAmount,
  });
}
```

---

## Future Enhancements

1. **Auto Payout**: Automatic Stripe Connect payouts
2. **Tax Integration**: Automated tax invoice generation
3. **Multi-Currency**: Support for EUR, GBP, etc.
4. **Escrow**: Hold funds until delivery confirmed
5. **Dispute Management**: Handle chargebacks and disputes
6. **Advanced Analytics**: ML-based revenue forecasting
7. **Mobile App**: Settlement tracking on mobile
8. **API Webhooks**: Real-time settlement events

---

## Support

For issues or questions:
- **Email**: support@your-domain.com
- **Documentation**: https://docs.your-domain.com
- **Issue Tracker**: GitHub Issues

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Author**: AI Marketplace Team
