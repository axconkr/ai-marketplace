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
    name: '자동 검증',
    price: 0,
    features: ['파일 형식 검사', '기본 바이러스 검사', '메타데이터 검증'],
    badge: '검증됨',
    color: 'bg-gray-500',
    comingSoon: false,
  },
  1: {
    name: '기본 검증',
    price: 50,
    features: [
      '자동 검증 포함',
      '코드 품질 검사',
      '문서 검토',
      '수동 리뷰',
    ],
    badge: '리뷰됨',
    color: 'bg-blue-500',
    comingSoon: false,
  },
  2: {
    name: '전문가 검증',
    price: 150, // $150
    features: [
      '기본 검증 포함',
      '심층 코드 리뷰',
      '보안 검사',
      '성능 테스트',
    ],
    badge: '전문가',
    color: 'bg-purple-500',
    comingSoon: true,
  },
  3: {
    name: '보안 감사',
    price: 500, // $500
    features: [
      '전문가 검증 포함',
      '보안 감사',
      '부하 테스트',
      '우선 지원',
    ],
    badge: '프리미엄',
    color: 'bg-yellow-600',
    comingSoon: true,
  },
} as const;

export const VERIFICATION_STATUS_INFO = {
  PENDING: { text: '배정 대기', color: 'yellow', step: 1 },
  ASSIGNED: { text: '검증자 배정됨', color: 'blue', step: 2 },
  IN_PROGRESS: { text: '검증 진행중', color: 'blue', step: 3 },
  COMPLETED: { text: '검증 완료', color: 'green', step: 4 },
  APPROVED: { text: '승인됨', color: 'green', step: 5 },
  REJECTED: { text: '거부됨', color: 'red', step: 5 },
  CANCELLED: { text: '취소됨', color: 'gray', step: 0 },
} as const;
