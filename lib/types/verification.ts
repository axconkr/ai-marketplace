/**
 * Verification Types
 */

export type VerificationStatus =
  | 'PENDING'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';

export type VerificationLevel = 0 | 1 | 2 | 3;

export interface AutomatedChecks {
  fileFormat: { passed: boolean; message: string };
  virusScan: { passed: boolean; message: string };
  metadata: { passed: boolean; message: string };
  codeQuality?: {
    score: number;
    issues: string[];
    suggestions: string[];
  };
  documentation?: {
    score: number;
    coverage: number;
    issues: string[];
  };
  security?: {
    score: number;
    vulnerabilities: string[];
    recommendations: string[];
  };
  performance?: {
    score: number;
    loadTime: number;
    metrics: Record<string, any>;
  };
}

export interface ManualReview {
  score: number; // 0-100
  comments: string;
  approved: boolean;
  badges: string[]; // ["security", "performance", "quality", "documentation"]
  improvements: string[];
  strengths?: string[];
  weaknesses?: string[];
}

export interface VerificationReport {
  level: VerificationLevel;
  checks?: AutomatedChecks;
  automated?: {
    codeQuality?: {
      score: number;
      issues: string[];
      suggestions: string[];
    };
    documentation?: {
      score: number;
      coverage: number;
    };
    security?: {
      score: number;
      vulnerabilities: string[];
    };
    performance?: {
      score: number;
      metrics: Record<string, any>;
    };
  };
  manual?: ManualReview;
  finalScore: number;
  recommendation: 'APPROVE' | 'REJECT' | 'NEEDS_IMPROVEMENT';
}

export interface Verification {
  id: string;
  product_id: string;
  verifier_id: string | null;
  level: VerificationLevel;
  status: VerificationStatus;
  fee: number; // in cents
  platform_share: number; // in cents
  verifier_share: number; // in cents
  report: VerificationReport | null;
  score: number | null;
  badges: string[];
  requested_at: Date | string;
  assigned_at: Date | string | null;
  reviewed_at: Date | string | null;
  completed_at: Date | string | null;
}

export interface VerificationWithDetails extends Verification {
  product: {
    id: string;
    name: string;
    seller_id: string;
  };
  verifier?: {
    id: string;
    name: string | null;
    email: string;
    bio: string | null;
  } | null;
}

export interface VerificationFilters {
  status?: VerificationStatus;
  level?: VerificationLevel;
  verifier_id?: string;
  product_id?: string;
  page?: number;
  limit?: number;
}

export interface VerificationListResponse {
  verifications: VerificationWithDetails[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface VerificationStats {
  totalVerifications: number;
  byLevel: {
    level0: number;
    level1: number;
    level2: number;
    level3: number;
  };
  byStatus: {
    pending: number;
    assigned: number;
    inProgress: number;
    completed: number;
    approved: number;
    rejected: number;
  };
  totalRevenue: number; // in cents
  averageScore: number;
}

export interface VerifierStats {
  totalVerifications: number;
  totalEarnings: number; // in cents
  approvalRate: number; // 0-100
  averageScore: number; // 0-100
  pendingPayouts: number; // in cents
}

export interface RequestVerificationInput {
  productId: string;
  level: VerificationLevel;
}

export interface SubmitReviewInput {
  score: number;
  comments: string;
  approved: boolean;
  badges: string[];
  improvements: string[];
  strengths?: string[];
  weaknesses?: string[];
}

export const VERIFICATION_LEVELS = {
  0: {
    name: 'Automatic',
    price: 0,
    features: ['File format check', 'Basic virus scan', 'Metadata validation'],
    badge: 'Verified',
    color: 'bg-gray-500',
    comingSoon: false,
  },
  1: {
    name: 'Basic Review',
    price: 50,
    features: [
      'All Level 0',
      'Code quality check',
      'Documentation review',
      'Manual review',
    ],
    badge: 'Reviewed',
    color: 'bg-blue-500',
    comingSoon: false,
  },
  2: {
    name: 'Expert Review',
    price: 150, // $150
    features: [
      'All Level 1',
      'Deep code review',
      'Security check',
      'Performance test',
    ],
    badge: 'Expert',
    color: 'bg-purple-500',
    comingSoon: true,
  },
  3: {
    name: 'Security Audit',
    price: 500, // $500
    features: [
      'All Level 2',
      'Security audit',
      'Load testing',
      'Priority support',
    ],
    badge: 'Premium',
    color: 'bg-yellow-600',
    comingSoon: true,
  },
} as const;

export const VERIFICATION_STATUS_INFO = {
  PENDING: { text: 'Pending Assignment', color: 'yellow', step: 1 },
  ASSIGNED: { text: 'Assigned to Verifier', color: 'blue', step: 2 },
  IN_PROGRESS: { text: 'Under Review', color: 'blue', step: 3 },
  COMPLETED: { text: 'Review Complete', color: 'green', step: 4 },
  APPROVED: { text: 'Approved', color: 'green', step: 5 },
  REJECTED: { text: 'Rejected', color: 'red', step: 5 },
  CANCELLED: { text: 'Cancelled', color: 'gray', step: 0 },
} as const;
