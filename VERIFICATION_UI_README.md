# Verification UI Implementation

Complete verification UI implementation for AI Marketplace with seller, verifier, and admin dashboards.

## Overview

This implementation provides a comprehensive verification system UI with:
- 4 verification levels (0-3) with different pricing and features
- Seller dashboard to request and track verifications
- Verifier dashboard to claim and review verifications
- Admin dashboard to monitor and manage all verifications
- Fully responsive design with loading states and error handling

## File Structure

```
components/
├── ui/                           # shadcn/ui components
│   ├── progress.tsx             # Progress bar (NEW)
│   ├── tabs.tsx                 # Tabs component (NEW)
│   ├── table.tsx                # Table component (NEW)
│   └── [other existing components]
│
├── verification/                 # Verification components (NEW)
│   ├── index.ts                 # Barrel export
│   ├── VerificationBadge.tsx    # Badge display with levels
│   ├── VerificationStatus.tsx   # Status stepper
│   ├── VerificationRequest.tsx  # Request dialog
│   ├── VerificationReport.tsx   # Report viewer
│   ├── VerificationCard.tsx     # List item card
│   └── ReviewForm.tsx           # Verifier review form

lib/
├── types/
│   └── verification.ts          # Type definitions (NEW)
│
└── api/
    └── verifications.ts         # API client (NEW)

hooks/
└── use-verifications.ts         # React Query hooks (NEW)

app/
├── (marketplace)/dashboard/verifications/
│   ├── page.tsx                 # Seller dashboard (NEW)
│   └── [id]/
│       └── page.tsx             # Verification details (NEW)
│
├── (verifier)/verifications/
│   ├── page.tsx                 # Verifier dashboard (NEW)
│   └── [id]/review/
│       └── page.tsx             # Review page (NEW)
│
└── (admin)/verifications/
    └── page.tsx                 # Admin dashboard (NEW)
```

## Verification Levels

### Level 0: Automatic (Free)
- Automated file format check
- Basic virus scan
- Metadata validation
- Badge: "Verified" (gray)
- Instant processing

### Level 1: Basic Review ($50)
- All Level 0 checks
- Code quality analysis
- Documentation review
- Manual verifier review
- Badge: "Reviewed" (blue)
- 1-3 day processing

### Level 2: Expert Review ($150)
- All Level 1 checks
- Deep code review
- Security scan
- Performance testing
- Badge: "Expert" (purple)
- 3-7 day processing
- **Status: Coming Soon**

### Level 3: Security Audit ($500)
- All Level 2 checks
- Comprehensive security audit
- Load testing
- Priority support
- Badge: "Premium" (gold)
- 5-10 day processing
- **Status: Coming Soon**

## Components

### VerificationBadge
Display verification level badge on product cards.

```tsx
import { VerificationBadge } from '@/components/verification';

<VerificationBadge level={1} score={85} />
<VerificationBadgeList badges={['security', 'performance']} />
```

### VerificationStatus
Show verification progress with stepper UI.

```tsx
import { VerificationStatus } from '@/components/verification';

<VerificationStatus verification={verification} />
```

### VerificationRequest
Dialog for requesting product verification.

```tsx
import { VerificationRequest } from '@/components/verification';

<VerificationRequest
  productId={product.id}
  onSuccess={() => console.log('Requested!')}
/>
```

### VerificationReport
Display detailed verification results.

```tsx
import { VerificationReport } from '@/components/verification';

<VerificationReport verification={verification} />
```

### VerificationCard
List item for verification cards.

```tsx
import { VerificationCard } from '@/components/verification';

<VerificationCard
  verification={verification}
  viewType="seller" // or "verifier" or "admin"
  onClaim={handleClaim} // verifier only
/>
```

### ReviewForm
Verifier review submission form.

```tsx
import { ReviewForm } from '@/components/verification';

<ReviewForm
  verificationId={id}
  onSuccess={() => router.push('/verifications')}
/>
```

## Hooks

### useVerifications
Fetch verifications list with filters.

```tsx
import { useVerifications } from '@/hooks/use-verifications';

const { data, isLoading, error } = useVerifications({
  status: 'PENDING',
  level: 1
});
```

### useVerification
Fetch single verification by ID.

```tsx
import { useVerification } from '@/hooks/use-verifications';

const { data: verification } = useVerification(id);
```

### useMyVerifications
Fetch seller's verifications.

```tsx
import { useMyVerifications } from '@/hooks/use-verifications';

const { data: verifications } = useMyVerifications();
```

### useAssignedVerifications
Fetch verifications assigned to verifier.

```tsx
import { useAssignedVerifications } from '@/hooks/use-verifications';

const { data: verifications } = useAssignedVerifications();
```

### useRequestVerification
Request verification mutation.

```tsx
import { useRequestVerification } from '@/hooks/use-verifications';

const mutation = useRequestVerification();
mutation.mutate({ productId, level: 1 });
```

### useClaimVerification
Claim verification mutation (verifier).

```tsx
import { useClaimVerification } from '@/hooks/use-verifications';

const mutation = useClaimVerification();
mutation.mutate(verificationId);
```

### useSubmitReview
Submit review mutation (verifier).

```tsx
import { useSubmitReview } from '@/hooks/use-verifications';

const mutation = useSubmitReview();
mutation.mutate({
  id: verificationId,
  review: { score, comments, approved, badges, improvements }
});
```

## Pages

### Seller Dashboard
**Path:** `/dashboard/verifications`

Features:
- Stats overview (total, pending, in progress, approved)
- Total spent on verifications
- List of all verifications with status
- Empty state for no verifications

### Seller Verification Detail
**Path:** `/dashboard/verifications/[id]`

Features:
- Verification status stepper
- Detailed report viewer
- Badge display
- Automated checks results
- Manual review feedback

### Verifier Dashboard
**Path:** `/verifications`

Features:
- Earnings stats (total reviews, earnings, approval rate, avg score)
- Three tabs: Available, In Progress, Completed
- Claim verification button
- Start/Continue review buttons

### Verifier Review Page
**Path:** `/verifications/[id]/review`

Features:
- Product details sidebar
- Automated checks display
- Review form with:
  - Score slider (0-100)
  - Approve/Reject decision
  - Quality badges selection
  - Comments textarea
  - Strengths, weaknesses, improvements lists
- Real-time validation
- Success/error handling

### Admin Dashboard
**Path:** `/admin/verifications`

Features:
- Platform stats (total, revenue, approved, rejected)
- Verifications by level breakdown
- Verifications by status table
- All/Pending tabs
- Assign verifier button (pending)

## API Integration

The UI is ready for backend integration. Implement these API endpoints:

### GET /api/verifications
Fetch verifications list with filters.

Query params:
- status: VerificationStatus
- level: VerificationLevel
- verifier_id: string
- product_id: string
- page: number
- limit: number

Response:
```json
{
  "verifications": [...],
  "total": 100,
  "page": 1,
  "limit": 20,
  "totalPages": 5
}
```

### GET /api/verifications/:id
Fetch single verification.

Response: VerificationWithDetails

### POST /api/verifications
Request verification for product.

Body:
```json
{
  "productId": "string",
  "level": 0 | 1 | 2 | 3
}
```

Response: Verification

### POST /api/verifications/:id/claim
Claim verification (verifier).

Response: Verification

### POST /api/verifications/:id/review
Submit review (verifier).

Body:
```json
{
  "score": 85,
  "comments": "string",
  "approved": true,
  "badges": ["security", "performance"],
  "improvements": ["..."],
  "strengths": ["..."],
  "weaknesses": ["..."]
}
```

Response: Verification

### POST /api/verifications/:id/assign
Assign verifier (admin).

Body:
```json
{
  "verifierId": "string"
}
```

Response: Verification

### GET /api/verifications/stats
Get verification statistics (admin).

Response:
```json
{
  "totalVerifications": 100,
  "byLevel": { "level0": 50, "level1": 30, "level2": 15, "level3": 5 },
  "byStatus": { "pending": 10, "assigned": 5, "inProgress": 3, "completed": 82 },
  "totalRevenue": 15000,
  "averageScore": 85.5
}
```

### GET /api/verifications/verifier-stats
Get verifier statistics.

Query params:
- verifierId: string (optional, defaults to current user)

Response:
```json
{
  "totalVerifications": 50,
  "totalEarnings": 3500,
  "approvalRate": 92.5,
  "averageScore": 87.3,
  "pendingPayouts": 350
}
```

### GET /api/verifications/my-verifications
Get seller's verifications.

Response: VerificationWithDetails[]

### GET /api/verifications/assigned-to-me
Get verifications assigned to verifier.

Response: VerificationWithDetails[]

## Database Schema

The UI expects the following Prisma schema (already implemented in backend):

```prisma
model Verification {
  id              String   @id @default(cuid())
  product_id      String
  verifier_id     String?
  level           Int      // 0-3
  status          VerificationStatus @default(PENDING)
  fee             Int      // cents
  platform_share  Int      // cents
  verifier_share  Int      // cents
  report          Json?
  score           Float?
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
  PENDING
  ASSIGNED
  IN_PROGRESS
  COMPLETED
  APPROVED
  REJECTED
  CANCELLED
}
```

## Payment Integration

For paid verifications (Level 1+):
1. User selects verification level
2. Payment is processed (Stripe/Toss)
3. Verification request is created
4. Fee is split: 30% platform, 70% verifier
5. Verifier earnings tracked in VerifierPayout model
6. Included in monthly settlement

## Styling

All components use:
- Tailwind CSS for styling
- shadcn/ui components
- Responsive design (mobile-first)
- Dark mode ready (via CSS variables)
- Loading skeletons
- Error states
- Empty states

## Dependencies

Required packages (add to package.json):
```json
{
  "@radix-ui/react-progress": "^1.1.1",
  "@radix-ui/react-slider": "^1.2.1",
  "@radix-ui/react-tabs": "^1.1.1"
}
```

Run: `npm install`

## Usage Example

### In Product Page
Add verification request button:

```tsx
import { VerificationRequest } from '@/components/verification';

export default function ProductPage() {
  return (
    <div>
      {/* Product details */}
      <VerificationRequest
        productId={product.id}
        onSuccess={() => {
          toast.success('Verification requested!');
        }}
      />
    </div>
  );
}
```

### In Product Card
Display verification badge:

```tsx
import { VerificationBadge } from '@/components/verification';

export function ProductCard({ product }) {
  return (
    <div>
      <h3>{product.name}</h3>
      {product.verification_level >= 0 && (
        <VerificationBadge
          level={product.verification_level}
          score={product.verification_score}
        />
      )}
    </div>
  );
}
```

## Testing

Test the UI by:
1. Creating mock verifications in different states
2. Testing claim flow as verifier
3. Testing review submission
4. Testing admin assignment (when implemented)
5. Testing responsive design on mobile

## Next Steps

1. Implement backend API endpoints
2. Connect payment processing for paid verifications
3. Implement automated checks (Level 0)
4. Implement code quality analysis (Level 1)
5. Add real-time updates (optional, using websockets)
6. Implement email notifications
7. Add verifier application/approval system
8. Implement Level 2 and Level 3 features

## Support

For questions or issues, refer to:
- Type definitions: `/lib/types/verification.ts`
- API client: `/lib/api/verifications.ts`
- Component examples: Check page implementations
- Prisma schema: `/prisma/schema.prisma`
