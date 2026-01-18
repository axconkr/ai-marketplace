/**
 * Verification System Types
 */

import { VerificationStatus } from '@prisma/client';

// ============================================================================
// VERIFICATION REPORT TYPES
// ============================================================================

export interface VerificationReport {
  level: number;
  timestamp: string;
  passed: boolean;
  score: number;
  checks?: Level0Checks;
  automated?: AutomatedTests;
  manual?: ManualReview;
  finalScore?: number;
}

// Level 0: Automatic checks
export interface Level0Checks {
  fileFormat: CheckResult;
  fileSize: CheckResult;
  virusScan: CheckResult;
  metadata: CheckResult;
  description: CheckResult;
}

export interface CheckResult {
  passed: boolean;
  message: string;
  details?: any;
}

// Level 1: Automated tests
export interface AutomatedTests {
  codeQuality: CodeQualityResult;
  documentation: DocumentationResult;
  dependencies: DependencyResult;
  structure: StructureResult;
}

export interface CodeQualityResult {
  passed: boolean;
  score: number;
  issues: {
    longFunctions: number;
    complexFunctions: number;
    missingComments: number;
    codeSmells: string[];
  };
}

export interface DocumentationResult {
  passed: boolean;
  score: number;
  issues: {
    missingReadme: boolean;
    shortDescription: boolean;
  };
}

export interface DependencyResult {
  passed: boolean;
  score: number;
  issues: {
    vulnerabilities: number;
    outdatedPackages: number;
    missingPackageJson: boolean;
  };
}

export interface StructureResult {
  passed: boolean;
  score: number;
  issues: {
    missingTests: boolean;
    poorOrganization: boolean;
    missingConfig: boolean;
  };
}

// Manual review
export interface ManualReview {
  approved: boolean;
  score: number; // 0-100
  comments: string;
  badges?: string[]; // ["quality", "security", "documentation"]
  improvements?: string[];
  reviewedBy: string;
  reviewedAt: string;
}

// ============================================================================
// SERVICE TYPES
// ============================================================================

export interface VerificationFees {
  0: number;
  1: number;
  2: number;
  3: number;
}

export interface CreateVerificationParams {
  productId: string;
  level: number;
  sellerId: string;
}

export interface AssignVerificationParams {
  verificationId: string;
  verifierId: string;
}

export interface SubmitReviewParams {
  verificationId: string;
  verifierId: string;
  review: ManualReview;
}

export interface VerificationFilter {
  status?: VerificationStatus;
  level?: number;
  verifierId?: string;
  productId?: string;
}

export interface VerificationListParams extends VerificationFilter {
  page?: number;
  limit?: number;
}

// ============================================================================
// PAYMENT TYPES
// ============================================================================

export interface VerificationPayment {
  amount: number;
  currency: string;
  customerId: string;
  description: string;
  metadata: {
    productId: string;
    level: number;
    type: string;
  };
}

export interface VerifierPayout {
  verifierId: string;
  amount: number;
  verificationId: string;
  period_start: Date;
  period_end: Date;
}
