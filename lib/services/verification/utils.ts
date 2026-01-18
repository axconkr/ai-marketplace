/**
 * Verification Utility Functions
 */

import { VerificationStatus } from '@prisma/client';
import type { VerificationReport } from './types';

// ============================================================================
// STATUS HELPERS
// ============================================================================

/**
 * Check if verification is in progress
 */
export function isVerificationInProgress(status: VerificationStatus): boolean {
  return ['PENDING', 'ASSIGNED', 'IN_PROGRESS'].includes(status);
}

/**
 * Check if verification is completed
 */
export function isVerificationCompleted(status: VerificationStatus): boolean {
  return ['APPROVED', 'REJECTED', 'COMPLETED'].includes(status);
}

/**
 * Check if verification can be cancelled
 */
export function canCancelVerification(status: VerificationStatus): boolean {
  return ['PENDING', 'ASSIGNED', 'IN_PROGRESS'].includes(status);
}

/**
 * Get user-friendly status message
 */
export function getStatusMessage(status: VerificationStatus): string {
  const messages: Record<VerificationStatus, string> = {
    PENDING: 'Awaiting verifier assignment',
    ASSIGNED: 'Assigned to verifier',
    IN_PROGRESS: 'Review in progress',
    COMPLETED: 'Verification completed',
    APPROVED: 'Product approved',
    REJECTED: 'Product rejected',
    CANCELLED: 'Verification cancelled',
  };

  return messages[status] || 'Unknown status';
}

// ============================================================================
// REPORT HELPERS
// ============================================================================

/**
 * Extract score from verification report
 */
export function getReportScore(report: any): number {
  if (!report) return 0;

  // Check for final score
  if (report.finalScore !== undefined) {
    return report.finalScore;
  }

  // Check for direct score (Level 0)
  if (report.score !== undefined) {
    return report.score;
  }

  return 0;
}

/**
 * Get issues from verification report
 */
export function getReportIssues(report: any): string[] {
  const issues: string[] = [];

  if (!report) return issues;

  // Level 0 checks
  if (report.checks) {
    Object.entries(report.checks).forEach(([key, check]: [string, any]) => {
      if (!check.passed) {
        issues.push(`${key}: ${check.message}`);
      }
    });
  }

  // Level 1+ automated tests
  if (report.automated) {
    const { codeQuality, documentation, dependencies, structure } = report.automated;

    if (codeQuality && !codeQuality.passed) {
      issues.push(`Code quality issues detected (score: ${codeQuality.score})`);
    }

    if (documentation && !documentation.passed) {
      issues.push('Documentation insufficient');
    }

    if (dependencies && !dependencies.passed) {
      issues.push('Dependency issues detected');
    }

    if (structure && !structure.passed) {
      issues.push('Project structure issues');
    }
  }

  // Manual review improvements
  if (report.manual && report.manual.improvements) {
    issues.push(...report.manual.improvements);
  }

  return issues;
}

/**
 * Get verification summary from report
 */
export function getVerificationSummary(report: any): {
  score: number;
  passed: boolean;
  issueCount: number;
  badges: string[];
} {
  const score = getReportScore(report);
  const issues = getReportIssues(report);
  const passed = report?.passed || report?.manual?.approved || false;
  const badges = report?.badges || [];

  return {
    score,
    passed,
    issueCount: issues.length,
    badges,
  };
}

// ============================================================================
// BADGE HELPERS
// ============================================================================

/**
 * Get badge display name
 */
export function getBadgeDisplayName(badge: string): string {
  const names: Record<string, string> = {
    quality: 'High Quality',
    security: 'Security Verified',
    performance: 'Performance Optimized',
    documentation: 'Well Documented',
    accessibility: 'Accessibility Compliant',
    testing: 'Well Tested',
  };

  return names[badge] || badge;
}

/**
 * Get badge color/variant
 */
export function getBadgeVariant(badge: string): string {
  const variants: Record<string, string> = {
    quality: 'success',
    security: 'danger',
    performance: 'warning',
    documentation: 'info',
    accessibility: 'primary',
    testing: 'secondary',
  };

  return variants[badge] || 'default';
}

// ============================================================================
// LEVEL HELPERS
// ============================================================================

/**
 * Get verification level display name
 */
export function getLevelDisplayName(level: number): string {
  const names: Record<number, string> = {
    0: 'Basic (Free)',
    1: 'Standard ($50)',
    2: 'Expert ($150)',
    3: 'Premium ($500)',
  };

  return names[level] || `Level ${level}`;
}

/**
 * Get level description
 */
export function getLevelDescription(level: number): string {
  const descriptions: Record<number, string> = {
    0: 'Automatic checks: file format, virus scan, metadata validation',
    1: 'Automated tests + basic manual review: code quality, documentation, dependencies',
    2: 'Expert code review: architecture, best practices, security patterns',
    3: 'Comprehensive audit: security testing, performance analysis, load testing',
  };

  return descriptions[level] || '';
}

/**
 * Get level features
 */
export function getLevelFeatures(level: number): string[] {
  const features: Record<number, string[]> = {
    0: [
      'File format validation',
      'Virus/malware scanning',
      'Metadata verification',
      'Basic description check',
    ],
    1: [
      'All Level 0 checks',
      'Code quality analysis',
      'Documentation review',
      'Dependency check',
      'Project structure validation',
      'Manual review by verifier',
    ],
    2: [
      'All Level 1 checks',
      'Expert code review',
      'Architecture analysis',
      'Security pattern review',
      'Best practices validation',
      'Performance recommendations',
    ],
    3: [
      'All Level 2 checks',
      'Comprehensive security audit',
      'Performance testing',
      'Load testing',
      'Compliance verification',
      'Production readiness assessment',
    ],
  };

  return features[level] || [];
}

// ============================================================================
// FORMATTING HELPERS
// ============================================================================

/**
 * Format verification fee
 */
export function formatVerificationFee(fee: number, currency: string = 'USD'): string {
  const amount = fee / 100; // Convert cents to dollars
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format verification date
 */
export function formatVerificationDate(date: Date | string | null): string {
  if (!date) return 'N/A';

  const d = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Calculate time elapsed since date
 */
export function getTimeElapsed(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  }

  if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  }

  return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate verification level
 */
export function isValidVerificationLevel(level: number): boolean {
  return [0, 1, 2, 3].includes(level);
}

/**
 * Validate verification score
 */
export function isValidVerificationScore(score: number): boolean {
  return typeof score === 'number' && score >= 0 && score <= 100;
}

/**
 * Validate badge name
 */
export function isValidBadge(badge: string): boolean {
  const validBadges = [
    'quality',
    'security',
    'performance',
    'documentation',
    'accessibility',
    'testing',
  ];

  return validBadges.includes(badge);
}
