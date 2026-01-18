/**
 * Verification Services - Main Export
 */

// Level-specific verification
export { runLevel0Verification } from './level0';
export { requestLevel1Verification, assignLevel1Verification } from './level1';

// Review and workflow
export {
  startVerificationReview,
  submitVerificationReview,
  cancelVerification,
  getVerificationForReview,
  listAvailableVerifications,
} from './review';

// Claim logic
export {
  claimVerification,
  canClaimVerification,
  getClaimedVerifications,
  unclaimVerification,
} from './claim';

// Payment and payouts
export {
  processVerificationFee,
  confirmVerificationPayment,
  createVerifierPayout,
  processVerifierPayouts,
  getVerifierEarnings,
  getVerifierStats,
  calculateVerificationFee,
  VERIFICATION_FEES,
} from './payment';

// Utilities
export {
  isVerificationInProgress,
  isVerificationCompleted,
  canCancelVerification,
  getStatusMessage,
  getReportScore,
  getReportIssues,
  getVerificationSummary,
  getBadgeDisplayName,
  getBadgeVariant,
  getLevelDisplayName,
  getLevelDescription,
  getLevelFeatures,
  formatVerificationFee,
  formatVerificationDate,
  getTimeElapsed,
  isValidVerificationLevel,
  isValidVerificationScore,
  isValidBadge,
} from './utils';

// Types
export type {
  VerificationReport,
  Level0Checks,
  CheckResult,
  AutomatedTests,
  CodeQualityResult,
  DocumentationResult,
  DependencyResult,
  StructureResult,
  ManualReview,
  VerificationFees,
  CreateVerificationParams,
  AssignVerificationParams,
  SubmitReviewParams,
  VerificationFilter,
  VerificationListParams,
  VerificationPayment,
  VerifierPayout,
} from './types';
