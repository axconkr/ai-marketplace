/**
 * Types and Zod schemas for subscription system
 */

import { z } from 'zod';

// Enums
export enum SubscriptionTier {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
  PAST_DUE = 'PAST_DUE',
  PAUSED = 'PAUSED',
  TRIALING = 'TRIALING',
}

export enum BillingInterval {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

// Zod Schemas
export const CreateSubscriptionSchema = z.object({
  tier: z.nativeEnum(SubscriptionTier),
  interval: z.nativeEnum(BillingInterval),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export const UpdateSubscriptionSchema = z.object({
  tier: z.nativeEnum(SubscriptionTier).optional(),
  interval: z.nativeEnum(BillingInterval).optional(),
  cancelAtPeriodEnd: z.boolean().optional(),
});

export const CancelSubscriptionSchema = z.object({
  immediately: z.boolean().default(false),
  reason: z.string().optional(),
});

// TypeScript Types
export type CreateSubscriptionInput = z.infer<typeof CreateSubscriptionSchema>;
export type UpdateSubscriptionInput = z.infer<typeof UpdateSubscriptionSchema>;
export type CancelSubscriptionInput = z.infer<typeof CancelSubscriptionSchema>;

export interface SubscriptionPlanFeatures {
  maxProducts: number | 'unlimited';
  analytics: 'basic' | 'advanced' | 'premium';
  support: 'community' | 'email' | 'priority' | 'dedicated';
  verificationDiscount: number;
  apiAccess: boolean;
  priorityListing: boolean;
  whiteLabel: boolean;
  customIntegrations: boolean;
  sla: boolean;
}

export interface PlanPricing {
  tier: SubscriptionTier;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  featureDetails: SubscriptionPlanFeatures;
  stripePriceIdMonthly?: string;
  stripePriceIdYearly?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface ProrationPreview {
  immediateCharge: number;
  nextBillingAmount: number;
  nextBillingDate: Date;
  creditsApplied: number;
}

export interface SubscriptionDetails {
  id: string;
  userId: string;
  tier: string;
  status: string;
  interval: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId: string | null;
  stripeCustomerId: string | null;
  stripePriceId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BillingHistoryItem {
  id: string;
  date: Date;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  description: string;
  invoiceUrl?: string;
  receiptUrl?: string;
}

// Constants
export const PLAN_FEATURES: Record<SubscriptionTier, SubscriptionPlanFeatures> = {
  [SubscriptionTier.FREE]: {
    maxProducts: 3,
    analytics: 'basic',
    support: 'community',
    verificationDiscount: 0,
    apiAccess: false,
    priorityListing: false,
    whiteLabel: false,
    customIntegrations: false,
    sla: false,
  },
  [SubscriptionTier.BASIC]: {
    maxProducts: 'unlimited',
    analytics: 'advanced',
    support: 'email',
    verificationDiscount: 10,
    apiAccess: false,
    priorityListing: false,
    whiteLabel: false,
    customIntegrations: false,
    sla: false,
  },
  [SubscriptionTier.PRO]: {
    maxProducts: 'unlimited',
    analytics: 'advanced',
    support: 'priority',
    verificationDiscount: 20,
    apiAccess: true,
    priorityListing: true,
    whiteLabel: false,
    customIntegrations: false,
    sla: false,
  },
  [SubscriptionTier.ENTERPRISE]: {
    maxProducts: 'unlimited',
    analytics: 'premium',
    support: 'dedicated',
    verificationDiscount: 30,
    apiAccess: true,
    priorityListing: true,
    whiteLabel: true,
    customIntegrations: true,
    sla: true,
  },
};

export const PLAN_PRICING: PlanPricing[] = [
  {
    tier: SubscriptionTier.FREE,
    name: '무료',
    description: '시작하기에 완벽한 플랜',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: ['최대 3개 상품 등록', '기본 분석', '커뮤니티 지원'],
    featureDetails: PLAN_FEATURES[SubscriptionTier.FREE],
    isActive: true,
    sortOrder: 0,
  },
  {
    tier: SubscriptionTier.BASIC,
    name: '베이직',
    description: '개인 개발자를 위한 플랜',
    monthlyPrice: 9900,
    yearlyPrice: 99000,
    features: [
      '무제한 상품 등록',
      '고급 분석',
      '이메일 지원',
      '검증 할인 10%',
    ],
    featureDetails: PLAN_FEATURES[SubscriptionTier.BASIC],
    isActive: true,
    sortOrder: 1,
  },
  {
    tier: SubscriptionTier.PRO,
    name: '프로',
    description: '전문가를 위한 플랜',
    monthlyPrice: 29900,
    yearlyPrice: 299000,
    features: [
      '베이직 모든 기능',
      '우선 리스팅',
      '전용 지원',
      '검증 할인 20%',
      'API 액세스',
    ],
    featureDetails: PLAN_FEATURES[SubscriptionTier.PRO],
    isActive: true,
    sortOrder: 2,
  },
  {
    tier: SubscriptionTier.ENTERPRISE,
    name: '엔터프라이즈',
    description: '기업을 위한 플랜',
    monthlyPrice: 99900,
    yearlyPrice: 999000,
    features: [
      '프로 모든 기능',
      '화이트라벨',
      '전담 매니저',
      '커스텀 통합',
      'SLA 보장',
    ],
    featureDetails: PLAN_FEATURES[SubscriptionTier.ENTERPRISE],
    isActive: true,
    sortOrder: 3,
  },
];
