'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReplyFormProps {
  reviewId: string;
  existingReply?: string;
  onSubmit: (reply: string) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

interface FormData {
  reply: string;
}

export function ReplyForm({
  reviewId,
  existingReply,
  onSubmit,
  onCancel,
  isEditing = false,
}: ReplyFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const maxLength = 1000;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      reply: existingReply || '',
    },
  });

  const replyText = watch('reply');
  const charCount = replyText?.length || 0;
  const remainingChars = maxLength - charCount;

  const handleFormSubmit = async (data: FormData) => {
    if (data.reply.trim().length < 5) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(data.reply.trim());
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTemplateSelect = (template: string) => {
    setValue('reply', template);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3">
      <div className="space-y-2">
        <Textarea
          {...register('reply', {
            required: '답변을 입력해주세요',
            minLength: {
              value: 5,
              message: '답변은 최소 5자 이상이어야 합니다',
            },
            maxLength: {
              value: maxLength,
              message: `답변은 최대 ${maxLength}자까지 입력 가능합니다`,
            },
          })}
          placeholder="고객에게 답변을 작성해주세요..."
          rows={5}
          className={cn(
            'resize-none',
            errors.reply && 'border-red-500 focus-visible:ring-red-500'
          )}
          disabled={isSubmitting}
        />

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {errors.reply && (
              <span className="text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.reply.message}
              </span>
            )}
          </div>
          <span
            className={cn(
              'font-medium',
              remainingChars < 50 && 'text-orange-500',
              remainingChars < 0 && 'text-red-500'
            )}
          >
            {charCount} / {maxLength}
          </span>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          취소
        </Button>
        <Button type="submit" disabled={isSubmitting || remainingChars < 0}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? '수정 완료' : '답변 등록'}
        </Button>
      </div>
    </form>
  );
}
