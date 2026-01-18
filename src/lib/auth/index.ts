/**
 * Authentication Library - Main Export
 * Centralized authentication utilities and functions
 */

// Configuration
export { authConfig, validateAuthConfig } from './config';

// Types
export type {
  User,
  UserWithPassword,
  AuthSession,
  JWTPayload,
  OAuthProfile,
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  OAuthState,
  LoginInput,
  RegisterInput,
  UpdateProfileInput,
  ChangePasswordInput,
} from './types';

export {
  UserRole,
  Permission,
  rolePermissions,
  emailSchema,
  passwordSchema,
  nameSchema,
  loginSchema,
  registerSchema,
  updateProfileSchema,
  changePasswordSchema,
  isUser,
  isJWTPayload,
} from './types';

// Password utilities
export {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
  generatePassword,
  needsRehash,
} from './password';

// JWT utilities
export {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  decodeToken,
  isTokenExpired,
  getTokenExpiration,
  refreshAccessToken,
  extractTokenFromHeader,
  generateTokenPair,
} from './jwt';

// CSRF protection
export {
  generateCsrfToken,
  hashCsrfToken,
  verifyCsrfToken,
  generateCsrfTokenPair,
  extractCsrfToken,
} from './csrf';

// Rate limiting
export {
  loginRateLimiter,
  registerRateLimiter,
  passwordResetRateLimiter,
  getClientIdentifier,
  createRateLimitResponse,
  addRateLimitHeaders,
} from './rate-limit';

// Session management
export {
  getSession,
  getCurrentUser,
  setSession,
  clearSession,
  refreshSession,
  validateSession,
} from './session';

// RBAC
export {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getRolePermissions,
  isResourceOwner,
  isAdmin,
  isServiceProvider,
  isClient,
  canAccessResource,
  createUnauthorizedResponse,
  createForbiddenResponse,
  authorize,
} from './rbac';
export type { AuthorizationResult } from './rbac';

// Middleware
export {
  requireAuth,
  requireRole,
  requirePermission,
  optionalAuth,
  getUserFromRequest,
  isAuthenticated,
  withCors,
} from './middleware';

// OAuth providers
export {
  getGoogleAuthUrl,
  getGoogleAccessToken,
  getGoogleUserProfile,
  handleGoogleCallback,
} from './oauth/google';

export {
  getGitHubAuthUrl,
  getGitHubAccessToken,
  getGitHubUserProfile,
  handleGitHubCallback,
} from './oauth/github';
