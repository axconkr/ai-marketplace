# Quick Start: Verification UI

## Installation

```bash
npm install
```

## Using Components

### 1. Add Verification Request Button to Product Page

```tsx
// app/(marketplace)/products/[id]/page.tsx
import { VerificationRequest } from '@/components/verification';

export default function ProductPage({ params }) {
  return (
    <div>
      {/* Your product details */}
      
      <VerificationRequest 
        productId={params.id}
        onSuccess={() => {
          // Optional: Show toast notification
          console.log('Verification requested!');
        }}
      />
    </div>
  );
}
```

### 2. Display Badge on Product Card

```tsx
// components/products/ProductCard.tsx
import { VerificationBadge } from '@/components/verification';

export function ProductCard({ product }) {
  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      
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

## Access Dashboards

### Seller
Navigate to: `/dashboard/verifications`

### Verifier
Navigate to: `/verifications`

### Admin
Navigate to: `/admin/verifications`

## File Locations

- **Components**: `/components/verification/`
- **Types**: `/lib/types/verification.ts`
- **API Client**: `/lib/api/verifications.ts`
- **Hooks**: `/hooks/use-verifications.ts`
- **Pages**: See folder structure in README

## Common Imports

```tsx
// Components
import {
  VerificationBadge,
  VerificationStatus,
  VerificationRequest,
  VerificationReport,
  VerificationCard,
  ReviewForm,
} from '@/components/verification';

// Hooks
import {
  useVerifications,
  useVerification,
  useMyVerifications,
  useRequestVerification,
  useClaimVerification,
  useSubmitReview,
} from '@/hooks/use-verifications';

// Types
import type {
  Verification,
  VerificationWithDetails,
  VerificationLevel,
  VerificationStatus,
} from '@/lib/types/verification';
```

## Required Backend APIs

Implement these 11 endpoints:
1. GET `/api/verifications`
2. GET `/api/verifications/:id`
3. POST `/api/verifications`
4. POST `/api/verifications/:id/claim`
5. POST `/api/verifications/:id/review`
6. POST `/api/verifications/:id/assign`
7. POST `/api/verifications/:id/cancel`
8. GET `/api/verifications/stats`
9. GET `/api/verifications/verifier-stats`
10. GET `/api/verifications/my-verifications`
11. GET `/api/verifications/assigned-to-me`

See `VERIFICATION_UI_README.md` for API specifications.

## Verification Levels

- **0**: Free (Automatic)
- **1**: $50 (Basic Review)
- **2**: $150 (Expert Review) - Coming Soon
- **3**: $500 (Security Audit) - Coming Soon

## Status Flow

```
PENDING → ASSIGNED → IN_PROGRESS → COMPLETED → APPROVED/REJECTED
```

## Testing

1. Request verification from product page
2. View status in seller dashboard
3. Claim as verifier
4. Submit review
5. View results

## Documentation

- **Full Docs**: `VERIFICATION_UI_README.md`
- **Summary**: `IMPLEMENTATION_SUMMARY.md`
- **This Guide**: `QUICK_START_VERIFICATION.md`
