import { apiFetch } from './error-handler';
import type { User, UserRole } from '@/src/lib/auth/types';

/**
 * Authentication API client functions
 */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

/**
 * Login with email and password
 */
export async function login(data: LoginRequest): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  }, { skipAuth: true });
}

/**
 * Register new user
 */
export async function register(data: RegisterRequest): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }, { skipAuth: true });
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  return apiFetch<void>('/auth/logout', {
    method: 'POST',
  });
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<{ user: User }> {
  return apiFetch<{ user: User }>('/auth/me');
}

/**
 * Refresh access token
 */
export async function refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
  return apiFetch<{ accessToken: string }>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  }, { skipAuth: true });
}
