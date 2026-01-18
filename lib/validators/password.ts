/**
 * Password Validation Utilities
 * Validate password strength and requirements
 */

import { z } from 'zod';

/**
 * Password strength levels
 */
export enum PasswordStrength {
  WEAK = 'weak',
  MEDIUM = 'medium',
  STRONG = 'strong',
  VERY_STRONG = 'very_strong',
}

/**
 * Password validation requirements
 */
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
  specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?',
} as const;

/**
 * Password validation regex patterns
 */
const PASSWORD_PATTERNS = {
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  number: /[0-9]/,
  specialChar: /[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/,
} as const;

/**
 * Validate password meets all requirements
 * @param password - Password to validate
 * @returns Object with validation results
 */
export function validatePasswordRequirements(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters`);
  }

  if (password.length > PASSWORD_REQUIREMENTS.maxLength) {
    errors.push(`Password must not exceed ${PASSWORD_REQUIREMENTS.maxLength} characters`);
  }

  if (PASSWORD_REQUIREMENTS.requireUppercase && !PASSWORD_PATTERNS.uppercase.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (PASSWORD_REQUIREMENTS.requireLowercase && !PASSWORD_PATTERNS.lowercase.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (PASSWORD_REQUIREMENTS.requireNumber && !PASSWORD_PATTERNS.number.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (PASSWORD_REQUIREMENTS.requireSpecialChar && !PASSWORD_PATTERNS.specialChar.test(password)) {
    errors.push(`Password must contain at least one special character (${PASSWORD_REQUIREMENTS.specialChars})`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate password strength score (0-100)
 * @param password - Password to evaluate
 * @returns Strength score
 */
export function calculatePasswordScore(password: string): number {
  let score = 0;

  // Length scoring (0-40 points)
  if (password.length >= 8) score += 10;
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;
  if (password.length >= 20) score += 10;

  // Character variety (0-40 points)
  if (PASSWORD_PATTERNS.lowercase.test(password)) score += 10;
  if (PASSWORD_PATTERNS.uppercase.test(password)) score += 10;
  if (PASSWORD_PATTERNS.number.test(password)) score += 10;
  if (PASSWORD_PATTERNS.specialChar.test(password)) score += 10;

  // Complexity (0-20 points)
  const uniqueChars = new Set(password).size;
  if (uniqueChars >= 8) score += 10;
  if (uniqueChars >= 12) score += 10;

  return Math.min(score, 100);
}

/**
 * Determine password strength level
 * @param password - Password to evaluate
 * @returns Strength level
 */
export function getPasswordStrength(password: string): PasswordStrength {
  const score = calculatePasswordScore(password);

  if (score >= 80) return PasswordStrength.VERY_STRONG;
  if (score >= 60) return PasswordStrength.STRONG;
  if (score >= 40) return PasswordStrength.MEDIUM;
  return PasswordStrength.WEAK;
}

/**
 * Get password strength details
 * @param password - Password to evaluate
 * @returns Strength details with score, level, and color
 */
export function getPasswordStrengthDetails(password: string): {
  score: number;
  level: PasswordStrength;
  label: string;
  color: string;
  percentage: number;
} {
  const score = calculatePasswordScore(password);
  const level = getPasswordStrength(password);

  const strengthLabels: Record<PasswordStrength, { label: string; color: string }> = {
    [PasswordStrength.WEAK]: { label: 'Weak', color: 'red' },
    [PasswordStrength.MEDIUM]: { label: 'Medium', color: 'orange' },
    [PasswordStrength.STRONG]: { label: 'Strong', color: 'green' },
    [PasswordStrength.VERY_STRONG]: { label: 'Very Strong', color: 'emerald' },
  };

  const details = strengthLabels[level];

  return {
    score,
    level,
    label: details.label,
    color: details.color,
    percentage: score,
  };
}

/**
 * Zod schema for password validation
 */
export const passwordSchema = z
  .string()
  .min(PASSWORD_REQUIREMENTS.minLength, {
    message: `Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters`,
  })
  .max(PASSWORD_REQUIREMENTS.maxLength, {
    message: `Password must not exceed ${PASSWORD_REQUIREMENTS.maxLength} characters`,
  })
  .regex(PASSWORD_PATTERNS.uppercase, {
    message: 'Password must contain at least one uppercase letter',
  })
  .regex(PASSWORD_PATTERNS.lowercase, {
    message: 'Password must contain at least one lowercase letter',
  })
  .regex(PASSWORD_PATTERNS.number, {
    message: 'Password must contain at least one number',
  })
  .regex(PASSWORD_PATTERNS.specialChar, {
    message: `Password must contain at least one special character (${PASSWORD_REQUIREMENTS.specialChars})`,
  });

/**
 * Zod schema for password change
 */
export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

/**
 * Type for password change form data
 */
export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;

/**
 * Check if password is commonly used (basic check)
 * @param password - Password to check
 * @returns True if password is commonly used
 */
export function isCommonPassword(password: string): boolean {
  // Common passwords to reject
  const commonPasswords = [
    'password',
    'password123',
    '12345678',
    'qwerty123',
    'abc123456',
    'password1',
    'welcome123',
    'admin123',
  ];

  return commonPasswords.some(
    (common) => password.toLowerCase() === common.toLowerCase()
  );
}

/**
 * Validate password is not common
 * @param password - Password to validate
 * @returns Validation result
 */
export function validateNotCommonPassword(password: string): {
  isValid: boolean;
  error?: string;
} {
  if (isCommonPassword(password)) {
    return {
      isValid: false,
      error: 'This password is too common. Please choose a more unique password.',
    };
  }

  return { isValid: true };
}
