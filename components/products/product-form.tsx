'use client';

import { useState, useCallback, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Loader2, Save, Eye, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';
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
 * ProductForm Component
 * Comprehensive form for creating and editing products with validation and preview
 */

interface ProductFormProps {
  product?: Product;
  mode: 'create' | 'edit';
}

export function ProductForm({ product, mode }: ProductFormProps) {
  const router = useRouter();
  const { success, error } = useToast();

  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // File upload state
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct(product?.id || '');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductCreateInput>({
    resolver: zodResolver(ProductCreateSchema),
    defaultValues: product
      ? {
          title: product.title,
          description: product.description,
          category: product.category as any,
          tags: product.tags,
          pricing_model: product.pricing_model as any,
          price: Number(product.price),
          currency: product.currency as any,
          file_url: product.file_url,
          demo_url: product.demo_url,
        }
      : {
          currency: 'KRW' as any,
          tags: [],
        },
  });

  const watchedValues = watch();

  const onSubmit = async (data: ProductCreateInput) => {
    try {
      // Upload file if provided
      if (uploadedFile) {
        setUploadProgress(0);
        const { url } = await uploadMutation.mutateAsync(uploadedFile);
        data.file_url = url;
        setUploadProgress(100);
      }

      if (mode === 'create') {
        const newProduct = await createMutation.mutateAsync(data);
        addToast({
          title: '상품이 성공적으로 등록되었습니다!',
          description: '상품이 등록되었으며 검토 대기 중입니다.',
        });
        router.push(`/products/${newProduct.id}`);
      } else {
        await updateMutation.mutateAsync(data);
        addToast({
          title: '상품이 성공적으로 수정되었습니다!',
          description: '변경 사항이 저장되었습니다.',
        });
        router.push(`/products/${product?.id}`);
      }
    } catch (error) {
      addToast({
        title: '오류',
        description: error instanceof Error ? error.message : '문제가 발생했습니다',
        variant: 'error',
      });
    }
  };

  const handleSaveDraft = async () => {
    const data = watchedValues;
    data.status = 'draft' as any;
    await onSubmit(data);
  };

  const steps = [
    { number: 1, title: '기본 정보', description: '상품 상세정보' },
    { number: 2, title: '가격 설정', description: '가격 책정' },
    { number: 3, title: '파일 업로드', description: '리소스 업로드' },
    { number: 4, title: '미리보기', description: '검토 및 제출' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Step Indicator */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                  currentStep >= step.number
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {step.number}
              </div>
              <div className="text-center mt-2">
                <p className="text-sm font-medium">{step.title}</p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-4 transition-colors ${
                  currentStep > step.number ? 'bg-primary' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Basic Info */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
            <CardDescription>상품에 대한 정보를 입력해주세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                상품명 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="놀라운 n8n 워크플로우 템플릿"
                aria-invalid={!!errors.title}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">
                카테고리 <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watchedValues.category || ''}
                onValueChange={(value) => setValue('category', value as any)}
              >
                <SelectTrigger className="w-full">
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
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                상세 설명 <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="상품에 대해 자세히 설명해주세요..."
                rows={8}
                aria-invalid={!!errors.description}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">태그 (쉼표로 구분)</Label>
              <Input
                id="tags"
                placeholder="자동화, 워크플로우, AI"
                onChange={(e) => {
                  const tags = e.target.value.split(',').map((t) => t.trim()).filter(Boolean);
                  setValue('tags', tags);
                }}
                defaultValue={product?.tags.join(', ')}
              />
              {errors.tags && (
                <p className="text-sm text-destructive">{errors.tags.message}</p>
              )}
            </div>

            {/* Demo URL */}
            <div className="space-y-2">
              <Label htmlFor="demo_url">데모 URL (선택사항)</Label>
              <Input
                id="demo_url"
                {...register('demo_url')}
                placeholder="https://example.com/demo"
                type="url"
              />
              {errors.demo_url && (
                <p className="text-sm text-destructive">{errors.demo_url.message}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Pricing */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>가격 설정</CardTitle>
            <CardDescription>가격 모델과 가격을 설정해주세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Pricing Model */}
            <div className="space-y-2">
              <Label htmlFor="pricing_model">
                가격 모델 <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watchedValues.pricing_model || ''}
                onValueChange={(value) => setValue('pricing_model', value as any)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="가격 모델 선택" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PRICING_MODEL_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.pricing_model && (
                <p className="text-sm text-destructive">{errors.pricing_model.message}</p>
              )}
            </div>

            {/* Price */}
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
                  placeholder="29.99"
                />
                {errors.price && (
                  <p className="text-sm text-destructive">{errors.price.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">통화</Label>
                <Select
                  value={watchedValues.currency || 'KRW'}
                  onValueChange={(value) => setValue('currency', value as any)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="통화 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KRW">KRW (₩)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Files */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>파일 업로드</CardTitle>
            <CardDescription>상품 파일을 업로드해주세요</CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload
              onFileSelect={setUploadedFile}
              onFileRemove={() => setUploadedFile(null)}
              currentFile={uploadedFile}
              uploadProgress={uploadProgress}
              error={uploadMutation.error?.message}
            />
          </CardContent>
        </Card>
      )}

      {/* Step 4: Preview */}
      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>미리보기</CardTitle>
            <CardDescription>제출하기 전에 상품을 검토해주세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-lg">{watchedValues.title || '제목 없음'}</h3>
              <p className="text-sm text-muted-foreground">
                {watchedValues.description || '설명 없음'}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">카테고리:</span>
                <span className="font-medium">
                  {watchedValues.category
                    ? CATEGORY_LABELS[watchedValues.category as keyof typeof CATEGORY_LABELS]
                    : '선택되지 않음'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">가격:</span>
                <span className="font-medium text-primary text-xl">
                  {watchedValues.currency === 'USD' ? '$' : '₩'}
                  {watchedValues.price || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <div>
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep((prev) => prev - 1)}
            >
              이전
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={handleSaveDraft}
            disabled={isSubmitting}
          >
            <Save className="w-4 h-4 mr-2" />
            임시저장
          </Button>

          {currentStep < 4 ? (
            <Button
              type="button"
              onClick={() => setCurrentStep((prev) => prev + 1)}
            >
              다음
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {mode === 'create' ? '검토 요청' : '상품 수정'}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
