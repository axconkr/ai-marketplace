/**
 * Product Validation Schemas (Zod)
 * Input validation for Product CRUD operations
 */

import { z } from 'zod';

// Define category enum matching schema
export enum ProductCategory {
  n8n = 'n8n',
  make = 'make',
  ai_agent = 'ai_agent',
  app = 'app',
  api = 'api',
  prompt = 'prompt',
  other = 'other',
}

export enum PricingModel {
  one_time = 'one_time',
  subscription = 'subscription',
  license = 'license',
}

export enum ProductStatus {
  draft = 'draft',
  pending = 'pending',
  active = 'active',
  suspended = 'suspended',
}

export enum Currency {
  USD = 'USD',
  KRW = 'KRW',
}

// ============================================================================
// PRODUCT SCHEMAS
// ============================================================================

/**
 * Product Create Schema
 * Used for POST /api/products
 */
export const ProductCreateSchema = z.object({
  name: z
    .string()
    .min(3, '상품명은 최소 3자 이상이어야 합니다')
    .max(100, '상품명은 100자를 초과할 수 없습니다')
    .trim(),

  short_description: z
    .string()
    .max(200, '짧은 설명은 200자를 초과할 수 없습니다')
    .trim()
    .optional()
    .nullable(),

  description: z
    .string()
    .min(100, '상세 설명은 최소 100자 이상이어야 합니다')
    .max(5000, '상세 설명은 5000자를 초과할 수 없습니다')
    .trim(),

  category: z.nativeEnum(ProductCategory, {
    errorMap: () => ({
      message: '카테고리를 선택해주세요',
    }),
  }),

  tags: z
    .array(z.string())
    .max(10, '태그는 최대 10개까지 가능합니다')
    .optional()
    .default([]),

  price: z
    .number()
    .positive('가격은 0보다 커야 합니다')
    .max(10000000, '가격은 10,000,000을 초과할 수 없습니다')
    .multipleOf(0.01, '가격은 소수점 둘째 자리까지 입력 가능합니다'),

  currency: z
    .nativeEnum(Currency, {
      errorMap: () => ({
        message: `통화는 ${Object.values(Currency).join(', ')} 중 하나여야 합니다`,
      }),
    })
    .default(Currency.KRW),

  pricing_model: z
    .nativeEnum(PricingModel, {
      errorMap: () => ({
        message: '가격 모델을 선택해주세요',
      }),
    })
    .default(PricingModel.one_time),

  // File URLs (uploaded separately)
  file_url: z.string().url('올바른 파일 URL을 입력해주세요').optional().nullable(),
  thumbnail_url: z.string().url('올바른 썸네일 URL을 입력해주세요').optional().nullable(),
  image_urls: z.array(z.string().url()).max(5, '이미지는 최대 5개까지 업로드 가능합니다').optional().default([]),

  demo_url: z
    .string()
    .url('올바른 URL 형식이 아닙니다')
    .optional()
    .nullable(),

  documentation_url: z
    .string()
    .url('올바른 URL 형식이 아닙니다')
    .optional()
    .nullable(),

  status: z
    .nativeEnum(ProductStatus)
    .optional()
    .default(ProductStatus.draft),
});

/**
 * Product Update Schema
 * Used for PUT /api/products/[id]
 * All fields are optional (partial update)
 */
export const ProductUpdateSchema = ProductCreateSchema.partial();

/**
 * Product Search/Filter Parameters Schema
 * Used for GET /api/products/search
 * Enhanced with min_rating filter for Phase 3
 */
export const ProductSearchSchema = z.object({
  // Pagination
  page: z
    .string()
    .optional()
    .default('1')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive().default(1)),

  limit: z
    .string()
    .optional()
    .default('20')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive().max(100).default(20)),

  // Search
  search: z.string().trim().optional(),

  // Filters
  category: z.string().optional(),

  pricing_model: z.string().optional(),

  status: z.string().optional(),

  min_price: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined))
    .pipe(z.number().nonnegative().optional()),

  max_price: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined))
    .pipe(z.number().nonnegative().optional()),

  // Phase 3: Add min_rating filter
  min_rating: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined))
    .pipe(z.number().min(0).max(5).optional()),

  verification_level: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .pipe(z.number().int().min(0).max(3).optional()),

  seller_id: z.string().optional(),

  // Sorting
  sort_by: z
    .enum(['newest', 'popular', 'price_asc', 'price_desc', 'rating'])
    .optional()
    .default('newest'),
}).refine(
  (data) => {
    if (data.min_price !== undefined && data.max_price !== undefined) {
      return data.min_price <= data.max_price;
    }
    return true;
  },
  {
    message: 'min_price must be less than or equal to max_price',
    path: ['min_price'],
  }
);

/**
 * Product ID Parameter Schema
 * Used for validating URL parameters
 */
export const ProductIdSchema = z.object({
  id: z.string().cuid('Invalid product ID format'),
});

/**
 * Seller ID Parameter Schema
 * Used for validating seller routes
 */
export const SellerIdSchema = z.object({
  sellerId: z.string().cuid('Invalid seller ID format'),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type ProductCreateInput = z.input<typeof ProductCreateSchema>;
export type ProductCreateOutput = z.infer<typeof ProductCreateSchema>;
export type ProductUpdateInput = z.input<typeof ProductUpdateSchema>;
export type ProductSearchParams = z.infer<typeof ProductSearchSchema>;
export type ProductIdParams = z.infer<typeof ProductIdSchema>;
export type SellerIdParams = z.infer<typeof SellerIdSchema>;

// ============================================================================
// UI LABELS AND CONSTANTS
// ============================================================================

// Category labels for UI
export const CATEGORY_LABELS: Record<string, string> = {
  n8n: 'n8n Workflow',
  make: 'Make Scenario',
  ai_agent: 'AI Agent',
  app: 'Vibe Coding App',
  api: 'API Service',
  prompt: 'Prompt Template',
  other: '기타',
};

// Pricing model labels
export const PRICING_MODEL_LABELS: Record<string, string> = {
  one_time: 'One-time Purchase',
  subscription: 'Subscription',
  license: 'License',
};

// Status labels with color classes
export const STATUS_LABELS: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }
> = {
  draft: { label: 'Draft', variant: 'secondary' },
  pending: { label: 'Pending Review', variant: 'outline' },
  active: { label: 'Active', variant: 'default' },
  suspended: { label: 'Suspended', variant: 'destructive' },
};
