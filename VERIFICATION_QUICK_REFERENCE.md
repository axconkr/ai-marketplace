# Verification System - Quick Reference Guide

## Component Usage

### 1. Display Verification List
```tsx
import { VerificationList } from '@/components/verification';

<VerificationList verifications={verifications} />
```
Features: Search, filter by status/level, sort, click to view details

### 2. Show Expert Progress (Level 3)
```tsx
import { ExpertProgressBar } from '@/components/verification';

<ExpertProgressBar expertReviews={verification.expertReviews} />
```
Shows: 4 expert slots, progress bar, individual scores, average

### 3. Display Individual Expert Review
```tsx
import { ExpertReviewCard } from '@/components/verification';

<ExpertReviewCard review={expertReview} showDetails={true} />
```
Shows: Score, status, feedback, strengths, weaknesses, recommendations

### 4. Show Verification Timeline
```tsx
import { VerificationTimeline } from '@/components/verification';

<VerificationTimeline verification={verification} />
```
Shows: 4-step timeline with dates and progress

### 5. Request New Verification
```tsx
import { RequestVerificationModal } from '@/components/verification';

const [open, setOpen] = useState(false);
const [product, setProduct] = useState(null);

<RequestVerificationModal
  product={product}
  open={open}
  onClose={() => setOpen(false)}
  onSuccess={() => refetch()}
/>
```

### 6. View Verification Details
```tsx
import { VerificationDetailModal } from '@/components/verification';

const [selectedVerification, setSelectedVerification] = useState(null);

<VerificationDetailModal
  verification={selectedVerification}
  open={!!selectedVerification}
  onClose={() => setSelectedVerification(null)}
/>
```

## Expert Types

```typescript
import { EXPERT_TYPES } from '@/lib/types/verification-expert';

const experts = {
  DESIGN: '🎨 디자인 전문가 - UI/UX 평가',
  PLANNING: '📋 기획 전문가 - 제품 기획 평가',
  DEVELOPMENT: '💻 개발 전문가 - 코드 품질 평가',
  DOMAIN: '🎯 도메인 전문가 - 산업 전문성 평가'
};
```

## Verification Levels

```typescript
import { VERIFICATION_LEVEL_INFO } from '@/lib/types/verification-expert';

const levels = {
  0: { name: '자동 검증', fee: 0, color: 'bg-gray-500' },
  1: { name: '기본 검수', fee: 5000, color: 'bg-blue-500' },
  2: { name: '심화 검수', fee: 15000, color: 'bg-purple-500' },
  3: { name: '프리미엄 감사', fee: 50000, color: 'bg-yellow-500' }
};
```

## Status Badges

```typescript
const statusColors = {
  PENDING: 'yellow',      // 대기중
  ASSIGNED: 'blue',       // 배정됨
  IN_PROGRESS: 'blue',    // 진행중
  COMPLETED: 'green',     // 완료
  APPROVED: 'green',      // 승인됨
  REJECTED: 'red'         // 거절됨
};
```

## API Integration

### Fetch Verifications
```typescript
import { useMyVerifications } from '@/hooks/use-verifications';

const { data, isLoading, error } = useMyVerifications();
```

### Request Verification
```typescript
import { useRequestVerification } from '@/hooks/use-verifications';

const mutation = useRequestVerification();

await mutation.mutateAsync({
  productId: 'xxx',
  level: 3
});
```

## Data Structures

### VerificationWithExperts
```typescript
interface VerificationWithExperts {
  id: string;
  level: 0 | 1 | 2 | 3;
  status: VerificationStatus;
  fee: number; // in cents
  score: number | null;
  product: {
    id: string;
    name: string;
    thumbnail_url: string | null;
  };
  expertReviews?: ExpertReview[]; // Level 3 only
}
```

### ExpertReview
```typescript
interface ExpertReview {
  id: string;
  expert_type: 'DESIGN' | 'PLANNING' | 'DEVELOPMENT' | 'DOMAIN';
  status: ExpertReviewStatus;
  score: number | null;
  feedback: string | null;
  report: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    detailedFeedback: string;
  } | null;
}
```

## Common Patterns

### Calculate Expert Progress
```typescript
const completedCount = expertReviews.filter(r => r.status === 'COMPLETED').length;
const percentage = (completedCount / 4) * 100;
```

### Calculate Average Score
```typescript
const avgScore = expertReviews
  .filter(r => r.score !== null)
  .reduce((sum, r) => sum + r.score!, 0) / completedCount;
```

### Filter Verifications
```typescript
const level3 = verifications.filter(v => v.level === 3);
const inProgress = verifications.filter(v => 
  v.status === 'ASSIGNED' || v.status === 'IN_PROGRESS'
);
```

## Styling

### Expert Colors
```css
Design:      pink-600, bg-pink-50
Planning:    blue-600, bg-blue-50
Development: green-600, bg-green-50
Domain:      purple-600, bg-purple-50
```

### Level Colors
```css
Level 0: bg-gray-500, text-gray-700, bg-gray-50
Level 1: bg-blue-500, text-blue-700, bg-blue-50
Level 2: bg-purple-500, text-purple-700, bg-purple-50
Level 3: bg-yellow-500, text-yellow-700, bg-yellow-50
```

## Responsive Breakpoints

```css
Mobile:  < 640px  (1 column)
Tablet:  640-1024px (2 columns)
Desktop: > 1024px (3-4 columns)
Expert Grid: Always 2 columns
```

## File Locations

```
components/verification/
├── ExpertProgressBar.tsx        # Level 3 progress display
├── ExpertReviewCard.tsx         # Individual expert review
├── VerificationTimeline.tsx     # Timeline visualization
├── VerificationDetailModal.tsx  # Full detail view
├── RequestVerificationModal.tsx # Request new verification
├── VerificationList.tsx         # Filterable list
└── VerificationListCard.tsx     # List item card

lib/types/
└── verification-expert.ts       # TypeScript types

app/(marketplace)/dashboard/verifications/
└── page.tsx                     # Main verifications page
```

## Testing Commands

```bash
# Type check
npx tsc --noEmit

# Run development server
npm run dev

# Access page
http://localhost:3000/dashboard/verifications
```

## Common Issues

### Issue: Expert reviews not showing
**Solution**: Ensure `expertReviews` is included in API response for Level 3 verifications

### Issue: Progress bar not updating
**Solution**: Check that expert status is being updated correctly in database

### Issue: Modal not opening
**Solution**: Verify state management and check console for errors

### Issue: Filters not working
**Solution**: Ensure verification data structure matches expected types

## Support

See detailed documentation:
- `/VERIFICATION_LEVEL3_IMPLEMENTATION.md` - Full technical docs
- `/VERIFICATION_IMPLEMENTATION_SUMMARY.md` - Executive summary
