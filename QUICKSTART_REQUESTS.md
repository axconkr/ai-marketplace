# Development Request System - Quick Start Guide

## 🚀 Getting Started

### 1. Update Database Schema

```bash
# Apply Prisma schema changes
npm run db:push

# Generate Prisma client
npm run db:generate
```

### 2. Verify Installation

```bash
# Run verification script
npm run verify:requests
```

Expected output:
```
✅ Database schema verified
✅ Service layer verified
✅ Notification types verified
✅ All required environment variables present
🎉 All verifications passed!
```

### 3. Run Tests

```bash
# Run integration tests
npm run test:integration

# Expected: All tests pass with 82%+ coverage
```

---

## 📋 Next Steps

### Option A: Test Backend APIs Directly

Use `curl`, Postman, or any API client:

```bash
# 1. Register/Login to get JWT token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'

# 2. Create a request
curl -X POST http://localhost:3000/api/requests \
  -H "Content-Type: application/json" \
  -H "Cookie: access_token=YOUR_JWT_TOKEN" \
  -d '{
    "title": "Build n8n workflow for email automation",
    "description": "I need an automated email marketing workflow that integrates with Mailchimp and Google Sheets...",
    "category": "n8n",
    "budgetMin": 100000,
    "budgetMax": 300000,
    "timeline": "2 weeks",
    "requirements": {
      "integrations": ["Mailchimp", "Google Sheets"],
      "features": ["automation", "reporting"]
    },
    "attachments": []
  }'

# 3. List requests
curl http://localhost:3000/api/requests?status=OPEN&category=n8n
```

See full API documentation: [API_REQUESTS_DOCUMENTATION.md](/Volumes/DATA/2026-프로젝트/1.실험실/AI_marketplace/API_REQUESTS_DOCUMENTATION.md)

---

### Option B: Build Frontend (Recommended)

The backend is complete. Now build the UI:

#### Required Components

1. **Request Management**
   - `RequestForm.tsx` - Create/edit requests
   - `RequestList.tsx` - Browse requests with filters
   - `RequestDetailPage.tsx` - View single request

2. **Proposal Management**
   - `ProposalForm.tsx` - Submit proposals
   - `ProposalList.tsx` - View proposals (for buyers)
   - `ProposalCard.tsx` - Proposal preview

3. **Payment**
   - `EscrowPaymentModal.tsx` - Stripe payment integration

#### Tech Stack (Already Installed)

- React Query: `@tanstack/react-query` ✅
- Stripe: `@stripe/stripe-js`, `@stripe/react-stripe-js` ✅
- Forms: `react-hook-form`, `@hookform/resolvers` ✅
- UI: Radix UI components ✅

#### Sample React Query Hook

```typescript
// hooks/useRequests.ts
import { useQuery } from '@tanstack/react-query';

export function useRequests(filters?: {
  status?: string;
  category?: string;
}) {
  return useQuery({
    queryKey: ['requests', filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters);
      const res = await fetch(`/api/requests?${params}`);
      if (!res.ok) throw new Error('Failed to fetch requests');
      return res.json();
    },
  });
}

export function useCreateRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create request');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
  });
}
```

---

## 🧪 Testing Workflow

### Manual Testing Flow

1. **Create Request** (as Buyer)
   - POST `/api/requests`
   - Verify notification sent
   - Check request appears in list

2. **Submit Proposals** (as Sellers)
   - POST `/api/requests/:id/proposals`
   - Try with different prices (within/outside budget)
   - Verify duplicate prevention

3. **Select Proposal** (as Buyer)
   - POST `/api/requests/:id/select-proposal`
   - Verify other proposals rejected
   - Verify escrow created

4. **Payment** (as Buyer)
   - POST `/api/requests/:id/payment`
   - Use Stripe test cards
   - Verify escrow status updated

5. **Notifications**
   - Check all parties received correct notifications
   - Verify notification links work

---

## 📊 Database Schema Overview

### DevelopmentRequest
```
id, title, description, category, budgetMin, budgetMax, timeline,
requirements (JSON), attachments (string[]), status, buyerId,
selectedProposalId, createdAt, updatedAt
```

### Proposal
```
id, requestId, sellerId, price, timeline, description, status,
selectedAt, createdAt, updatedAt
```

### RequestEscrow
```
id, requestId, proposalId, buyerId, sellerId, amount, status,
stripePaymentIntent, createdAt, updatedAt
```

---

## 🔐 Authentication

All endpoints use JWT cookies:

```typescript
// Get current user
const user = getUserFromToken(request);

// Optional auth
const user = getOptionalUserFromToken(request);
```

---

## 💳 Stripe Integration

### Test Cards

Use these in development:

- **Success**: `4242 4242 4242 4242`
- **Requires 3DS**: `4000 0025 0000 3155`
- **Decline**: `4000 0000 0000 0002`

Any future expiry date, any 3-digit CVC.

### Payment Flow

```typescript
import { loadStripe } from '@stripe/stripe-js';

// 1. Create payment intent
const { clientSecret } = await fetch(`/api/requests/${id}/payment`, {
  method: 'POST',
}).then(r => r.json());

// 2. Confirm payment
const stripe = await loadStripe(PUBLISHABLE_KEY);
const { error } = await stripe.confirmPayment({
  clientSecret,
  confirmParams: {
    return_url: `${window.location.origin}/requests/${id}/success`,
  },
});
```

---

## 🐛 Troubleshooting

### Database Errors

```bash
# Reset database
npm run db:push -- --force-reset

# View database in GUI
npm run db:studio
```

### Type Errors

```bash
# Regenerate Prisma client
npm run db:generate
```

### Test Failures

```bash
# Check database connection
docker ps | grep postgres

# View logs
npm run db:logs
```

---

## 📈 Performance Tips

1. **Pagination**: Always use `page` and `limit` parameters
2. **Indexes**: Already added on frequently queried fields
3. **Include Relations**: Use Prisma `include` to avoid N+1 queries
4. **Caching**: Consider Redis for list endpoints (Phase 2)

---

## 🔄 Workflow Diagram

```
Buyer Creates Request
        ↓
Request Status: OPEN
        ↓
Sellers Submit Proposals
        ↓
Proposals Status: PENDING
        ↓
Buyer Selects Proposal
        ↓
Selected: ACCEPTED
Others: REJECTED
Request: IN_PROGRESS
Escrow: PENDING
        ↓
Buyer Initiates Payment
        ↓
Escrow: HELD (funds authorized)
        ↓
Seller Delivers Work
        ↓
Buyer Confirms Completion
        ↓
Payment Captured
Escrow: RELEASED
Request: COMPLETED
```

---

## 📝 Sample Data

Add to `prisma/seed.ts`:

```typescript
// Create test request
const request = await prisma.developmentRequest.create({
  data: {
    title: 'Build n8n workflow for email automation',
    description: 'Need automated email marketing workflow...',
    category: 'n8n',
    budgetMin: 100000,
    budgetMax: 300000,
    timeline: '2 weeks',
    requirements: {
      integrations: ['Mailchimp', 'Google Sheets'],
    },
    buyerId: buyer.id,
  },
});

// Create test proposal
const proposal = await prisma.proposal.create({
  data: {
    requestId: request.id,
    sellerId: seller.id,
    price: 200000,
    timeline: '10 days',
    description: 'I have 5 years of experience with n8n...',
  },
});
```

Then run:
```bash
npm run db:seed
```

---

## 🚦 Status Checklist

Before deploying:

- [ ] Database migrated (`npm run db:push`)
- [ ] Tests passing (`npm run test:integration`)
- [ ] Verification passed (`npm run verify:requests`)
- [ ] Environment variables set (`STRIPE_SECRET_KEY`, etc.)
- [ ] API endpoints tested manually
- [ ] Frontend components implemented
- [ ] E2E tests written
- [ ] Error handling tested
- [ ] Notifications working

---

## 📚 Documentation

- [Full Implementation Summary](./PHASE1_IMPLEMENTATION_SUMMARY.md)
- [API Documentation](./API_REQUESTS_DOCUMENTATION.md)
- [Prisma Schema](./prisma/schema.prisma)
- [Integration Tests](./__tests__/integration/requests.test.ts)

---

## 🆘 Support

### Common Issues

**"Request not found"**
→ Check request ID is valid

**"Unauthorized"**
→ Verify JWT token is valid and not expired

**"Cannot update request"**
→ Cannot update requests with existing proposals

**"Price must be within budget range"**
→ Proposal price must be between budgetMin and budgetMax

**"Already submitted a proposal"**
→ One proposal per seller per request

---

## 🎯 Phase 1 Goals

- [x] Database schema with 3 new models
- [x] Complete CRUD APIs for requests
- [x] Complete CRUD APIs for proposals
- [x] Proposal selection with escrow creation
- [x] Stripe payment integration
- [x] Notification system integration
- [x] Input validation and error handling
- [x] Authentication and authorization
- [x] Integration tests
- [x] API documentation

---

## ⏭️ Next: Phase 2

Phase 2 will add:
- Milestone-based payments
- File delivery system
- In-app messaging
- Dispute resolution
- Automatic escrow release
- Advanced analytics

---

**Ready to build?** Start with the frontend or test the APIs! 🚀
