'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StarRating } from './StarRating';
import { ReplyForm } from './ReplyForm';
import {
  MessageSquare,
  ThumbsUp,
  Flag,
  Edit2,
  Trash2,
  CheckCircle,
  ExternalLink,
  Image as ImageIcon,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Review {
  id: string;
  rating: number;
  title?: string;
  comment: string;
  images: string[];
  verified_purchase: boolean;
  seller_reply?: string;
  seller_replied_at?: string;
  helpful_count: number;
  not_helpful_count: number;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  product: {
    id: string;
    name: string;
  };
}

interface SellerReviewCardProps {
  review: Review;
  onReply: (reviewId: string, reply: string) => Promise<void>;
  onEditReply: (reviewId: string, reply: string) => Promise<void>;
  onDeleteReply: (reviewId: string) => Promise<void>;
  onReport: (reviewId: string) => void;
}

export function SellerReviewCard({
  review,
  onReply,
  onEditReply,
  onDeleteReply,
  onReport,
}: SellerReviewCardProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isEditingReply, setIsEditingReply] = useState(false);
  const [showFullImages, setShowFullImages] = useState(false);

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600 bg-green-50';
    if (rating >= 3.5) return 'text-yellow-600 bg-yellow-50';
    if (rating >= 2.5) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const handleReplySubmit = async (reply: string) => {
    if (isEditingReply) {
      await onEditReply(review.id, reply);
      setIsEditingReply(false);
    } else {
      await onReply(review.id, reply);
    }
    setShowReplyForm(false);
  };

  const handleDeleteReply = async () => {
    if (confirm('답변을 삭제하시겠습니까?')) {
      await onDeleteReply(review.id);
    }
  };

  return (
    <Card className={cn(!review.seller_reply && 'border-l-4 border-l-orange-400')}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              {/* Avatar */}
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium flex-shrink-0">
                {review.user.avatar ? (
                  <img
                    src={review.user.avatar}
                    alt={review.user.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  review.user.name?.[0]?.toUpperCase() || 'U'
                )}
              </div>

              {/* User Info and Rating */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-gray-900">{review.user.name}</span>
                  {review.verified_purchase && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      <CheckCircle className="h-3 w-3" />
                      구매 인증
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <StarRating value={review.rating} readonly size="small" />
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded text-xs font-bold',
                      getRatingColor(review.rating)
                    )}
                  >
                    {review.rating.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReport(review.id)}
                className="text-gray-400 hover:text-red-500"
              >
                <Flag className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Product Name */}
          <Link
            href={`/products/${review.product.id}`}
            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
          >
            <span>{review.product.name}</span>
            <ExternalLink className="h-3 w-3" />
          </Link>

          {/* Review Content */}
          <div className="space-y-2">
            {review.title && (
              <h4 className="font-semibold text-gray-900">{review.title}</h4>
            )}
            <p className="text-gray-700 whitespace-pre-wrap">{review.comment}</p>
          </div>

          {/* Review Images */}
          {review.images && review.images.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <ImageIcon className="h-4 w-4" />
                <span>첨부 이미지 ({review.images.length}개)</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {review.images.slice(0, showFullImages ? undefined : 4).map((image, idx) => (
                  <div
                    key={idx}
                    className="aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-80 transition"
                    onClick={() => window.open(image, '_blank')}
                  >
                    <img
                      src={image}
                      alt={`Review image ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              {review.images.length > 4 && !showFullImages && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFullImages(true)}
                >
                  +{review.images.length - 4}개 더보기
                </Button>
              )}
            </div>
          )}

          {/* Review Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <ThumbsUp className="h-4 w-4" />
              <span>도움됨 {review.helpful_count}</span>
            </div>
            <span>
              {formatDistanceToNow(new Date(review.created_at), {
                addSuffix: true,
                locale: ko,
              })}
            </span>
          </div>

          {/* Seller Reply Section */}
          {review.seller_reply && !isEditingReply && (
            <div className="mt-4 pl-4 border-l-2 border-blue-200 bg-blue-50 p-4 rounded-r-lg">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">판매자 답변</span>
                  {review.seller_replied_at && (
                    <span className="text-xs text-blue-600">
                      {formatDistanceToNow(new Date(review.seller_replied_at), {
                        addSuffix: true,
                        locale: ko,
                      })}
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditingReply(true);
                      setShowReplyForm(true);
                    }}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDeleteReply}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{review.seller_reply}</p>
            </div>
          )}

          {/* Reply Form */}
          {showReplyForm && (
            <div className="mt-4 pl-4 border-l-2 border-blue-200">
              <ReplyForm
                reviewId={review.id}
                existingReply={isEditingReply ? review.seller_reply : undefined}
                onSubmit={handleReplySubmit}
                onCancel={() => {
                  setShowReplyForm(false);
                  setIsEditingReply(false);
                }}
                isEditing={isEditingReply}
              />
            </div>
          )}

          {/* Reply Button */}
          {!review.seller_reply && !showReplyForm && (
            <div className="flex justify-end">
              <Button onClick={() => setShowReplyForm(true)} size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                답변 작성
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
