'use client';

import { useState, FormEvent } from 'react';
import { StarRating } from './StarRating';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface ReviewFormProps {
  orderId: string;
  productId: string;
  productName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReviewForm({
  orderId,
  productId,
  productName,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast({
        title: '오류',
        description: '평점을 선택해 주세요',
        variant: 'error',
      });
      return;
    }

    if (comment.length < 10) {
      toast({
        title: '오류',
        description: '리뷰는 최소 10자 이상이어야 합니다',
        variant: 'error',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId,
          rating,
          title,
          comment,
          images,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '리뷰 제출에 실패했습니다');
      }

      toast({
        title: '성공',
        description: '리뷰가 성공적으로 제출되었습니다',
      });

      onSuccess?.();
    } catch (error: any) {
      toast({
        title: '오류',
        description: error.message,
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">
          리뷰 작성: {productName}
        </h3>
        <p className="text-sm text-muted-foreground">
          이 제품에 대한 경험을 공유해 주세요
        </p>
      </div>

      {/* Star Rating */}
      <div className="space-y-2">
        <Label>평점 *</Label>
        <StarRating value={rating} onChange={setRating} size="large" />
        {rating > 0 && (
          <p className="text-sm text-muted-foreground">
            {rating === 1 && '별로예요'}
            {rating === 2 && '그저 그래요'}
            {rating === 3 && '괜찮아요'}
            {rating === 4 && '좋아요'}
            {rating === 5 && '최고예요'}
          </p>
        )}
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">제목 (선택)</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="경험을 요약해 주세요"
          maxLength={100}
        />
      </div>

      {/* Comment */}
      <div className="space-y-2">
        <Label htmlFor="comment">리뷰 *</Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="이 제품에 대한 생각을 공유해 주세요"
          rows={5}
          required
          minLength={10}
        />
        <p className="text-sm text-muted-foreground">
          {comment.length} / 1000자 (최소 10자)
        </p>
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '제출 중...' : '리뷰 제출'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            취소
          </Button>
        )}
      </div>
    </form>
  );
}
