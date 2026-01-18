'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Flag, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StarRating } from './StarRating';
import { formatRelativeTime } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

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
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface ReviewCardProps {
  review: Review;
  currentUserId?: string;
  isProductSeller?: boolean;
  onReplyAdded?: () => void;
}

export function ReviewCard({
  review,
  currentUserId,
  isProductSeller,
  onReplyAdded,
}: ReviewCardProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [reply, setReply] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleVote = async (helpful: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/reviews/${review.id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ helpful }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to vote');
      }

      toast({
        title: 'Success',
        description: 'Vote recorded',
      });

      // Refresh the page or update the vote count
      window.location.reload();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'error',
      });
    }
  };

  const handleReply = async () => {
    if (reply.length < 5) {
      toast({
        title: 'Error',
        description: 'Reply must be at least 5 characters',
        variant: 'error',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/reviews/${review.id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reply }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add reply');
      }

      toast({
        title: 'Success',
        description: 'Reply added successfully',
      });

      setShowReplyForm(false);
      setReply('');
      onReplyAdded?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between">
          <div className="flex gap-3">
            <Avatar>
              {review.user.avatar && (
                <AvatarImage src={review.user.avatar} alt={review.user.name} />
              )}
              <AvatarFallback>
                {review.user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{review.user.name}</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <StarRating value={review.rating} readonly size="small" />
                {review.verified_purchase && (
                  <Badge variant="secondary" className="text-xs">
                    Verified Purchase
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {formatRelativeTime(new Date(review.created_at))}
          </div>
        </div>

        {review.title && (
          <h4 className="mt-4 font-semibold">{review.title}</h4>
        )}

        <p className="mt-2 text-sm whitespace-pre-wrap">{review.comment}</p>

        {review.images.length > 0 && (
          <div className="mt-4 flex gap-2 flex-wrap">
            {review.images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt=""
                className="h-20 w-20 rounded object-cover cursor-pointer hover:opacity-80"
                onClick={() => window.open(img, '_blank')}
              />
            ))}
          </div>
        )}

        {/* Seller Reply */}
        {review.seller_reply && (
          <div className="mt-4 bg-muted p-4 rounded">
            <div className="flex items-center gap-2 text-sm font-medium mb-1">
              <MessageSquare className="h-4 w-4" />
              Seller Response
            </div>
            <p className="text-sm">{review.seller_reply}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {formatRelativeTime(new Date(review.seller_replied_at!))}
            </p>
          </div>
        )}

        {/* Seller Reply Form */}
        {isProductSeller && !review.seller_reply && showReplyForm && (
          <div className="mt-4 space-y-3">
            <textarea
              className="w-full p-3 border rounded-md min-h-[100px]"
              placeholder="Write your response..."
              value={reply}
              onChange={(e) => setReply(e.target.value)}
            />
            <div className="flex gap-2">
              <Button onClick={handleReply} disabled={isSubmitting} size="sm">
                {isSubmitting ? 'Sending...' : 'Send Reply'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowReplyForm(false)}
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleVote(true)}
            disabled={!currentUserId || review.user.id === currentUserId}
          >
            <ThumbsUp className="h-4 w-4 mr-1" />
            Helpful ({review.helpful_count})
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleVote(false)}
            disabled={!currentUserId || review.user.id === currentUserId}
          >
            <ThumbsDown className="h-4 w-4 mr-1" />
            Not Helpful ({review.not_helpful_count})
          </Button>
          {isProductSeller && !review.seller_reply && !showReplyForm && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowReplyForm(true)}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Reply
            </Button>
          )}
          {currentUserId && review.user.id !== currentUserId && (
            <Button variant="ghost" size="sm">
              <Flag className="h-4 w-4 mr-1" />
              Report
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
