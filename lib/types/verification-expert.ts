/**
 * Verification Expert Types for Level 3 4-Expert System
 */

export type ExpertType = 'DESIGN' | 'PLANNING' | 'DEVELOPMENT' | 'DOMAIN';

export type ExpertReviewStatus =
  | 'PENDING'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'REJECTED';

export interface ExpertReview {
  id: string;
  verification_id: string;
  expert_id: string | null;
  expert_type: ExpertType;
  status: ExpertReviewStatus;
  fee: number; // in cents
  platform_share: number; // in cents
  expert_share: number; // in cents
  report: ExpertReport | null;
  score: number | null;
  feedback: string | null;
  requested_at: Date | string;
  assigned_at: Date | string | null;
  reviewed_at: Date | string | null;
  completed_at: Date | string | null;
}

export interface ExpertReport {
  criteria: ExpertCriteria[];
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  detailedFeedback: string;
}

export interface ExpertCriteria {
  name: string;
  score: number; // 0-100
  comment: string;
}

export interface VerificationWithExperts {
  id: string;
  product_id: string;
  verifier_id: string | null;
  level: number;
  status: string;
  fee: number;
  platform_share: number;
  verifier_share: number;
  report: any;
  score: number | null;
  badges: string[];
  requested_at: Date | string;
  assigned_at: Date | string | null;
  reviewed_at: Date | string | null;
  completed_at: Date | string | null;
  product: {
    id: string;
    name: string;
    thumbnail_url: string | null;
    seller_id: string;
  };
  expertReviews?: ExpertReview[];
}

export const EXPERT_TYPES: Record<
  ExpertType,
  {
    name: string;
    nameKo: string;
    icon: string;
    description: string;
    color: string;
    bgColor: string;
  }
> = {
  DESIGN: {
    name: 'Design Expert',
    nameKo: '디자인 전문가',
    icon: '🎨',
    description: 'UI/UX, 비주얼 디자인, 사용자 경험 평가',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
  },
  PLANNING: {
    name: 'Planning Expert',
    nameKo: '기획 전문가',
    icon: '📋',
    description: '제품 기획, 비즈니스 로직, 사용자 시나리오 평가',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  DEVELOPMENT: {
    name: 'Development Expert',
    nameKo: '개발 전문가',
    icon: '💻',
    description: '코드 품질, 아키텍처, 성능, 보안 평가',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  DOMAIN: {
    name: 'Domain Expert',
    nameKo: '도메인 전문가',
    icon: '🎯',
    description: '산업별 전문성, 시장 적합성, 실용성 평가',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
};

export const EXPERT_REVIEW_STATUS_INFO: Record<
  ExpertReviewStatus,
  { text: string; textKo: string; color: string }
> = {
  PENDING: { text: 'Pending', textKo: '대기중', color: 'gray' },
  ASSIGNED: { text: 'Assigned', textKo: '배정됨', color: 'blue' },
  IN_PROGRESS: { text: 'In Progress', textKo: '진행중', color: 'yellow' },
  COMPLETED: { text: 'Completed', textKo: '완료', color: 'green' },
  REJECTED: { text: 'Rejected', textKo: '거절됨', color: 'red' },
};

export const VERIFICATION_LEVEL_INFO = {
  0: {
    name: '자동 검증',
    nameEn: 'Automatic',
    description: '기본 파일 형식 및 바이러스 검사',
    badge: '검증됨',
    badgeEn: 'Verified',
    color: 'bg-gray-500',
    textColor: 'text-gray-700',
    bgColor: 'bg-gray-50',
    features: ['파일 형식 검사', '바이러스 스캔', '메타데이터 검증'],
    fee: 0,
  },
  1: {
    name: '기본 검수',
    nameEn: 'Basic Review',
    description: '전문가 1명의 기본 검수',
    badge: '검수완료',
    badgeEn: 'Reviewed',
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    features: [
      'Level 0 포함',
      '코드 품질 검사',
      '문서화 검토',
      '전문가 1인 검수',
    ],
    fee: 5000, // 50 USD in cents
  },
  2: {
    name: '심화 검수',
    nameEn: 'Expert Review',
    description: '전문가 2명의 심화 검수',
    badge: '전문가 검수',
    badgeEn: 'Expert',
    color: 'bg-purple-500',
    textColor: 'text-purple-700',
    bgColor: 'bg-purple-50',
    features: [
      'Level 1 포함',
      '심화 코드 리뷰',
      '보안 검사',
      '성능 테스트',
      '전문가 2인 검수',
    ],
    fee: 15000, // 150 USD in cents
  },
  3: {
    name: '프리미엄 감사',
    nameEn: 'Premium Audit',
    description: '4개 분야 전문가의 종합 감사',
    badge: '프리미엄',
    badgeEn: 'Premium',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    features: [
      'Level 2 포함',
      '4개 분야 전문가 검수',
      '디자인 전문가',
      '기획 전문가',
      '개발 전문가',
      '도메인 전문가',
      '보안 감사',
      '부하 테스트',
      '우선 지원',
    ],
    fee: 50000, // 500 USD in cents
  },
};
