/**
 * Level 1: Basic Verification
 * $50 fee, automated tests + basic manual review
 */

import { prisma } from '@/lib/db';
import { runLevel0Verification } from './level0';
import { sendVerificationAssignment } from '../email-notifications';
import type { AutomatedTests, VerificationReport } from './types';
import { promises as fs } from 'fs';

// ============================================================================
// CONSTANTS
// ============================================================================

const LEVEL1_FEE = 5000; // $50 in cents
const PLATFORM_SHARE_RATE = 0.3; // 30%
const VERIFIER_SHARE_RATE = 0.7; // 70%

const MAX_FUNCTION_LENGTH = 50;
const MIN_COMMENT_RATIO = 0.1;
const MIN_README_LENGTH = 100;

// ============================================================================
// MAIN VERIFICATION FUNCTION
// ============================================================================

/**
 * Request Level 1 verification
 * Runs Level 0 checks + automated tests, then assigns to verifier
 */
export async function requestLevel1Verification(
  productId: string,
  verifierId?: string
) {
  // 1. Run Level 0 checks first
  const level0Result = await runLevel0Verification(productId);

  if (level0Result.status !== 'APPROVED') {
    throw new Error('Product failed Level 0 verification. Please fix issues first.');
  }

  // 2. Get product with files
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { files: true },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  // 3. Run automated tests
  const automatedTests = await runAutomatedTests(product);

  // 4. Create verification record
  const platformShare = Math.round(LEVEL1_FEE * PLATFORM_SHARE_RATE);
  const verifierShare = Math.round(LEVEL1_FEE * VERIFIER_SHARE_RATE);

  const verification = await prisma.verification.create({
    data: {
      product_id: productId,
      verifier_id: verifierId,
      level: 1,
      fee: LEVEL1_FEE,
      platform_share: platformShare,
      verifier_share: verifierShare,
      status: verifierId ? 'ASSIGNED' : 'PENDING',
      report: {
        level: 1,
        automated: automatedTests,
        manual: null,
        timestamp: new Date().toISOString(),
      } as any,
      assigned_at: verifierId ? new Date() : null,
    },
  });

  // 5. Notify verifier if assigned
  if (verifierId) {
    await sendVerificationAssignment(verifierId, verification.id);
  }

  return verification;
}

/**
 * Assign verification to a verifier
 */
export async function assignLevel1Verification(
  verificationId: string,
  verifierId: string
) {
  const verification = await prisma.verification.findUnique({
    where: { id: verificationId },
  });

  if (!verification) {
    throw new Error('Verification not found');
  }

  if (verification.level !== 1) {
    throw new Error('Not a Level 1 verification');
  }

  if (verification.status !== 'PENDING') {
    throw new Error('Verification not available for assignment');
  }

  // Update verification
  const updated = await prisma.verification.update({
    where: { id: verificationId },
    data: {
      verifier_id: verifierId,
      status: 'ASSIGNED',
      assigned_at: new Date(),
    },
  });

  // Notify verifier
  await sendVerificationAssignment(verifierId, verificationId);

  return updated;
}

// ============================================================================
// AUTOMATED TESTS
// ============================================================================

/**
 * Run all automated tests for Level 1
 */
async function runAutomatedTests(product: any): Promise<AutomatedTests> {
  const [codeQuality, documentation, dependencies, structure] = await Promise.all([
    checkCodeQuality(product.files),
    checkDocumentation(product),
    checkDependencies(product.files),
    checkProjectStructure(product.files),
  ]);

  return {
    codeQuality,
    documentation,
    dependencies,
    structure,
  };
}

/**
 * Check code quality
 */
async function checkCodeQuality(files: any[]) {
  const codeFiles = files.filter((f) =>
    /\.(js|ts|jsx|tsx|py|rb|go|java)$/.test(f.filename)
  );

  const issues = {
    longFunctions: 0,
    complexFunctions: 0,
    missingComments: 0,
    codeSmells: [] as string[],
  };

  for (const file of codeFiles) {
    try {
      const content = await readFileContent(file.path);
      const lines = content.split('\n');

      // Check for long functions
      let functionStart = -1;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Detect function start
        if (
          /function\s+\w+|def\s+\w+|const\s+\w+\s*=\s*\(|const\s+\w+\s*=\s*async/.test(
            line
          )
        ) {
          if (functionStart !== -1 && i - functionStart > MAX_FUNCTION_LENGTH) {
            issues.longFunctions++;
          }
          functionStart = i;
        }
      }

      // Check comment ratio
      const commentLines = lines.filter((l) =>
        /^\s*(\/\/|#|\/\*)/.test(l)
      ).length;
      const codeLines = lines.filter((l) => l.trim().length > 0).length;
      const commentRatio = codeLines > 0 ? commentLines / codeLines : 0;

      if (commentRatio < MIN_COMMENT_RATIO) {
        issues.missingComments++;
      }

      // Check for code smells
      if (/console\.log/.test(content)) {
        issues.codeSmells.push(`${file.filename}: console.log statements found`);
      }
      if (/debugger/.test(content)) {
        issues.codeSmells.push(`${file.filename}: debugger statements found`);
      }
      if (/TODO|FIXME|HACK/.test(content)) {
        issues.codeSmells.push(`${file.filename}: TODO/FIXME/HACK comments found`);
      }
    } catch (error) {
      console.error(`Failed to analyze ${file.filename}:`, error);
    }
  }

  // Calculate score
  const penalties =
    issues.longFunctions * 5 +
    issues.missingComments * 10 +
    issues.codeSmells.length * 3;
  const score = Math.max(0, 100 - penalties);

  return {
    passed: score >= 70,
    score,
    issues,
  };
}

/**
 * Check documentation
 */
async function checkDocumentation(product: any) {
  const hasReadme = product.files.some((f: any) =>
    /readme/i.test(f.filename)
  );

  let readmeLength = 0;
  if (hasReadme) {
    const readmeFile = product.files.find((f: any) =>
      /readme/i.test(f.filename)
    );
    if (readmeFile) {
      try {
        const content = await readFileContent(readmeFile.path);
        readmeLength = content.length;
      } catch (error) {
        console.error('Failed to read README:', error);
      }
    }
  }

  const descriptionLength = product.description?.length || 0;

  const issues = {
    missingReadme: !hasReadme,
    shortDescription: descriptionLength < MIN_README_LENGTH,
  };

  const score = (hasReadme ? 50 : 0) + (descriptionLength >= MIN_README_LENGTH ? 50 : 0);

  return {
    passed: hasReadme && descriptionLength >= MIN_README_LENGTH,
    score,
    issues,
  };
}

/**
 * Check dependencies
 */
async function checkDependencies(files: any[]) {
  const packageJson = files.find(
    (f) => f.filename === 'package.json' || f.filename.endsWith('/package.json')
  );

  const requirementsTxt = files.find(
    (f) => f.filename === 'requirements.txt' || f.filename.endsWith('/requirements.txt')
  );

  const goMod = files.find(
    (f) => f.filename === 'go.mod' || f.filename.endsWith('/go.mod')
  );

  const issues = {
    vulnerabilities: 0,
    outdatedPackages: 0,
    missingPackageJson: !packageJson && !requirementsTxt && !goMod,
  };

  // Basic check - in production, use npm audit or similar
  if (packageJson) {
    try {
      const content = await readFileContent(packageJson.path);
      const pkg = JSON.parse(content);

      // Check for known vulnerable packages (simplified)
      const dependencies = { ...pkg.dependencies, ...pkg.devDependencies };
      const vulnerablePackages = ['event-stream', 'flatmap-stream'];

      for (const dep of Object.keys(dependencies)) {
        if (vulnerablePackages.includes(dep)) {
          issues.vulnerabilities++;
        }
      }
    } catch (error) {
      console.error('Failed to parse package.json:', error);
    }
  }

  const score = issues.missingPackageJson ? 50 : 100 - issues.vulnerabilities * 20;

  return {
    passed: score >= 70,
    score,
    issues,
  };
}

/**
 * Check project structure
 */
async function checkProjectStructure(files: any[]) {
  const hasTests = files.some(
    (f) =>
      /test|spec|__tests__/.test(f.filename) ||
      /\.(test|spec)\.(js|ts|py)$/.test(f.filename)
  );

  const hasConfig = files.some((f) =>
    /package\.json|requirements\.txt|go\.mod|Cargo\.toml/.test(f.filename)
  );

  const hasLicense = files.some((f) => /license/i.test(f.filename));

  const issues = {
    missingTests: !hasTests,
    poorOrganization: files.length < 3,
    missingConfig: !hasConfig,
  };

  const score =
    (hasTests ? 40 : 0) +
    (hasConfig ? 40 : 0) +
    (hasLicense ? 20 : 0);

  return {
    passed: score >= 60,
    score,
    issues,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

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
