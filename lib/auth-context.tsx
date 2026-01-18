'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api/error-handler';
import type { User, UserRole } from '@/src/lib/auth/types';

/**
 * Authentication Context
 * Provides authentication state and methods throughout the application
 */

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth Provider Component
 * Manages authentication state and provides auth methods
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      const token = localStorage.getItem('accessToken');
      const storedUser = localStorage.getItem('userInfo');

      if (token && storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
        } catch (error) {
          console.error('Failed to parse user info:', error);
          localStorage.removeItem('userInfo');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
      setIsLoading(false);
    };

    loadUser();

    // Listen for auth changes from other tabs
    const handleStorageChange = () => {
      loadUser();
    };

    // Listen for custom auth events
    const handleAuthChange = () => {
      loadUser();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authStateChanged', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStateChanged', handleAuthChange);
    };
  }, []);

  /**
   * Login with email and password
   */
  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await apiFetch<{
        user: User;
        accessToken: string;
        refreshToken: string;
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }, { skipAuth: true });

      // Store tokens and user info
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('userInfo', JSON.stringify(response.user));

      // Update state
      setUser(response.user);

      // Dispatch custom event for other components
      window.dispatchEvent(new Event('authStateChanged'));

      // Redirect to home or return URL
      const urlParams = new URLSearchParams(window.location.search);
      const redirectUrl = urlParams.get('redirect') || '/';
      router.push(redirectUrl);
    } catch (error) {
      throw error;
    }
  }, [router]);

  /**
   * Register new user
   */
  const register = useCallback(async (
    email: string,
    password: string,
    name: string,
    role?: UserRole
  ) => {
    try {
      const response = await apiFetch<{
        user: User;
        accessToken: string;
        refreshToken: string;
      }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name, role }),
      }, { skipAuth: true });

      // Store tokens and user info
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('userInfo', JSON.stringify(response.user));

      // Update state
      setUser(response.user);

      // Dispatch custom event for other components
      window.dispatchEvent(new Event('authStateChanged'));

      // Redirect to home
      router.push('/');
    } catch (error) {
      throw error;
    }
  }, [router]);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      // Call logout endpoint
      await apiFetch('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API response
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userInfo');

      // Update state
      setUser(null);

      // Dispatch custom event for other components
      window.dispatchEvent(new Event('authStateChanged'));

      // Redirect to login
      router.push('/login');
    }
  }, [router]);

  /**
   * Refresh user data from server
   */
  const refreshUser = useCallback(async () => {
    try {
      const response = await apiFetch<{ user: User }>('/auth/me');

      // Update stored user info
      localStorage.setItem('userInfo', JSON.stringify(response.user));

      // Update state
      setUser(response.user);

      // Dispatch custom event for other components
      window.dispatchEvent(new Event('authStateChanged'));
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // If refresh fails, clear auth state
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userInfo');
      setUser(null);
      window.dispatchEvent(new Event('authStateChanged'));
    }
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use authentication context
 * Must be used within an AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Hook to require authentication
 * Redirects to login if user is not authenticated
 */
export function useRequireAuth() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      const currentPath = window.location.pathname;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [user, isLoading, router]);

  return { user, isLoading };
}
