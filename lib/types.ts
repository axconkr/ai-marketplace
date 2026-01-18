/**
 * TypeScript Types for AI Marketplace
 * Auto-generated from Prisma Schema
 */

import { Prisma } from '@prisma/client';

// ============================================================================
// USER TYPES
// ============================================================================

export type User = Prisma.UserGetPayload<{}>;

export type UserWithProducts = Prisma.UserGetPayload<{
  include: { products: true };
}>;

export type UserWithOrders = Prisma.UserGetPayload<{
  include: { orders: true };
}>;

export type SellerProfile = Prisma.UserGetPayload<{
  include: {
    products: {
      include: {
        reviews: true;
      };
    };
    seller_reviews: true;
  };
}>;

// ============================================================================
// PRODUCT TYPES
// ============================================================================

export type Product = Prisma.ProductGetPayload<{}>;

export type ProductWithSeller = Prisma.ProductGetPayload<{
  include: { seller: true };
}>;

export type ProductDetail = Prisma.ProductGetPayload<{
  include: {
    seller: {
      select: {
        id: true;
        name: true;
        avatar_url: true;
        seller_tier: true;
        bio: true;
      };
    };
    reviews: {
      include: {
        buyer: {
          select: {
            id: true;
            name: true;
            avatar_url: true;
          };
        };
      };
      orderBy: {
        created_at: 'desc';
      };
    };
    verifications: {
      where: {
        status: 'approved';
      };
      orderBy: {
        level: 'desc';
      };
      take: 1;
    };
  };
}>;

export type ProductCard = Pick<
  Product,
  | 'id'
  | 'title'
  | 'category'
  | 'price'
  | 'currency'
  | 'verification_level'
  | 'rating_avg'
  | 'review_count'
  | 'demo_url'
> & {
  seller: {
    name: string | null;
    seller_tier: string | null;
  };
};

// ============================================================================
// ORDER TYPES
// ============================================================================

export type Order = Prisma.OrderGetPayload<{}>;

export type OrderWithDetails = Prisma.OrderGetPayload<{
  include: {
    product: {
      include: {
        seller: {
          select: {
            id: true;
            name: true;
            email: true;
          };
        };
      };
    };
    buyer: {
      select: {
        id: true;
        name: true;
        email: true;
      };
    };
    payment: true;
    review: true;
  };
}>;

// ============================================================================
// PAYMENT TYPES
// ============================================================================

export type Payment = Prisma.PaymentGetPayload<{}>;

export type PaymentWithDetails = Prisma.PaymentGetPayload<{
  include: {
    buyer: {
      select: {
        id: true;
        name: true;
        email: true;
      };
    };
    seller: {
      select: {
        id: true;
        name: true;
        email: true;
      };
    };
    orders: true;
  };
}>;

// ============================================================================
// REVIEW TYPES
// ============================================================================

export type Review = Prisma.ReviewGetPayload<{}>;

export type ReviewWithDetails = Prisma.ReviewGetPayload<{
  include: {
    buyer: {
      select: {
        id: true;
        name: true;
        avatar_url: true;
      };
    };
    product: {
      select: {
        id: true;
        title: true;
      };
    };
  };
}>;

// ============================================================================
// VERIFICATION TYPES
// ============================================================================

export type Verification = Prisma.VerificationGetPayload<{}>;

export type VerificationWithDetails = Prisma.VerificationGetPayload<{
  include: {
    product: {
      select: {
        id: true;
        title: true;
        seller_id: true;
      };
    };
    verifier: {
      select: {
        id: true;
        name: true;
        email: true;
        bio: true;
      };
    };
  };
}>;

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export type Notification = Prisma.NotificationGetPayload<{}>;

// ============================================================================
// CUSTOM REQUEST TYPES
// ============================================================================

export type CustomRequest = Prisma.CustomRequestGetPayload<{}>;

// ============================================================================
// DASHBOARD TYPES
// ============================================================================

export type SellerDashboardStats = {
  totalProducts: number;
  activeProducts: number;
  totalSales: number;
  totalRevenue: number;
  pendingOrders: number;
  averageRating: number;
  totalReviews: number;
};

export type BuyerDashboardStats = {
  totalOrders: number;
  completedOrders: number;
  totalSpent: number;
  pendingReviews: number;
};

export type AdminDashboardStats = {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingVerifications: number;
  pendingProducts: number;
};

// ============================================================================
// SEARCH & FILTER TYPES
// ============================================================================

export type ProductSearchParams = {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  verificationLevel?: number;
  sellerTier?: string;
  sortBy?: 'newest' | 'popular' | 'price_asc' | 'price_desc' | 'rating';
  page?: number;
  limit?: number;
};

export type ProductSearchResult = {
  products: ProductCard[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
};

// ============================================================================
// VERIFICATION REPORT TYPES
// ============================================================================

export type VerificationReportLevel1 = {
  code_quality?: {
    score: number;
    comments: string;
  };
  automated_tests?: {
    passed: boolean;
    comments: string;
  };
  overall: {
    score: number;
    recommendation: string;
  };
};

export type VerificationReportLevel2 = VerificationReportLevel1 & {
  security?: {
    score: number;
    comments: string;
  };
  documentation?: {
    score: number;
    comments: string;
  };
};

export type VerificationReportLevel3 = VerificationReportLevel2 & {
  performance?: {
    score: number;
    comments: string;
    load_test_results?: string;
  };
  security: {
    score: number;
    comments: string;
    scanned_with: string;
  };
};

export type VerificationReport =
  | VerificationReportLevel1
  | VerificationReportLevel2
  | VerificationReportLevel3;

// ============================================================================
// PORTFOLIO TYPES
// ============================================================================

export type UserPortfolio = {
  github?: string;
  linkedin?: string;
  portfolio?: string;
  twitter?: string;
  certifications?: string[];
  experience?: string;
  [key: string]: any;
};
