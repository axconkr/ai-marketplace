# Review System - Code Examples

Complete code examples for integrating the review system into your AI Marketplace.

## Table of Contents
1. [Product Page Integration](#product-page-integration)
2. [Order Page Integration](#order-page-integration)
3. [Product Card with Ratings](#product-card-with-ratings)
4. [Seller Dashboard](#seller-dashboard)
5. [User Profile Reviews](#user-profile-reviews)
6. [Admin Moderation](#admin-moderation)

---

## Product Page Integration

Complete product page with reviews section.

```tsx
// app/products/[id]/page.tsx
'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { ReviewList } from '@/components/reviews/ReviewList';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ProductPage() {
  const params = useParams();
  const productId = params.id as string;

  // Fetch current user
  const { data: user } = useUser();

  // Fetch product details
  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const res = await fetch(`/api/products/${productId}`);
      return res.json();
    },
  });

  // Check if user can review
  const { data: reviewEligibility } = useQuery({
    queryKey: ['can-review', productId],
    queryFn: async () => {
      const res = await fetch(`/api/reviews/can-review?productId=${productId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return res.json();
    },
    enabled: !!user,
  });

  if (isLoading) return <div>Loading...</div>;

  const isProductSeller = product?.seller_id === user?.id;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Product Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div>
          {/* Product image */}
          <img
            src={product.image || '/placeholder.png'}
            alt={product.name}
            className="w-full rounded-lg"
          />
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

          {/* Rating Summary */}
          {product.rating_average && (
            <div className="flex items-center gap-3 mb-4">
              <StarRating
                value={Math.round(product.rating_average)}
                readonly
                size="default"
              />
              <span className="text-lg font-semibold">
                {product.rating_average.toFixed(1)}
              </span>
              <span className="text-muted-foreground">
                ({product.rating_count} reviews)
              </span>
            </div>
          )}

          <p className="text-muted-foreground mb-6">{product.description}</p>

          <div className="flex items-center gap-4 mb-6">
            <span className="text-3xl font-bold">
              {formatCurrency(product.price, product.currency)}
            </span>
          </div>

          <Button size="lg" className="w-full md:w-auto">
            Purchase Now
          </Button>
        </div>
      </div>

      {/* Tabs: Details, Reviews */}
      <Tabs defaultValue="details" className="mb-12">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="reviews">
            Reviews ({product.rating_count || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6">
          {/* Product details */}
          <div className="prose max-w-none">
            {product.longDescription}
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          {/* Review Button */}
          {reviewEligibility?.canReview && (
            <div className="mb-6">
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Write a Review</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <ReviewForm
                    orderId={reviewEligibility.orderId}
                    productId={productId}
                    productName={product.name}
                    onSuccess={() => {
                      // Close dialog and refresh
                      window.location.reload();
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>
          )}

          {/* Review List */}
          <ReviewList
            productId={productId}
            currentUserId={user?.id}
            isProductSeller={isProductSeller}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

## Order Page Integration

Order details page with review option.

```tsx
// app/orders/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

export default function OrderPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [showReviewForm, setShowReviewForm] = useState(false);

  const { data: order, isLoading, refetch } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const res = await fetch(`/api/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return res.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;

  const canReview = order.status === 'COMPLETED' && !order.review;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Order Details</h1>

      {/* Order Info */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Order #{order.id.slice(0, 8)}</CardTitle>
            <Badge>{order.status}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">{order.product.name}</h3>
              <p className="text-muted-foreground">{order.product.description}</p>
            </div>

            <div className="flex justify-between pt-4 border-t">
              <span>Total</span>
              <span className="font-bold">
                {formatCurrency(order.amount, order.currency)}
              </span>
            </div>

            <div className="text-sm text-muted-foreground">
              Ordered on {formatDate(order.createdAt)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Download Section */}
      {order.status === 'COMPLETED' && order.access_granted && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <Button asChild>
              <a href={order.download_url} download>
                Download Product
              </a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Review Section */}
      <Card>
        <CardHeader>
          <CardTitle>Product Review</CardTitle>
        </CardHeader>
        <CardContent>
          {order.review ? (
            // Show existing review
            <ReviewCard
              review={order.review}
              currentUserId={order.buyer_id}
              isProductSeller={false}
            />
          ) : canReview ? (
            // Show review form or button
            <>
              {!showReviewForm ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Share your experience with this product
                  </p>
                  <Button onClick={() => setShowReviewForm(true)}>
                    Write a Review
                  </Button>
                </div>
              ) : (
                <ReviewForm
                  orderId={order.id}
                  productId={order.product_id}
                  productName={order.product.name}
                  onSuccess={() => {
                    setShowReviewForm(false);
                    refetch();
                  }}
                  onCancel={() => setShowReviewForm(false)}
                />
              )}
            </>
          ) : (
            // Cannot review
            <div className="text-center py-8 text-muted-foreground">
              {order.status !== 'COMPLETED'
                ? 'You can review this product once the order is completed'
                : 'Thank you for your review!'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Product Card with Ratings

Product card component showing ratings.

```tsx
// components/products/ProductCard.tsx
import { StarRating } from '@/components/reviews/StarRating';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    rating_average?: number;
    rating_count?: number;
    verification_level: number;
    image?: string;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No image
            </div>
          )}
        </div>

        <CardContent className="p-4">
          {/* Verification Badge */}
          {product.verification_level > 0 && (
            <Badge variant="secondary" className="mb-2">
              Verified Level {product.verification_level}
            </Badge>
          )}

          {/* Product Name */}
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">
            {product.name}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {product.description}
          </p>

          {/* Rating */}
          {product.rating_average ? (
            <div className="flex items-center gap-2 mb-3">
              <StarRating
                value={Math.round(product.rating_average)}
                readonly
                size="small"
              />
              <span className="text-sm font-medium">
                {product.rating_average.toFixed(1)}
              </span>
              <span className="text-sm text-muted-foreground">
                ({product.rating_count})
              </span>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground mb-3">
              No reviews yet
            </div>
          )}

          {/* Price */}
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">
              {formatCurrency(product.price, product.currency)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
```

---

## Seller Dashboard

Seller dashboard showing all reviews.

```tsx
// app/dashboard/reviews/page.tsx
'use client';

import { useState } from 'react';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { StarRating } from '@/components/reviews/StarRating';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

export default function SellerReviewsPage() {
  const { data: user } = useUser();
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  // Fetch seller products
  const { data: products } = useQuery({
    queryKey: ['seller-products', user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/products?sellerId=${user?.id}`);
      return res.json();
    },
    enabled: !!user,
  });

  // Fetch all reviews for seller
  const { data: allReviews } = useQuery({
    queryKey: ['seller-reviews', user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/reviews/seller/${user?.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return res.json();
    },
    enabled: !!user,
  });

  // Calculate overall stats
  const stats = products?.reduce(
    (acc: any, product: any) => ({
      totalReviews: acc.totalReviews + (product.rating_count || 0),
      averageRating:
        acc.totalReviews > 0
          ? (acc.averageRating * acc.totalReviews +
              (product.rating_average || 0) * (product.rating_count || 0)) /
            (acc.totalReviews + (product.rating_count || 0))
          : product.rating_average || 0,
    }),
    { totalReviews: 0, averageRating: 0 }
  );

  // Filter reviews by product if selected
  const filteredReviews = selectedProduct
    ? allReviews?.filter((r: any) => r.product_id === selectedProduct)
    : allReviews;

  // Separate reviews by reply status
  const needsReply = filteredReviews?.filter((r: any) => !r.seller_reply) || [];
  const replied = filteredReviews?.filter((r: any) => r.seller_reply) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Product Reviews</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalReviews || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold">
                {stats?.averageRating?.toFixed(1) || '0.0'}
              </span>
              <StarRating
                value={Math.round(stats?.averageRating || 0)}
                readonly
                size="small"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Needs Reply</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold">{needsReply.length}</span>
              {needsReply.length > 0 && (
                <Badge variant="destructive">Action Required</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Filter by Product</label>
        <select
          className="w-full md:w-64 p-2 border rounded"
          value={selectedProduct || ''}
          onChange={(e) => setSelectedProduct(e.target.value || null)}
        >
          <option value="">All Products</option>
          {products?.map((product: any) => (
            <option key={product.id} value={product.id}>
              {product.name} ({product.rating_count || 0} reviews)
            </option>
          ))}
        </select>
      </div>

      {/* Review Tabs */}
      <Tabs defaultValue="needs-reply">
        <TabsList>
          <TabsTrigger value="needs-reply">
            Needs Reply ({needsReply.length})
          </TabsTrigger>
          <TabsTrigger value="replied">
            Replied ({replied.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All ({filteredReviews?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="needs-reply" className="mt-6">
          <div className="space-y-4">
            {needsReply.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                All reviews have been replied to!
              </div>
            ) : (
              needsReply.map((review: any) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  currentUserId={user?.id}
                  isProductSeller={true}
                  onReplyAdded={() => {
                    // Refresh reviews
                  }}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="replied" className="mt-6">
          <div className="space-y-4">
            {replied.map((review: any) => (
              <ReviewCard
                key={review.id}
                review={review}
                currentUserId={user?.id}
                isProductSeller={true}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          <div className="space-y-4">
            {filteredReviews?.map((review: any) => (
              <ReviewCard
                key={review.id}
                review={review}
                currentUserId={user?.id}
                isProductSeller={true}
                onReplyAdded={() => {
                  // Refresh reviews
                }}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

## User Profile Reviews

User's review history page.

```tsx
// app/profile/reviews/page.tsx
'use client';

import { ReviewCard } from '@/components/reviews/ReviewCard';
import { StarRating } from '@/components/reviews/StarRating';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

export default function UserReviewsPage() {
  const { data: user } = useUser();

  const { data: reviews, refetch } = useQuery({
    queryKey: ['user-reviews', user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/reviews/user/${user?.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return res.json();
    },
    enabled: !!user,
  });

  // Calculate stats
  const averageRating =
    reviews?.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews?.length || 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">My Reviews</h1>

      {/* Stats */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-muted-foreground mb-1">
                Total Reviews
              </div>
              <div className="text-3xl font-bold">{reviews?.length || 0}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">
                Average Rating
              </div>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold">
                  {averageRating.toFixed(1)}
                </span>
                <StarRating
                  value={Math.round(averageRating)}
                  readonly
                  size="small"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Review List */}
      <div className="space-y-6">
        {reviews?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              You haven't written any reviews yet
            </p>
            <Button asChild>
              <Link href="/orders">View Your Orders</Link>
            </Button>
          </div>
        ) : (
          reviews?.map((review: any) => (
            <div key={review.id}>
              {/* Product Info */}
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={review.product.image || '/placeholder.png'}
                  alt={review.product.name}
                  className="w-16 h-16 rounded object-cover"
                />
                <div>
                  <Link
                    href={`/products/${review.product_id}`}
                    className="font-semibold hover:underline"
                  >
                    {review.product.name}
                  </Link>
                  <div className="text-sm text-muted-foreground">
                    Purchased on {formatDate(review.order.createdAt)}
                  </div>
                </div>
              </div>

              {/* Review */}
              <ReviewCard
                review={review}
                currentUserId={user?.id}
                isProductSeller={false}
                onReplyAdded={refetch}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
```

---

## Admin Moderation

Admin dashboard for moderating flagged reviews.

```tsx
// app/admin/reviews/page.tsx
'use client';

import { useState } from 'react';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminReviewsPage() {
  const { data: user } = useUser();

  // Only admins can access
  if (user?.role !== 'admin') {
    return <div>Access denied</div>;
  }

  const { data: flaggedReviews, refetch } = useQuery({
    queryKey: ['flagged-reviews'],
    queryFn: async () => {
      const res = await fetch('/api/admin/reviews/flagged', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return res.json();
    },
  });

  const handleApprove = async (reviewId: string) => {
    try {
      await fetch(`/api/admin/reviews/${reviewId}/approve`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      refetch();
    } catch (error) {
      console.error('Error approving review:', error);
    }
  };

  const handleReject = async (reviewId: string) => {
    try {
      await fetch(`/api/admin/reviews/${reviewId}/reject`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      refetch();
    } catch (error) {
      console.error('Error rejecting review:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Review Moderation</h1>

      <Tabs defaultValue="flagged">
        <TabsList>
          <TabsTrigger value="flagged">
            Flagged Reviews ({flaggedReviews?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value="flagged" className="mt-6">
          <div className="space-y-6">
            {flaggedReviews?.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No flagged reviews
              </div>
            ) : (
              flaggedReviews?.map((review: any) => (
                <div key={review.id} className="border rounded-lg p-4">
                  {/* Flag Info */}
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="destructive">Flagged</Badge>
                      <span className="text-sm font-medium">
                        Reason: {review.flag_reason}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Flagged on {formatDate(review.updated_at)}
                    </p>
                  </div>

                  {/* Review */}
                  <ReviewCard review={review} currentUserId={user?.id} />

                  {/* Moderation Actions */}
                  <div className="flex gap-3 mt-4">
                    <Button
                      onClick={() => handleApprove(review.id)}
                      variant="outline"
                    >
                      Approve (Clear Flag)
                    </Button>
                    <Button
                      onClick={() => handleReject(review.id)}
                      variant="destructive"
                    >
                      Reject Review
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {/* Add Pending and Rejected tabs similarly */}
      </Tabs>
    </div>
  );
}
```

---

## Summary

These examples show complete integration scenarios for:

1. **Product pages** with review sections
2. **Order pages** with review creation
3. **Product cards** with rating display
4. **Seller dashboards** for managing reviews
5. **User profiles** showing review history
6. **Admin panels** for moderation

All examples use the components and hooks from the review system implementation.
