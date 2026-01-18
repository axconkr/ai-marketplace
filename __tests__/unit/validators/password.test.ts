/**
 * Password Validator Tests
 */

import {
  validatePasswordRequirements,
  calculatePasswordScore,
  getPasswordStrength,
  getPasswordStrengthDetails,
  isCommonPassword,
  validateNotCommonPassword,
  passwordSchema,
  passwordChangeSchema,
  PasswordStrength,
} from '@/lib/validators/password';

describe('Password Validator', () => {
  describe('validatePasswordRequirements', () => {
    it('should validate a strong password', () => {
      const result = validatePasswordRequirements('MyP@ssw0rd123');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject password too short', () => {
      const result = validatePasswordRequirements('Abc1!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters');
    });

    it('should reject password without uppercase', () => {
      const result = validatePasswordRequirements('myp@ssw0rd123');
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('uppercase'))).toBe(true);
    });

    it('should reject password without lowercase', () => {
      const result = validatePasswordRequirements('MYP@SSW0RD123');
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('lowercase'))).toBe(true);
    });

    it('should reject password without number', () => {
      const result = validatePasswordRequirements('MyP@ssword!');
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('number'))).toBe(true);
    });

    it('should reject password without special character', () => {
      const result = validatePasswordRequirements('MyPassword123');
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('special character'))).toBe(true);
    });
  });

  describe('calculatePasswordScore', () => {
    it('should score weak password low', () => {
      const score = calculatePasswordScore('Abc123!@');
      expect(score).toBeLessThan(60);
    });

    it('should score medium password moderately', () => {
      const score = calculatePasswordScore('MyP@ssw0rd123');
      expect(score).toBeGreaterThanOrEqual(40);
      expect(score).toBeLessThan(80);
    });

    it('should score strong password high', () => {
      const score = calculatePasswordScore('MyVeryStr0ng!P@ssw0rd2024');
      expect(score).toBeGreaterThanOrEqual(60);
    });

    it('should give bonus for length', () => {
      const shortScore = calculatePasswordScore('Abc123!@');
      const longScore = calculatePasswordScore('Abc123!@WithMoreCharacters2024');
      expect(longScore).toBeGreaterThan(shortScore);
    });
  });

  describe('getPasswordStrength', () => {
    it('should classify weak password', () => {
      const strength = getPasswordStrength('Abc123!@');
      expect(strength).toBe(PasswordStrength.WEAK);
    });

    it('should classify medium password', () => {
      const strength = getPasswordStrength('MyP@ssw0rd123');
      expect(strength).toBe(PasswordStrength.MEDIUM);
    });

    it('should classify strong password', () => {
      const strength = getPasswordStrength('MyVeryStr0ng!P@ssw0rd');
      expect([PasswordStrength.STRONG, PasswordStrength.VERY_STRONG]).toContain(strength);
    });
  });

  describe('getPasswordStrengthDetails', () => {
    it('should return complete strength details', () => {
      const details = getPasswordStrengthDetails('MyP@ssw0rd123');
      expect(details).toHaveProperty('score');
      expect(details).toHaveProperty('level');
      expect(details).toHaveProperty('label');
      expect(details).toHaveProperty('color');
      expect(details).toHaveProperty('percentage');
      expect(details.score).toBeGreaterThan(0);
      expect(details.percentage).toBe(details.score);
    });

    it('should have correct color for weak password', () => {
      const details = getPasswordStrengthDetails('Abc123!@');
      expect(details.color).toBe('red');
      expect(details.label).toBe('Weak');
    });

    it('should have correct color for strong password', () => {
      const details = getPasswordStrengthDetails('MyVeryStr0ng!P@ssw0rd2024');
      expect(['green', 'emerald']).toContain(details.color);
    });
  });

  describe('isCommonPassword', () => {
    it('should detect common passwords', () => {
      expect(isCommonPassword('password')).toBe(true);
      expect(isCommonPassword('password123')).toBe(true);
      expect(isCommonPassword('12345678')).toBe(true);
      expect(isCommonPassword('PASSWORD')).toBe(true); // case insensitive
    });

    it('should not flag unique passwords', () => {
      expect(isCommonPassword('MyUn1que!P@ss')).toBe(false);
    });
  });

  describe('validateNotCommonPassword', () => {
    it('should reject common passwords', () => {
      const result = validateNotCommonPassword('password123');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should accept unique passwords', () => {
      const result = validateNotCommonPassword('MyUn1que!P@ss');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('passwordSchema', () => {
    it('should validate strong password', () => {
      const result = passwordSchema.safeParse('MyP@ssw0rd123');
      expect(result.success).toBe(true);
    });

    it('should reject weak password', () => {
      const result = passwordSchema.safeParse('weak');
      expect(result.success).toBe(false);
    });

    it('should provide detailed errors', () => {
      const result = passwordSchema.safeParse('weak');
      if (!result.success) {
        expect(result.error.errors.length).toBeGreaterThan(0);
      }
    });
  });

  describe('passwordChangeSchema', () => {
    it('should validate correct password change data', () => {
      const result = passwordChangeSchema.safeParse({
        currentPassword: 'OldP@ssw0rd123',
        newPassword: 'NewP@ssw0rd456',
        confirmPassword: 'NewP@ssw0rd456',
      });
      expect(result.success).toBe(true);
    });

    it('should reject mismatched passwords', () => {
      const result = passwordChangeSchema.safeParse({
        currentPassword: 'OldP@ssw0rd123',
        newPassword: 'NewP@ssw0rd456',
        confirmPassword: 'DifferentP@ssw0rd',
      });
      expect(result.success).toBe(false);
    });

    it('should reject same current and new password', () => {
      const result = passwordChangeSchema.safeParse({
        currentPassword: 'SameP@ssw0rd123',
        newPassword: 'SameP@ssw0rd123',
        confirmPassword: 'SameP@ssw0rd123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject weak new password', () => {
      const result = passwordChangeSchema.safeParse({
        currentPassword: 'OldP@ssw0rd123',
        newPassword: 'weak',
        confirmPassword: 'weak',
      });
      expect(result.success).toBe(false);
    });
  });
});
