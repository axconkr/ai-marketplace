# Review and Rating System Documentation

Complete implementation of the review and rating system for AI Marketplace products.

## Table of Contents
1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [API Endpoints](#api-endpoints)
4. [Components](#components)
5. [React Query Hooks](#react-query-hooks)
6. [Features](#features)
7. [Usage Examples](#usage-examples)

## Overview

The review system allows verified purchasers to leave ratings, comments, and images for products. Features include:

- ⭐ 1-5 star ratings with distribution
- 📝 Text reviews with optional title
- 🖼️ Image uploads (up to 5 images)
- ✅ Verified purchase badges
- 💬 Seller replies
- 👍 Helpful voting system
- 🚩 Review reporting/flagging
- 📊 Automatic rating aggregation

## Database Schema

### Review Model

```prisma
model Review {
  id          String   @id @default(cuid())
  order_id    String   @unique // One review per order
  product_id  String
  user_id     String   // Reviewer (buyer)

  // Review content
  rating      Int      // 1-5 stars
  title       String?
  comment     String

  // Media
  images      String[] // Image URLs

  // Verification
  verified_purchase Boolean @default(true)

  // Seller response
  seller_reply      String?
  seller_replied_at DateTime?

  // Moderation
  status      ReviewStatus @default(PUBLISHED)
  flagged     Boolean @default(false)
  flag_reason String?

  // Helpful votes
  helpful_count     Int @default(0)
  not_helpful_count Int @default(0)

  // Timestamps
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt

  // Relations
  order       Order    @relation(fields: [order_id], references: [id], onDelete: Cascade)
  product     Product  @relation(fields: [product_id], references: [id], onDelete: Cascade)
  user        User     @relation(fields: [user_id], references: [id], onDelete: Cascade)
  votes       ReviewVote[]

  @@index([product_id])
  @@index([user_id])
  @@index([rating])
  @@index([created_at])
  @@index([status])
}
```

### ReviewVote Model

```prisma
model ReviewVote {
  id         String   @id @default(cuid())
  review_id  String
  user_id    String
  helpful    Boolean  // true = helpful, false = not helpful
  created_at DateTime @default(now())

  review     Review   @relation(fields: [review_id], references: [id], onDelete: Cascade)
  user       User     @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@unique([review_id, user_id])
  @@index([review_id])
}
```

### Product Rating Fields

```prisma
model Product {
  // ... existing fields

  // Review fields
  rating_average       Float? // Average rating (1-5)
  rating_count         Int    @default(0) // Total reviews
  rating_distribution  Json?  // {"5": 10, "4": 5, "3": 2, "2": 0, "1": 0}

  reviews         Review[]
}
```

### Review Status Enum

```prisma
enum ReviewStatus {
  PENDING    // Under moderation
  PUBLISHED  // Visible
  REJECTED   // Rejected by moderation
  DELETED    // Deleted by user/admin
}
```

## API Endpoints

### POST /api/reviews
Create a new review for a completed order.

**Request:**
```json
{
  "orderId": "order_123",
  "rating": 5,
  "title": "Amazing product!",
  "comment": "This AI model exceeded my expectations...",
  "images": ["https://example.com/image1.jpg"]
}
```

**Response:**
```json
{
  "id": "review_123",
  "order_id": "order_123",
  "product_id": "product_123",
  "user_id": "user_123",
  "rating": 5,
  "title": "Amazing product!",
  "comment": "This AI model exceeded my expectations...",
  "images": ["https://example.com/image1.jpg"],
  "verified_purchase": true,
  "status": "PUBLISHED",
  "created_at": "2025-01-01T00:00:00Z"
}
```

**Validation:**
- User must be the buyer of the order
- Order must have status `COMPLETED`
- Rating must be 1-5
- Comment must be at least 10 characters
- Cannot review the same order twice

### GET /api/reviews?productId=xxx&sortBy=recent&filterRating=5&page=1
Get reviews for a product with filtering and sorting.

**Query Parameters:**
- `productId` (required): Product ID
- `sortBy` (optional): `recent` | `helpful` | `rating` (default: `recent`)
- `filterRating` (optional): Filter by rating (1-5)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 10)

**Response:**
```json
{
  "reviews": [...],
  "total": 42,
  "page": 1,
  "totalPages": 5
}
```

### GET /api/reviews/[id]
Get a single review by ID.

**Response:**
```json
{
  "id": "review_123",
  "rating": 5,
  "title": "Amazing product!",
  "comment": "...",
  "user": {
    "id": "user_123",
    "name": "John Doe",
    "avatar": "https://..."
  },
  "product": {
    "id": "product_123",
    "name": "AI Model",
    "seller_id": "seller_123"
  }
}
```

### PUT /api/reviews/[id]
Update a review (owner only).

**Request:**
```json
{
  "rating": 4,
  "title": "Updated title",
  "comment": "Updated comment",
  "images": []
}
```

### DELETE /api/reviews/[id]
Delete a review (owner or admin).

**Response:**
```json
{
  "id": "review_123",
  "status": "DELETED"
}
```

### POST /api/reviews/[id]/reply
Add seller reply to a review.

**Request:**
```json
{
  "reply": "Thank you for your feedback! We're glad you enjoyed the product."
}
```

**Response:**
```json
{
  "id": "review_123",
  "seller_reply": "Thank you for your feedback!...",
  "seller_replied_at": "2025-01-01T00:00:00Z"
}
```

**Validation:**
- User must be the product seller
- Reply must be at least 5 characters

### POST /api/reviews/[id]/vote
Vote on review helpfulness.

**Request:**
```json
{
  "helpful": true
}
```

**Response:**
```json
{
  "id": "vote_123",
  "review_id": "review_123",
  "user_id": "user_123",
  "helpful": true
}
```

**Notes:**
- One vote per user per review (can be updated)
- Cannot vote on own review
- Updates `helpful_count` or `not_helpful_count`

### POST /api/reviews/[id]/report
Report a review as inappropriate.

**Request:**
```json
{
  "reason": "Spam or inappropriate content"
}
```

**Response:**
```json
{
  "id": "review_123",
  "flagged": true,
  "status": "PENDING"
}
```

## Components

### StarRating

Interactive star rating component.

```tsx
import { StarRating } from '@/components/reviews/StarRating';

// Read-only display
<StarRating value={4} readonly size="small" />

// Interactive rating
<StarRating
  value={rating}
  onChange={setRating}
  size="large"
/>
```

**Props:**
- `value: number` - Current rating (1-5)
- `onChange?: (value: number) => void` - Callback when rating changes
- `readonly?: boolean` - Disable interaction
- `size?: 'small' | 'default' | 'large'` - Star size

### ReviewForm

Form for creating/editing reviews.

```tsx
import { ReviewForm } from '@/components/reviews/ReviewForm';

<ReviewForm
  orderId="order_123"
  productId="product_123"
  productName="AI Model"
  onSuccess={() => router.push('/orders')}
  onCancel={() => setShowForm(false)}
/>
```

**Props:**
- `orderId: string` - Order ID
- `productId: string` - Product ID
- `productName: string` - Product name for display
- `onSuccess?: () => void` - Called after successful submission
- `onCancel?: () => void` - Called when cancel is clicked

### ReviewCard

Display a single review with voting and reply features.

```tsx
import { ReviewCard } from '@/components/reviews/ReviewCard';

<ReviewCard
  review={review}
  currentUserId={userId}
  isProductSeller={isSeller}
  onReplyAdded={() => refetch()}
/>
```

**Props:**
- `review: Review` - Review data
- `currentUserId?: string` - Current logged-in user ID
- `isProductSeller?: boolean` - Whether current user is the product seller
- `onReplyAdded?: () => void` - Called after reply is added

### RatingSummary

Display rating distribution and average.

```tsx
import { RatingSummary } from '@/components/reviews/RatingSummary';

<RatingSummary
  ratingAverage={4.5}
  ratingCount={42}
  ratingDistribution={{ 5: 20, 4: 15, 3: 5, 2: 2, 1: 0 }}
/>
```

**Props:**
- `ratingAverage: number` - Average rating
- `ratingCount: number` - Total number of reviews
- `ratingDistribution: Record<number, number>` - Count per rating

### ReviewList

Complete review list with filtering, sorting, and pagination.

```tsx
import { ReviewList } from '@/components/reviews/ReviewList';

<ReviewList
  productId="product_123"
  currentUserId={userId}
  isProductSeller={isSeller}
/>
```

**Props:**
- `productId: string` - Product ID
- `currentUserId?: string` - Current logged-in user ID
- `isProductSeller?: boolean` - Whether current user is the product seller

## React Query Hooks

### useReviews

Fetch reviews for a product.

```tsx
import { useReviews } from '@/hooks/use-reviews';

const { data, isLoading } = useReviews(
  productId,
  'recent', // sortBy
  5, // filterRating (optional)
  1  // page
);
```

### useReview

Fetch a single review.

```tsx
import { useReview } from '@/hooks/use-reviews';

const { data: review, isLoading } = useReview(reviewId);
```

### useCreateReview

Create a new review.

```tsx
import { useCreateReview } from '@/hooks/use-reviews';

const createReview = useCreateReview();

await createReview.mutateAsync({
  orderId: 'order_123',
  rating: 5,
  title: 'Great!',
  comment: 'This product is amazing...',
  images: []
});
```

### useUpdateReview

Update a review.

```tsx
import { useUpdateReview } from '@/hooks/use-reviews';

const updateReview = useUpdateReview();

await updateReview.mutateAsync({
  reviewId: 'review_123',
  rating: 4,
  comment: 'Updated comment'
});
```

### useDeleteReview

Delete a review.

```tsx
import { useDeleteReview } from '@/hooks/use-reviews';

const deleteReview = useDeleteReview();

await deleteReview.mutateAsync('review_123');
```

### useVoteReview

Vote on review helpfulness.

```tsx
import { useVoteReview } from '@/hooks/use-reviews';

const voteReview = useVoteReview();

await voteReview.mutateAsync({
  reviewId: 'review_123',
  helpful: true
});
```

### useAddSellerReply

Add seller reply to review.

```tsx
import { useAddSellerReply } from '@/hooks/use-reviews';

const addReply = useAddSellerReply();

await addReply.mutateAsync({
  reviewId: 'review_123',
  reply: 'Thank you for your feedback!'
});
```

### useFlagReview

Report a review.

```tsx
import { useFlagReview } from '@/hooks/use-reviews';

const flagReview = useFlagReview();

await flagReview.mutateAsync({
  reviewId: 'review_123',
  reason: 'Spam or inappropriate content'
});
```

## Features

### 1. Verified Purchase Badge

Only buyers who completed an order can review products. All reviews automatically get a "Verified Purchase" badge.

### 2. Automatic Rating Calculation

When a review is created, updated, or deleted, the product's rating statistics are automatically recalculated:

```typescript
// lib/services/review.ts
export async function updateProductRating(productId: string) {
  const reviews = await prisma.review.findMany({
    where: { product_id: productId, status: 'PUBLISHED' },
    select: { rating: true }
  });

  // Calculate average
  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  // Calculate distribution
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach(r => distribution[r.rating]++);

  await prisma.product.update({
    where: { id: productId },
    data: {
      rating_average: average,
      rating_count: reviews.length,
      rating_distribution: distribution
    }
  });
}
```

### 3. Seller Replies

Sellers can respond to reviews on their products. Reviewers receive notifications when sellers reply.

### 4. Helpful Voting

Users can vote reviews as helpful or not helpful. One vote per user per review (can be changed).

### 5. Review Moderation

Reviews can be flagged for moderation. Flagged reviews are moved to `PENDING` status for admin review.

### 6. Notifications

The system creates notifications for:
- Seller: New review received
- Reviewer: Seller replied to review

## Usage Examples

### Example 1: Display Reviews on Product Page

```tsx
// app/products/[id]/page.tsx
import { ReviewList } from '@/components/reviews/ReviewList';

export default function ProductPage({ params }: { params: { id: string } }) {
  const { data: user } = useUser();
  const { data: product } = useProduct(params.id);

  return (
    <div>
      {/* Product details */}

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
        <ReviewList
          productId={params.id}
          currentUserId={user?.id}
          isProductSeller={product?.seller_id === user?.id}
        />
      </div>
    </div>
  );
}
```

### Example 2: Allow Review After Purchase

```tsx
// app/orders/[id]/page.tsx
import { ReviewForm } from '@/components/reviews/ReviewForm';

export default function OrderPage({ params }: { params: { id: string } }) {
  const { data: order } = useOrder(params.id);
  const [showReviewForm, setShowReviewForm] = useState(false);

  if (order?.status === 'COMPLETED' && !order.review) {
    return (
      <div>
        <Button onClick={() => setShowReviewForm(true)}>
          Leave a Review
        </Button>

        {showReviewForm && (
          <ReviewForm
            orderId={order.id}
            productId={order.product_id}
            productName={order.product.name}
            onSuccess={() => {
              setShowReviewForm(false);
              // Refresh order data
            }}
            onCancel={() => setShowReviewForm(false)}
          />
        )}
      </div>
    );
  }

  return null;
}
```

### Example 3: Display Rating Summary

```tsx
// components/products/ProductCard.tsx
import { StarRating } from '@/components/reviews/StarRating';

export function ProductCard({ product }: { product: Product }) {
  return (
    <Card>
      <CardContent>
        <h3>{product.name}</h3>

        {product.rating_average && (
          <div className="flex items-center gap-2">
            <StarRating
              value={Math.round(product.rating_average)}
              readonly
              size="small"
            />
            <span className="text-sm text-muted-foreground">
              {product.rating_average.toFixed(1)} ({product.rating_count} reviews)
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

### Example 4: Seller Dashboard - Manage Reviews

```tsx
// app/dashboard/reviews/page.tsx
import { useReviews } from '@/hooks/use-reviews';
import { ReviewCard } from '@/components/reviews/ReviewCard';

export default function SellerReviewsPage() {
  const { data: user } = useUser();
  const { data: products } = useSellerProducts(user?.id);

  return (
    <div>
      <h1>Product Reviews</h1>

      {products?.map(product => (
        <div key={product.id}>
          <h2>{product.name}</h2>
          <ReviewList
            productId={product.id}
            currentUserId={user?.id}
            isProductSeller={true}
          />
        </div>
      ))}
    </div>
  );
}
```

## Migration

To add this system to an existing database:

```bash
# 1. Update schema
npx prisma db push

# 2. Generate Prisma Client
npx prisma generate

# 3. (Optional) Seed sample reviews
npx prisma db seed
```

## Testing

Test the review system:

1. **Create a review**: Complete an order, then submit a review
2. **View reviews**: Check product page shows reviews correctly
3. **Vote on reviews**: Test helpful/not helpful voting
4. **Seller reply**: As seller, reply to a review
5. **Update review**: Edit your own review
6. **Delete review**: Delete your own review
7. **Filter/sort**: Test different sorting and filtering options
8. **Pagination**: Navigate through multiple pages of reviews

## Security Considerations

1. **Authentication**: All write operations require authentication
2. **Authorization**: Users can only modify their own reviews (except admins)
3. **Validation**: Server-side validation for all inputs
4. **Rate Limiting**: Consider implementing rate limiting on review creation
5. **Moderation**: Flagged reviews go through moderation queue
6. **Verified Purchases**: Only completed orders can be reviewed

## Performance Optimization

1. **Indexing**: Database indexes on common query fields
2. **Pagination**: Default 10 reviews per page
3. **Caching**: Consider caching rating summaries
4. **Lazy Loading**: Load images on demand
5. **Query Optimization**: Use select to fetch only needed fields

## Future Enhancements

- [ ] Image upload to S3/CloudFlare
- [ ] Review edit history
- [ ] Review reactions (beyond helpful/not helpful)
- [ ] Review tags/categories
- [ ] AI-powered review summarization
- [ ] Review quality scoring
- [ ] Bulk review management for admins
- [ ] Review analytics dashboard
- [ ] Email notifications
- [ ] Review reminders (X days after purchase)
