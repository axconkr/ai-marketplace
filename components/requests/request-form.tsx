'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Loader2, Save, Send, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import {
  createRequestSchema,
  REQUEST_CATEGORIES,
  type CreateRequestInput,
} from '@/src/lib/requests/types';

/**
 * RequestForm Component
 * Form for buyers to submit development requests
 */

interface RequestFormProps {
  onSuccess?: (requestId: string) => void;
}

const CATEGORY_LABELS: Record<typeof REQUEST_CATEGORIES[number], string> = {
  n8n: 'n8n Workflow',
  make: 'Make.com Automation',
  ai_agent: 'AI Agent',
  app: 'Application',
  api: 'API Integration',
  prompt: 'Prompt Engineering',
};

export function RequestForm({ onSuccess }: RequestFormProps) {
  const router = useRouter();
  const { success, error } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requirementFields, setRequirementFields] = useState<
    { key: string; value: string }[]
  >([{ key: '', value: '' }]);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [attachmentInput, setAttachmentInput] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<CreateRequestInput>({
    resolver: zodResolver(createRequestSchema),
    defaultValues: {
      requirements: {},
      attachments: [],
    },
  });

  // Add requirement field
  const addRequirementField = () => {
    setRequirementFields([...requirementFields, { key: '', value: '' }]);
  };

  // Remove requirement field
  const removeRequirementField = (index: number) => {
    const newFields = requirementFields.filter((_, i) => i !== index);
    setRequirementFields(newFields.length === 0 ? [{ key: '', value: '' }] : newFields);
  };

  // Update requirement field
  const updateRequirementField = (
    index: number,
    field: 'key' | 'value',
    value: string
  ) => {
    const newFields = [...requirementFields];
    newFields[index][field] = value;
    setRequirementFields(newFields);
  };

  // Add attachment URL
  const addAttachment = () => {
    if (attachmentInput.trim() && attachmentInput.startsWith('http')) {
      setAttachments([...attachments, attachmentInput.trim()]);
      setAttachmentInput('');
    } else {
      error('Please enter a valid URL starting with http:// or https://');
    }
  };

  // Remove attachment
  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: CreateRequestInput) => {
    try {
      setIsSubmitting(true);

      // Build requirements object from key-value pairs
      const requirements: Record<string, any> = {};
      requirementFields.forEach((field) => {
        if (field.key.trim() && field.value.trim()) {
          requirements[field.key.trim()] = field.value.trim();
        }
      });

      const requestData = {
        ...data,
        requirements,
        attachments,
      };

      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create request');
      }

      success('개발 의뢰가 성공적으로 등록되었습니다!');

      if (onSuccess) {
        onSuccess(result.data.id);
      } else {
        router.push(`/requests/${result.data.id}`);
      }
    } catch (err: any) {
      console.error('Error creating request:', err);
      error(err.message || '개발 의뢰 등록에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>개발 의뢰 등록</CardTitle>
          <CardDescription>
            프로젝트 요구사항을 상세히 작성하면 전문 개발자들의 제안을 받을 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              프로젝트 제목 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="예: n8n을 활용한 업무 자동화 시스템 개발"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">
              카테고리 <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                    <SelectValue placeholder="카테고리를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {REQUEST_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {CATEGORY_LABELS[category]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              프로젝트 설명 <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="프로젝트의 목적, 필요한 기능, 예상되는 결과물 등을 상세히 작성해주세요."
              rows={8}
              className={errors.description ? 'border-red-500' : ''}
            />
            <p className="text-sm text-gray-500">
              최소 50자 이상 작성해주세요 (현재: {watch('description')?.length || 0}자)
            </p>
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* Budget Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budgetMin">
                최소 예산 (₩) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="budgetMin"
                type="number"
                {...register('budgetMin', { valueAsNumber: true })}
                placeholder="100000"
                min="10000"
                step="10000"
                className={errors.budgetMin ? 'border-red-500' : ''}
              />
              {errors.budgetMin && (
                <p className="text-sm text-red-500">{errors.budgetMin.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="budgetMax">
                최대 예산 (₩) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="budgetMax"
                type="number"
                {...register('budgetMax', { valueAsNumber: true })}
                placeholder="500000"
                min="10000"
                step="10000"
                className={errors.budgetMax ? 'border-red-500' : ''}
              />
              {errors.budgetMax && (
                <p className="text-sm text-red-500">{errors.budgetMax.message}</p>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-2">
            <Label htmlFor="timeline">
              예상 기간 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="timeline"
              {...register('timeline')}
              placeholder="예: 2주, 1개월, 협의 가능"
              className={errors.timeline ? 'border-red-500' : ''}
            />
            {errors.timeline && (
              <p className="text-sm text-red-500">{errors.timeline.message}</p>
            )}
          </div>

          {/* Requirements */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>추가 요구사항</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addRequirementField}
              >
                <Plus className="w-4 h-4 mr-1" />
                항목 추가
              </Button>
            </div>
            <div className="space-y-2">
              {requirementFields.map((field, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="항목명 (예: 플랫폼)"
                    value={field.key}
                    onChange={(e) =>
                      updateRequirementField(index, 'key', e.target.value)
                    }
                    className="flex-1"
                  />
                  <Input
                    placeholder="내용 (예: Web, Mobile)"
                    value={field.value}
                    onChange={(e) =>
                      updateRequirementField(index, 'value', e.target.value)
                    }
                    className="flex-1"
                  />
                  {requirementFields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRequirementField(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <Label>첨부 파일 URL</Label>
            <div className="flex gap-2">
              <Input
                placeholder="https://example.com/file.pdf"
                value={attachmentInput}
                onChange={(e) => setAttachmentInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addAttachment();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addAttachment}>
                <Plus className="w-4 h-4 mr-1" />
                추가
              </Button>
            </div>
            {attachments.length > 0 && (
              <div className="space-y-1 mt-2">
                {attachments.map((url, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-2 rounded"
                  >
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline truncate flex-1"
                    >
                      {url}
                    </a>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Submit Buttons */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          취소
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              등록 중...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              의뢰 등록
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
