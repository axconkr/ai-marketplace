'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import {
  createProposalSchema,
  type CreateProposalInput,
} from '@/src/lib/requests/types';

/**
 * ProposalForm Component
 * Form for sellers to submit proposals for development requests
 */

interface ProposalFormProps {
  requestId: string;
  onSuccess?: (proposalId: string) => void;
  onCancel?: () => void;
}

export function ProposalForm({
  requestId,
  onSuccess,
  onCancel,
}: ProposalFormProps) {
  const { success, error } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateProposalInput>({
    resolver: zodResolver(createProposalSchema),
    defaultValues: {
      requestId,
    },
  });

  const onSubmit = async (data: CreateProposalInput) => {
    try {
      setIsSubmitting(true);

      const response = await fetch('/api/proposals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create proposal');
      }

      success('제안서가 성공적으로 제출되었습니다!');

      if (onSuccess) {
        onSuccess(result.data.id);
      }
    } catch (err: any) {
      console.error('Error creating proposal:', err);
      error(err.message || '제안서 제출에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ko-KR').format(value);
  };

  const priceValue = watch('price');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">제안서 작성</h3>
        <p className="text-sm text-gray-600">
          구체적이고 명확한 제안으로 의뢰인의 관심을 끌어보세요
        </p>
      </div>

      {/* Price */}
      <div className="space-y-2">
        <Label htmlFor="price">
          제안 금액 (₩) <span className="text-red-500">*</span>
        </Label>
        <Input
          id="price"
          type="number"
          {...register('price', { valueAsNumber: true })}
          placeholder="1000000"
          min="10000"
          step="10000"
          className={errors.price ? 'border-red-500' : ''}
        />
        {priceValue && priceValue >= 10000 && (
          <p className="text-sm text-gray-600">
            ₩ {formatCurrency(priceValue)}
          </p>
        )}
        {errors.price && (
          <p className="text-sm text-red-500">{errors.price.message}</p>
        )}
      </div>

      {/* Timeline */}
      <div className="space-y-2">
        <Label htmlFor="timeline">
          작업 기간 <span className="text-red-500">*</span>
        </Label>
        <Input
          id="timeline"
          {...register('timeline')}
          placeholder="예: 2주, 1개월"
          className={errors.timeline ? 'border-red-500' : ''}
        />
        <p className="text-sm text-gray-500">
          프로젝트 완료까지 예상되는 기간을 입력해주세요
        </p>
        {errors.timeline && (
          <p className="text-sm text-red-500">{errors.timeline.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">
          제안 내용 <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="프로젝트에 대한 이해도, 개발 계획, 포트폴리오, 왜 본인이 적합한지 등을 구체적으로 작성해주세요."
          rows={10}
          className={errors.description ? 'border-red-500' : ''}
        />
        <p className="text-sm text-gray-500">
          최소 50자 이상 작성해주세요 (현재: {watch('description')?.length || 0}자)
        </p>
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      {/* Submit Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <X className="w-4 h-4 mr-1" />
            취소
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              제출 중...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              제안서 제출
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
