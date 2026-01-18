/**
 * Authentication Configuration
 * Central configuration for JWT, OAuth, and security settings
 */

export const authConfig = {
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || '',
    accessTokenExpiry: '15m', // 15 minutes
    refreshTokenExpiry: '7d', // 7 days
    algorithm: 'HS256' as const,
  },

  // Cookie Configuration
  cookies: {
    accessToken: {
      name: 'auth_token',
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: 15 * 60, // 15 minutes in seconds
        path: '/',
      },
    },
    refreshToken: {
      name: 'refresh_token',
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
        path: '/api/auth',
      },
    },
  },

  // Password Configuration
  password: {
    saltRounds: 12,
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  },

  // Rate Limiting Configuration
  rateLimit: {
    login: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxAttempts: 5,
    },
    register: {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxAttempts: 3,
    },
    passwordReset: {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxAttempts: 3,
    },
  },

  // OAuth Providers Configuration
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`,
      scope: ['openid', 'profile', 'email'],
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/github/callback`,
      scope: ['user:email', 'read:user'],
    },
  },

  // CSRF Protection
  csrf: {
    secret: process.env.CSRF_SECRET || '',
    cookieName: 'csrf_token',
    headerName: 'x-csrf-token',
  },

  // Session Configuration
  session: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    updateAge: 24 * 60 * 60 * 1000, // Update session every 24 hours
  },
} as const;

// Validate required environment variables
export function validateAuthConfig() {
  const requiredEnvVars = [
    'JWT_SECRET',
    'CSRF_SECRET',
    'NEXT_PUBLIC_APP_URL',
  ];

  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }

  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }
}
