'use client';

import { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  Save,
  Eye,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUpload } from './file-upload';
import { ImageUpload } from './image-upload';
import { MultiImageUpload } from './multi-image-upload';
import { MarkdownEditor } from './markdown-preview';
import { ProductPreview, ProductPreviewCard } from './product-preview';
import { useToast } from '@/components/ui/toast';
import { useCreateProduct, useUpdateProduct } from '@/hooks/use-products';
import {
  ProductCreateSchema,
  CATEGORY_LABELS,
  PRICING_MODEL_LABELS,
  type ProductCreateInput,
} from '@/lib/validations/product';
import type { Product } from '@/lib/api/products';
import { cn } from '@/lib/utils';

/**
 * ProductFormEnhanced Component
 * Comprehensive form for creating and editing products with validation and preview
 *
 * Features:
 * - Step-by-step wizard with validation
 * - Real-time validation and error messages
 * - File upload with progress tracking
 * - Markdown editor with live preview
 * - Product preview
 * - Save as draft functionality
 * - Auto-save (optional)
 * - Character count for text fields
 * - Korean language support
 */

interface ProductFormEnhancedProps {
  product?: Product;
  mode: 'create' | 'edit';
}

export function ProductFormEnhanced({
  product,
  mode,
}: ProductFormEnhancedProps) {
  const router = useRouter();
  const { success, error: showError } = useToast();

  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // File upload state
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct(product?.id || '');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting, isDirty },
    trigger,
  } = useForm<ProductCreateInput>({
    resolver: zodResolver(ProductCreateSchema),
    defaultValues: product
      ? {
          name: product.name,
          short_description: product.short_description || '',
          description: product.description || '',
          category: product.category as any,
          tags: product.tags || [],
          pricing_model: product.pricing_model as any,
          price: Number(product.price),
          currency: product.currency as any,
          file_url: product.file_url,
          thumbnail_url: product.thumbnail_url,
          image_urls: product.image_urls || [],
          demo_url: product.demo_url,
          documentation_url: product.documentation_url,
        }
      : {
          currency: 'KRW' as any,
          tags: [],
          image_urls: [],
          pricing_model: 'one_time' as any,
        },
  });

  const watchedValues = watch();

  // Auto-save draft (debounced)
  // TODO: Implement auto-save functionality

  // Upload files helper
  const uploadFiles = useCallback(async () => {
    const uploadedUrls: Partial<{
      file_url: string;
      thumbnail_url: string;
      image_urls: string[];
    }> = {};

    try {
      // Upload main file
      if (mainFile) {
        const formData = new FormData();
        formData.append('file', mainFile);
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) throw new Error('파일 업로드 실패');
        const data = await response.json();
        uploadedUrls.file_url = data.url;
      }

      // Upload thumbnail
      if (thumbnailFile) {
        const formData = new FormData();
        formData.append('file', thumbnailFile);
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) throw new Error('썸네일 업로드 실패');
        const data = await response.json();
        uploadedUrls.thumbnail_url = data.url;
      }

      // Upload additional images
      if (additionalImages.length > 0) {
        const imageUrls: string[] = [];
        for (const image of additionalImages) {
          const formData = new FormData();
          formData.append('file', image);
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          if (!response.ok) throw new Error('이미지 업로드 실패');
          const data = await response.json();
          imageUrls.push(data.url);
        }
        uploadedUrls.image_urls = imageUrls;
      }

      return uploadedUrls;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : '파일 업로드 중 오류 발생'
      );
    }
  }, [mainFile, thumbnailFile, additionalImages]);

  // Submit handler
  const onSubmit = async (data: ProductCreateInput) => {
    try {
      // Upload files first
      const uploadedUrls = await uploadFiles();

      // Merge uploaded URLs
      const finalData = {
        ...data,
        ...uploadedUrls,
        status: 'pending' as any, // Submit for review
      };

      if (mode === 'create') {
        const newProduct = await createMutation.mutateAsync(finalData);
        success('상품 등록 완료', '상품이 성공적으로 등록되었으며 검토 대기 중입니다.');
        router.push(`/dashboard/products`);
      } else {
        await updateMutation.mutateAsync(finalData);
        success('상품 수정 완료', '상품 정보가 성공적으로 업데이트되었습니다.');
        router.push(`/dashboard/products`);
      }
    } catch (err) {
      showError(
        '오류 발생',
        err instanceof Error ? err.message : '문제가 발생했습니다'
      );
    }
  };

  // Save draft handler
  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    try {
      const uploadedUrls = await uploadFiles();
      const draftData = {
        ...watchedValues,
        ...uploadedUrls,
        status: 'draft' as any,
      };

      if (mode === 'create') {
        await createMutation.mutateAsync(draftData);
        success('임시저장 완료', '상품이 임시저장되었습니다.');
      } else {
        await updateMutation.mutateAsync(draftData);
        success('임시저장 완료', '변경사항이 임시저장되었습니다.');
      }
    } catch (err) {
      showError('임시저장 실패', '임시저장 중 오류가 발생했습니다.');
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Step navigation
  const goToNextStep = async () => {
    let fieldsToValidate: (keyof ProductCreateInput)[] = [];

    switch (currentStep) {
      case 1:
        fieldsToValidate = ['name', 'category', 'short_description'];
        break;
      case 2:
        fieldsToValidate = ['description'];
        break;
      case 3:
        fieldsToValidate = ['price', 'pricing_model', 'currency'];
        break;
      case 4:
        // Files - no validation needed as they're optional
        break;
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const goToPrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Step indicator
  const steps = [
    {
      number: 1,
      title: '기본 정보',
      description: '상품명, 카테고리',
      fields: ['name', 'category', 'short_description', 'tags'],
    },
    {
      number: 2,
      title: '상세 설명',
      description: '마크다운 지원',
      fields: ['description'],
    },
    {
      number: 3,
      title: '가격 설정',
      description: '가격 및 모델',
      fields: ['price', 'pricing_model', 'currency'],
    },
    {
      number: 4,
      title: '파일 업로드',
      description: '상품 파일 및 이미지',
      fields: ['file_url', 'thumbnail_url', 'image_urls'],
    },
    {
      number: 5,
      title: '미리보기 및 제출',
      description: '최종 검토',
      fields: [],
    },
  ];

  const currentStepData = steps[currentStep - 1];
  const isStepComplete = (stepNumber: number) => {
    const step = steps[stepNumber - 1];
    return step.fields.every((field) => {
      const value = watchedValues[field as keyof ProductCreateInput];
      return value !== undefined && value !== '' && value !== null;
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Progress Indicator */}
      <div className="space-y-4">
        {/* Step Dots */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <button
                  type="button"
                  onClick={() => setCurrentStep(step.number)}
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all',
                    currentStep >= step.number
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground',
                    isStepComplete(step.number) && 'ring-2 ring-green-500'
                  )}
                >
                  {isStepComplete(step.number) && currentStep !== step.number ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    step.number
                  )}
                </button>
                <div className="text-center mt-2">
                  <p className="text-xs md:text-sm font-medium">{step.title}</p>
                  <p className="text-xs text-muted-foreground hidden md:block">
                    {step.description}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2 transition-colors',
                    currentStep > step.number ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Preview Toggle Button */}
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
        >
          <Eye className="w-4 h-4 mr-2" />
          {showPreview ? '폼 보기' : '미리보기'}
        </Button>
      </div>

      {/* Form Content or Preview */}
      {showPreview ? (
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">카드 미리보기</h3>
            <ProductPreviewCard data={watchedValues} />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">상세 페이지 미리보기</h3>
            <ProductPreview data={watchedValues} />
          </div>
        </div>
      ) : (
        <>
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>기본 정보</CardTitle>
                <CardDescription>
                  상품의 기본 정보를 입력해주세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Product Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">
                    상품명 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="예: 고급 N8N 자동화 워크플로우 템플릿"
                    maxLength={100}
                  />
                  <div className="flex items-center justify-between">
                    {errors.name && (
                      <p className="text-sm text-destructive">
                        {errors.name.message}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground ml-auto">
                      {watchedValues.name?.length || 0} / 100
                    </p>
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">
                    카테고리 <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="카테고리 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.category && (
                    <p className="text-sm text-destructive">
                      {errors.category.message}
                    </p>
                  )}
                </div>

                {/* Short Description */}
                <div className="space-y-2">
                  <Label htmlFor="short_description">
                    짧은 설명 (선택사항)
                  </Label>
                  <Input
                    id="short_description"
                    {...register('short_description')}
                    placeholder="상품을 한 줄로 요약해주세요"
                    maxLength={200}
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      검색 결과 및 카드에 표시됩니다
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {watchedValues.short_description?.length || 0} / 200
                    </p>
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label htmlFor="tags">태그 (선택사항)</Label>
                  <Input
                    id="tags"
                    placeholder="자동화, 워크플로우, AI (쉼표로 구분)"
                    onChange={(e) => {
                      const tags = e.target.value
                        .split(',')
                        .map((t) => t.trim())
                        .filter(Boolean);
                      setValue('tags', tags);
                    }}
                    defaultValue={product?.tags?.join(', ')}
                  />
                  <p className="text-xs text-muted-foreground">
                    최대 10개까지 입력 가능
                  </p>
                  {watchedValues.tags && watchedValues.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {watchedValues.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Description */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>상세 설명</CardTitle>
                <CardDescription>
                  마크다운 문법을 사용하여 상세한 설명을 작성해주세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <MarkdownEditor
                      value={field.value || ''}
                      onChange={field.onChange}
                      error={errors.description?.message}
                      maxLength={5000}
                      minLength={100}
                    />
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Step 3: Pricing */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>가격 설정</CardTitle>
                <CardDescription>
                  상품의 가격과 판매 모델을 설정해주세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Pricing Model */}
                <div className="space-y-2">
                  <Label htmlFor="pricing_model">
                    가격 모델 <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    name="pricing_model"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="가격 모델 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(PRICING_MODEL_LABELS).map(
                            ([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.pricing_model && (
                    <p className="text-sm text-destructive">
                      {errors.pricing_model.message}
                    </p>
                  )}
                </div>

                {/* Price and Currency */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">
                      가격 <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      {...register('price', { valueAsNumber: true })}
                      placeholder="0"
                    />
                    {errors.price && (
                      <p className="text-sm text-destructive">
                        {errors.price.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">통화</Label>
                    <Controller
                      name="currency"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="통화 선택" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="KRW">KRW (₩)</SelectItem>
                            <SelectItem value="USD">USD ($)</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                {/* Demo URL */}
                <div className="space-y-2">
                  <Label htmlFor="demo_url">데모 URL (선택사항)</Label>
                  <Input
                    id="demo_url"
                    type="url"
                    {...register('demo_url')}
                    placeholder="https://example.com/demo"
                  />
                  {errors.demo_url && (
                    <p className="text-sm text-destructive">
                      {errors.demo_url.message}
                    </p>
                  )}
                </div>

                {/* Documentation URL */}
                <div className="space-y-2">
                  <Label htmlFor="documentation_url">
                    문서 URL (선택사항)
                  </Label>
                  <Input
                    id="documentation_url"
                    type="url"
                    {...register('documentation_url')}
                    placeholder="https://example.com/docs"
                  />
                  {errors.documentation_url && (
                    <p className="text-sm text-destructive">
                      {errors.documentation_url.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: File Uploads */}
          {currentStep === 4 && (
            <div className="space-y-6">
              {/* Main Product File */}
              <Card>
                <CardHeader>
                  <CardTitle>상품 파일</CardTitle>
                  <CardDescription>
                    고객이 구매 후 다운로드할 메인 파일을 업로드해주세요
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUpload
                    onFileSelect={setMainFile}
                    onFileRemove={() => setMainFile(null)}
                    currentFile={mainFile}
                    accept=".zip,.json,.yaml,.yml,.n8n"
                    maxSize={100 * 1024 * 1024} // 100MB
                  />
                </CardContent>
              </Card>

              {/* Thumbnail */}
              <Card>
                <CardHeader>
                  <CardTitle>썸네일 이미지</CardTitle>
                  <CardDescription>
                    상품 목록에 표시될 대표 이미지를 업로드해주세요
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ImageUpload
                    onImageSelect={setThumbnailFile}
                    onImageRemove={() => setThumbnailFile(null)}
                    currentImage={thumbnailFile}
                    aspectRatio="video"
                    label=""
                  />
                </CardContent>
              </Card>

              {/* Additional Images */}
              <Card>
                <CardHeader>
                  <CardTitle>추가 이미지 (선택사항)</CardTitle>
                  <CardDescription>
                    상품 상세 페이지에 표시될 추가 이미지를 업로드해주세요 (최대
                    5개)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MultiImageUpload
                    onImagesChange={setAdditionalImages}
                    currentImages={product?.image_urls}
                    maxImages={5}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 5: Preview and Submit */}
          {currentStep === 5 && (
            <Card>
              <CardHeader>
                <CardTitle>최종 검토</CardTitle>
                <CardDescription>
                  제출하기 전에 상품 정보를 확인해주세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ProductPreview data={watchedValues} />

                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <h4 className="font-semibold">제출 전 체크리스트</h4>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center gap-2">
                      {watchedValues.name ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <div className="w-4 h-4 border-2 rounded-full" />
                      )}
                      상품명 입력
                    </li>
                    <li className="flex items-center gap-2">
                      {watchedValues.description &&
                      watchedValues.description.length >= 100 ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <div className="w-4 h-4 border-2 rounded-full" />
                      )}
                      상세 설명 작성 (100자 이상)
                    </li>
                    <li className="flex items-center gap-2">
                      {watchedValues.category ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <div className="w-4 h-4 border-2 rounded-full" />
                      )}
                      카테고리 선택
                    </li>
                    <li className="flex items-center gap-2">
                      {watchedValues.price && watchedValues.price > 0 ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <div className="w-4 h-4 border-2 rounded-full" />
                      )}
                      가격 설정
                    </li>
                    <li className="flex items-center gap-2">
                      {mainFile || watchedValues.file_url ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <div className="w-4 h-4 border-2 rounded-full" />
                      )}
                      상품 파일 업로드
                    </li>
                    <li className="flex items-center gap-2">
                      {thumbnailFile || watchedValues.thumbnail_url ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <div className="w-4 h-4 border-2 rounded-full" />
                      )}
                      썸네일 이미지 업로드
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Navigation Buttons */}
      {!showPreview && (
        <div className="flex items-center justify-between pt-6 border-t">
          <div>
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={goToPrevStep}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                이전
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Save Draft */}
            <Button
              type="button"
              variant="ghost"
              onClick={handleSaveDraft}
              disabled={isSavingDraft || isSubmitting || !isDirty}
            >
              {isSavingDraft ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              임시저장
            </Button>

            {/* Next or Submit */}
            {currentStep < 5 ? (
              <Button type="button" onClick={goToNextStep}>
                다음
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                {mode === 'create' ? '검토 요청' : '수정 완료'}
              </Button>
            )}
          </div>
        </div>
      )}
    </form>
  );
}
