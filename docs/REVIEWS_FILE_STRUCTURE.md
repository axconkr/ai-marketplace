# Review System - File Structure

Complete file listing for the AI Marketplace review and rating system implementation.

## Database Schema

### `/prisma/schema.prisma`
**Modified**: Added Review, ReviewVote models and updated Product, User, Order models

**Key Changes:**
- Added `Review` model with rating, comments, images, seller replies, moderation
- Added `ReviewVote` model for helpful voting
- Added `ReviewStatus` enum (PENDING, PUBLISHED, REJECTED, DELETED)
- Updated `Product` model with `rating_average`, `rating_count`, `rating_distribution`
- Updated `User` model with `reviews` and `reviewVotes` relations
- Updated `Order` model with `review` relation
- Added `REVIEW_RECEIVED` to `NotificationType` enum

## Backend Services

### `/lib/services/review.ts`
**Created**: Core review service with all business logic

**Functions:**
- `createReview()` - Create review with validation
- `updateProductRating()` - Calculate and update product ratings
- `getProductReviews()` - Fetch reviews with filtering/sorting
- `getReview()` - Get single review by ID
- `updateReview()` - Update review (owner only)
- `deleteReview()` - Soft delete review
- `addSellerReply()` - Add seller response to review
- `voteReview()` - Vote helpful/not helpful
- `flagReview()` - Report inappropriate review
- `getUserReviewForProduct()` - Check if user reviewed product
- `canUserReview()` - Verify user can review (completed order)
- `getProductRatingSummary()` - Get rating statistics

## API Routes

### `/app/api/reviews/route.ts`
**Created**: Main review endpoints

**Endpoints:**
- `POST /api/reviews` - Create new review
- `GET /api/reviews?productId=xxx&sortBy=recent&filterRating=5&page=1` - List reviews

### `/app/api/reviews/[id]/route.ts`
**Created**: Single review operations

**Endpoints:**
- `GET /api/reviews/[id]` - Get review details
- `PUT /api/reviews/[id]` - Update review
- `DELETE /api/reviews/[id]` - Delete review

### `/app/api/reviews/[id]/reply/route.ts`
**Created**: Seller reply endpoint

**Endpoints:**
- `POST /api/reviews/[id]/reply` - Add seller reply

### `/app/api/reviews/[id]/vote/route.ts`
**Created**: Vote endpoint

**Endpoints:**
- `POST /api/reviews/[id]/vote` - Vote helpful/not helpful

### `/app/api/reviews/[id]/report/route.ts`
**Created**: Report endpoint

**Endpoints:**
- `POST /api/reviews/[id]/report` - Flag review as inappropriate

## React Components

### `/components/ui/avatar.tsx`
**Created**: Avatar component for user display

**Components:**
- `Avatar` - Container
- `AvatarImage` - Image display
- `AvatarFallback` - Fallback initials

### `/components/reviews/StarRating.tsx`
**Created**: Interactive star rating component

**Props:**
- `value: number` - Current rating (1-5)
- `onChange?: (value: number) => void` - Change handler
- `readonly?: boolean` - Disable interaction
- `size?: 'small' | 'default' | 'large'` - Star size

**Features:**
- Interactive hover states
- Read-only mode for display
- Three size variants
- Yellow filled stars

### `/components/reviews/ReviewForm.tsx`
**Created**: Review creation/edit form

**Props:**
- `orderId: string`
- `productId: string`
- `productName: string`
- `onSuccess?: () => void`
- `onCancel?: () => void`

**Features:**
- Star rating selector
- Optional title field
- Comment textarea with character count
- Image upload support (placeholder)
- Validation feedback
- Loading states

### `/components/reviews/ReviewCard.tsx`
**Created**: Single review display with interactions

**Props:**
- `review: Review`
- `currentUserId?: string`
- `isProductSeller?: boolean`
- `onReplyAdded?: () => void`

**Features:**
- User avatar and name
- Star rating display
- Verified purchase badge
- Review title and comment
- Image gallery
- Seller reply section
- Reply form (for sellers)
- Helpful/not helpful voting
- Report button
- Relative timestamps

### `/components/reviews/RatingSummary.tsx`
**Created**: Rating distribution and average

**Props:**
- `ratingAverage: number`
- `ratingCount: number`
- `ratingDistribution: Record<number, number>`

**Features:**
- Large average rating display
- Star rating visualization
- Review count
- Distribution bars for each rating (5-1 stars)
- Percentage calculations
- Empty state handling

### `/components/reviews/ReviewList.tsx`
**Created**: Complete review list with filtering

**Props:**
- `productId: string`
- `currentUserId?: string`
- `isProductSeller?: boolean`

**Features:**
- Rating summary integration
- Sort options (recent, helpful, rating)
- Filter by rating (1-5 stars)
- Pagination
- Loading skeletons
- Empty states
- Auto-refresh on actions

## React Query Hooks

### `/hooks/use-reviews.ts`
**Created**: All review-related React Query hooks

**Hooks:**
- `useReviews()` - Query reviews with filters
- `useReview()` - Query single review
- `useCreateReview()` - Mutation to create review
- `useUpdateReview()` - Mutation to update review
- `useDeleteReview()` - Mutation to delete review
- `useVoteReview()` - Mutation to vote on review
- `useAddSellerReply()` - Mutation to add seller reply
- `useFlagReview()` - Mutation to report review

**Features:**
- Automatic cache invalidation
- Toast notifications
- Error handling
- Type safety
- Loading states

## Documentation

### `/docs/REVIEWS_SYSTEM.md`
**Created**: Comprehensive system documentation

**Sections:**
- Overview and features
- Database schema details
- API endpoint reference
- Component documentation
- React Query hooks
- Usage examples
- Migration guide
- Testing instructions
- Security considerations
- Performance optimization
- Future enhancements

### `/docs/REVIEWS_QUICKSTART.md`
**Created**: Quick start and setup guide

**Sections:**
- Database migration steps
- Installation verification
- Integration examples
- Test commands
- Common customizations
- Troubleshooting
- Performance tips
- Security checklist
- Production deployment
- Next steps

### `/docs/REVIEWS_FILE_STRUCTURE.md`
**Created**: This file - complete file listing

## File Count Summary

```
Database Schema:     1 file modified
Backend Services:    1 file created
API Routes:          5 files created
UI Components:       1 file created (avatar)
Review Components:   5 files created
React Query Hooks:   1 file created
Documentation:       3 files created

Total:              17 files
```

## Directory Tree

```
AI_marketplace/
├── prisma/
│   └── schema.prisma                         (MODIFIED)
├── lib/
│   └── services/
│       └── review.ts                         (NEW)
├── app/
│   └── api/
│       └── reviews/
│           ├── route.ts                      (NEW)
│           └── [id]/
│               ├── route.ts                  (NEW)
│               ├── reply/
│               │   └── route.ts              (NEW)
│               ├── vote/
│               │   └── route.ts              (NEW)
│               └── report/
│                   └── route.ts              (NEW)
├── components/
│   ├── ui/
│   │   └── avatar.tsx                        (NEW)
│   └── reviews/
│       ├── StarRating.tsx                    (NEW)
│       ├── ReviewForm.tsx                    (NEW)
│       ├── ReviewCard.tsx                    (NEW)
│       ├── RatingSummary.tsx                 (NEW)
│       └── ReviewList.tsx                    (NEW)
├── hooks/
│   └── use-reviews.ts                        (NEW)
└── docs/
    ├── REVIEWS_SYSTEM.md                     (NEW)
    ├── REVIEWS_QUICKSTART.md                 (NEW)
    └── REVIEWS_FILE_STRUCTURE.md             (NEW)
```

## Dependencies Used

**Existing:**
- `@prisma/client` - Database ORM
- `next` - Framework
- `react` - UI library
- `@tanstack/react-query` - Data fetching
- `lucide-react` - Icons
- `tailwindcss` - Styling

**UI Components (shadcn/ui):**
- `Avatar`, `AvatarImage`, `AvatarFallback`
- `Button`
- `Card`, `CardContent`
- `Input`
- `Label`
- `Textarea`
- `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue`
- `Badge`
- `Skeleton`
- `Progress`
- `Dialog` (for modal forms)

**Utilities:**
- `cn()` - Class name utility
- `formatRelativeTime()` - Time formatting
- `useToast()` - Toast notifications

## Key Features Implemented

✅ **Core Features:**
- Star rating system (1-5)
- Text reviews with optional title
- Image upload support (structure ready)
- Verified purchase badges
- One review per order constraint

✅ **Seller Features:**
- Seller replies to reviews
- Notification on new reviews
- Dashboard integration ready

✅ **User Features:**
- Helpful voting (thumbs up/down)
- Review flagging/reporting
- Edit own reviews
- Delete own reviews

✅ **Display Features:**
- Rating distribution visualization
- Sort by recent/helpful/rating
- Filter by star rating
- Pagination
- Loading states
- Empty states

✅ **Backend:**
- Automatic rating calculation
- Vote count management
- Notification system integration
- Status-based moderation
- Soft deletes

✅ **Security:**
- Authentication required
- Authorization checks
- Input validation
- SQL injection protection
- XSS protection

## Testing Checklist

- [ ] Database migration successful
- [ ] Can create review for completed order
- [ ] Cannot review same order twice
- [ ] Rating calculation updates correctly
- [ ] Can sort and filter reviews
- [ ] Pagination works correctly
- [ ] Can vote on reviews
- [ ] Seller can reply to reviews
- [ ] Can flag inappropriate reviews
- [ ] Notifications sent correctly
- [ ] Loading states display properly
- [ ] Error handling works
- [ ] Mobile responsive

## Integration Points

**Required Integrations:**
- User authentication system
- Order completion workflow
- Notification system
- Product display pages
- Order history pages

**Optional Integrations:**
- Image upload service (S3, Cloudflare)
- Email service (SendGrid, AWS SES)
- Moderation queue dashboard
- Analytics tracking
- Spam detection

## Next Steps After Implementation

1. Run database migration
2. Test API endpoints
3. Integrate components into pages
4. Test user flows
5. Add image upload service
6. Configure notifications
7. Set up moderation queue
8. Deploy to production

## Support

For issues or questions:
- See full documentation in `docs/REVIEWS_SYSTEM.md`
- Check quick start guide in `docs/REVIEWS_QUICKSTART.md`
- Review component source code
- Test with provided examples
