# Settlement System Quick Start Guide

Get the settlement system up and running in 5 minutes.

## Prerequisites

- PostgreSQL database
- Node.js 18+
- Email service account (SendGrid/AWS SES)

## 1. Database Setup

```bash
# Run migration
npx prisma migrate deploy

# Or generate and apply
npx prisma migrate dev --name add_settlement_system

# Generate Prisma client
npx prisma generate
```

## 2. Environment Variables

Add to `.env.local`:

```bash
# Required
DATABASE_URL="postgresql://user:password@localhost:5432/ai_marketplace"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Email (choose one)
SENDGRID_API_KEY="SG.xxx"
FROM_EMAIL="noreply@yourapp.com"

# Cron Security
CRON_SECRET="your-random-secret-token"

# Optional - Stripe Connect
STRIPE_SECRET_KEY="sk_test_xxx"
STRIPE_PUBLISHABLE_KEY="pk_test_xxx"
```

## 3. Install Dependencies

```bash
npm install date-fns
npm install recharts  # For analytics charts
```

## 4. Test Settlement Calculation

Create test orders first, then run:

```bash
# Run settlement for specific seller
npm run settlement seller <sellerId>

# Or via TypeScript
npx tsx scripts/monthly-settlement.ts seller <sellerId>
```

## 5. Access Dashboards

**Admin Dashboard**: `/admin/settlements`
- View all settlements
- Process payouts
- View analytics

**Seller Dashboard**: `/dashboard/settlements`
- View settlement history
- See current month estimate
- Manage bank account

**Bank Account Settings**: `/dashboard/settings/bank-account`
- Add Korean bank account
- Connect Stripe (global)

## 6. Setup Cron Job

### Vercel

Create `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/monthly-settlement",
    "schedule": "0 0 1 * *"
  }]
}
```

Deploy: `vercel --prod`

### Manual Testing

```bash
curl -H "Authorization: Bearer ${CRON_SECRET}" \
  http://localhost:3000/api/cron/monthly-settlement
```

### AWS EventBridge

1. Create rule: `cron(0 0 1 * ? *)`
2. Target: HTTP endpoint
3. URL: `https://yourapp.com/api/cron/monthly-settlement`
4. Headers: `Authorization: Bearer ${CRON_SECRET}`

## 7. Verify Email Notifications

Check notification service logs when settlements are created:

```bash
# Should see email logs
📧 Sending settlement notification to seller@example.com
```

## 8. Test Complete Flow

1. **Create Orders** (previous month):
   ```sql
   INSERT INTO "Order" (id, buyer_id, product_id, amount, platform_fee, status, paid_at)
   VALUES ('order_1', 'buyer_1', 'product_1', 10000, 1500, 'PAID', '2024-11-15');
   ```

2. **Run Settlement**:
   ```bash
   npm run settlement seller <sellerId>
   ```

3. **Check Results**:
   - Database: `SELECT * FROM "Settlement" WHERE seller_id = '<sellerId>'`
   - Email: Check logs or inbox
   - Dashboard: Visit `/dashboard/settlements`

4. **Process Payout** (admin):
   - Go to `/admin/settlements`
   - Click "Process" on pending settlement
   - Select payment method
   - Mark as paid

## API Endpoints Quick Reference

```bash
# List settlements (seller)
GET /api/settlements

# List all settlements (admin)
GET /api/settlements?status=PENDING&page=1

# Get settlement details
GET /api/settlements/:id

# Current month estimate
GET /api/settlements/current

# Process payout (admin)
POST /api/settlements/process/:id
{
  "paymentMethod": "bank_transfer",
  "transactionId": "TXN_123"
}

# Mark as paid (admin)
POST /api/settlements/process/:id
{
  "action": "mark_paid"
}

# Update bank account
PUT /api/user/bank-account
{
  "bank_name": "KB국민은행",
  "bank_account": "123-456-789",
  "account_holder": "홍길동"
}
```

## Troubleshooting

### Settlement Not Created

```bash
# Check for paid orders
SELECT * FROM "Order"
WHERE product_id IN (
  SELECT id FROM "Product" WHERE seller_id = '<sellerId>'
)
AND status = 'PAID'
AND paid_at >= '2024-11-01'
AND paid_at < '2024-12-01';
```

### Email Not Sending

1. Check API key: `echo $SENDGRID_API_KEY`
2. Verify FROM_EMAIL domain
3. Check logs: `console.log` in notification service

### Cron Not Running

1. Verify `vercel.json` exists
2. Check environment variables in Vercel dashboard
3. Test manually: `curl -H "Authorization: Bearer ${CRON_SECRET}" <url>`

## Next Steps

1. Configure platform fee rates per seller
2. Set up bank account verification (1원 deposit)
3. Integrate Stripe Connect for global payouts
4. Customize email templates
5. Add tax reporting features
6. Set up monitoring and alerts

## File Structure

```
app/
├── (admin)/
│   └── settlements/
│       └── page.tsx                    # Admin dashboard
├── (marketplace)/
│   └── dashboard/
│       ├── settlements/
│       │   └── page.tsx                # Seller dashboard
│       └── settings/
│           └── bank-account/
│               └── page.tsx            # Bank settings
└── api/
    ├── settlements/
    │   ├── route.ts                    # List/create
    │   ├── [id]/route.ts               # Details
    │   ├── current/route.ts            # Current estimate
    │   ├── summary/route.ts            # Summary stats
    │   └── process/[id]/route.ts       # Process payout
    ├── user/
    │   ├── bank-account/route.ts       # Bank CRUD
    │   └── stripe-connect/route.ts     # Stripe onboarding
    └── cron/
        └── monthly-settlement/route.ts  # Cron endpoint

lib/
└── services/
    ├── settlement.ts                   # Core settlement logic
    ├── settlement-report.ts            # Report generation
    └── notification.ts                 # Email service

scripts/
└── monthly-settlement.ts               # Cron script

components/
└── analytics/
    └── FinancialDashboard.tsx          # Analytics charts
```

## Support

Need help? Check:
- Full documentation: `SETTLEMENT_SYSTEM_DOCUMENTATION.md`
- Database schema: `prisma/schema.prisma`
- Example usage: `scripts/monthly-settlement.ts`

---

**Quick Start Complete!** Your settlement system is ready to use.
