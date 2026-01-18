/**
 * Level 0: Automatic Verification
 * Free, automated checks only (file format, virus scan, metadata)
 */

import { prisma } from '@/lib/db';
import { promises as fs } from 'fs';
import type {
  VerificationReport,
  Level0Checks,
  CheckResult,
} from './types';

// ============================================================================
// CONSTANTS
// ============================================================================

const ALLOWED_EXTENSIONS = [
  '.zip', '.tar', '.gz', '.rar',
  '.json', '.yaml', '.yml',
  '.js', '.ts', '.jsx', '.tsx',
  '.py', '.rb', '.go', '.java',
  '.md', '.txt', '.pdf',
  '.ipynb', '.csv',
];

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
const MIN_DESCRIPTION_LENGTH = 50;
const MIN_TITLE_LENGTH = 10;

// Suspicious patterns for basic security check
const SUSPICIOUS_PATTERNS = [
  /eval\s*\(/gi,
  /exec\s*\(/gi,
  /<script[^>]*>/gi,
  /document\.write/gi,
  /innerHTML\s*=/gi,
  /dangerouslySetInnerHTML/gi,
  /system\s*\(/gi,
  /shell_exec/gi,
  /passthru/gi,
];

// ============================================================================
// MAIN VERIFICATION FUNCTION
// ============================================================================

/**
 * Run Level 0 automatic verification
 */
export async function runLevel0Verification(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      files: true,
      seller: true,
    },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  // Run all checks in parallel
  const [fileFormat, fileSize, virusScan, metadata, description] = await Promise.all([
    checkFileFormat(product.files),
    checkFileSize(product.files),
    scanForViruses(product.files),
    validateMetadata(product),
    checkDescription(product.description),
  ]);

  const checks: Level0Checks = {
    fileFormat,
    fileSize,
    virusScan,
    metadata,
    description,
  };

  // Determine if all checks passed
  const passed = Object.values(checks).every((check) => check.passed);

  // Calculate score (0-100)
  const score = calculateScore(checks);

  const report: VerificationReport = {
    level: 0,
    checks,
    score,
    passed,
    timestamp: new Date().toISOString(),
  };

  // Create verification record
  const verification = await prisma.verification.create({
    data: {
      product_id: productId,
      level: 0,
      fee: 0,
      platform_share: 0,
      verifier_share: 0,
      status: passed ? 'APPROVED' : 'REJECTED',
      report: report as any,
      score,
      completed_at: new Date(),
    },
  });

  // Update product
  await prisma.product.update({
    where: { id: productId },
    data: {
      verification_level: passed ? 0 : -1,
      verification_score: score,
    },
  });

  return verification;
}

// ============================================================================
// CHECK FUNCTIONS
// ============================================================================

/**
 * Check file format validity
 */
async function checkFileFormat(files: any[]): Promise<CheckResult> {
  if (!files || files.length === 0) {
    return {
      passed: false,
      message: 'No files uploaded',
      details: { invalidFiles: [] },
    };
  }

  const invalidFiles = files.filter(
    (file) => !ALLOWED_EXTENSIONS.some((ext) => file.filename.toLowerCase().endsWith(ext))
  );

  return {
    passed: invalidFiles.length === 0,
    message:
      invalidFiles.length > 0
        ? `Invalid file formats: ${invalidFiles.map((f) => f.filename).join(', ')}`
        : 'All files have valid formats',
    details: {
      totalFiles: files.length,
      invalidFiles: invalidFiles.map((f) => f.filename),
      allowedExtensions: ALLOWED_EXTENSIONS,
    },
  };
}

/**
 * Check file size limits
 */
async function checkFileSize(files: any[]): Promise<CheckResult> {
  const oversizedFiles = files.filter((file) => file.size > MAX_FILE_SIZE);
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  return {
    passed: oversizedFiles.length === 0,
    message:
      oversizedFiles.length > 0
        ? `${oversizedFiles.length} file(s) exceed size limit`
        : 'All files within size limits',
    details: {
      totalSize,
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
      maxSizeMB: MAX_FILE_SIZE / (1024 * 1024),
      oversizedFiles: oversizedFiles.map((f) => ({
        filename: f.filename,
        size: f.size,
        sizeMB: (f.size / (1024 * 1024)).toFixed(2),
      })),
    },
  };
}

/**
 * Basic virus/malware scanning
 * In production: integrate with ClamAV or cloud antivirus
 */
async function scanForViruses(files: any[]): Promise<CheckResult> {
  const threats: Array<{ file: string; pattern: string; line?: number }> = [];

  for (const file of files) {
    // Only scan text-based files
    const isTextFile = ['.js', '.ts', '.jsx', '.tsx', '.py', '.rb', '.go', '.java', '.txt', '.md', '.json', '.yaml', '.yml'].some(
      (ext) => file.filename.toLowerCase().endsWith(ext)
    );

    if (!isTextFile) continue;

    try {
      const content = await readFileContent(file.path);
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        for (const pattern of SUSPICIOUS_PATTERNS) {
          if (pattern.test(lines[i])) {
            threats.push({
              file: file.filename,
              pattern: pattern.source,
              line: i + 1,
            });
          }
        }
      }
    } catch (error) {
      // Skip files that can't be read
      console.error(`Failed to scan file ${file.filename}:`, error);
    }
  }

  return {
    passed: threats.length === 0,
    message:
      threats.length > 0
        ? `${threats.length} potential security issue(s) detected`
        : 'No security threats detected',
    details: {
      threatsFound: threats.length,
      threats: threats.slice(0, 10), // Limit to first 10
      patternsScanned: SUSPICIOUS_PATTERNS.map((p) => p.source),
    },
  };
}

/**
 * Validate product metadata
 */
async function validateMetadata(product: any): Promise<CheckResult> {
  const issues: string[] = [];

  if (!product.name || product.name.length < MIN_TITLE_LENGTH) {
    issues.push(`Title too short (min ${MIN_TITLE_LENGTH} characters)`);
  }

  if (!product.description || product.description.length < MIN_DESCRIPTION_LENGTH) {
    issues.push(`Description too short (min ${MIN_DESCRIPTION_LENGTH} characters)`);
  }

  if (!product.category) {
    issues.push('Category required');
  }

  if (!product.price || product.price <= 0) {
    issues.push('Valid price required');
  }

  return {
    passed: issues.length === 0,
    message: issues.length > 0 ? `${issues.length} metadata issue(s)` : 'Metadata valid',
    details: {
      issues,
      titleLength: product.name?.length || 0,
      descriptionLength: product.description?.length || 0,
      hasCategory: !!product.category,
      hasPrice: !!product.price,
    },
  };
}

/**
 * Check description quality
 */
async function checkDescription(description: string | null): Promise<CheckResult> {
  if (!description) {
    return {
      passed: false,
      message: 'Description is required',
      details: { length: 0 },
    };
  }

  const wordCount = description.split(/\s+/).length;
  const hasCodeBlock = /```/.test(description);
  const hasLinks = /https?:\/\//.test(description);

  return {
    passed: description.length >= MIN_DESCRIPTION_LENGTH && wordCount >= 10,
    message:
      description.length >= MIN_DESCRIPTION_LENGTH
        ? 'Description is adequate'
        : 'Description too short',
    details: {
      length: description.length,
      wordCount,
      hasCodeBlock,
      hasLinks,
      minLength: MIN_DESCRIPTION_LENGTH,
    },
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate overall score from checks
 */
function calculateScore(checks: Level0Checks): number {
  const weights = {
    fileFormat: 25,
    fileSize: 15,
    virusScan: 30,
    metadata: 20,
    description: 10,
  };

  let score = 0;
  Object.entries(checks).forEach(([key, check]) => {
    if (check.passed) {
      score += weights[key as keyof typeof weights];
    }
  });

  return score;
}

/**
 * Read file content
 */
async function readFileContent(filePath: string): Promise<string> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    console.error(`Failed to read file ${filePath}:`, error);
    return '';
  }
}
