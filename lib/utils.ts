/**
 * Utility functions for the marketplace
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency amount to display string
 * For KRW: input is in won (not cents)
 * For USD: input is in cents
 */
export function formatCurrency(amount: number, currency = 'KRW'): string {
  // KRW doesn't use decimal places
  if (currency === 'KRW') {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  }

  // USD uses cents, so divide by 100
  const displayAmount = currency === 'USD' ? amount / 100 : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(displayAmount);
}

/**
 * Parse currency string to cents
 */
export function parseCurrency(currencyString: string): number {
  const amount = parseFloat(currencyString.replace(/[^0-9.-]+/g, ''));
  return Math.round(amount * 100);
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return formatDate(d);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Generate verification level badge text
 */
export function getVerificationLevelText(level: number): string {
  const levels: Record<number, string> = {
    0: 'Basic',
    1: 'Standard',
    2: 'Professional',
    3: 'Enterprise',
  };
  return levels[level] || `Level ${level}`;
}

/**
 * Get verification fee by level (in cents)
 */
export function getVerificationFee(level: number): number {
  const fees: Record<number, number> = {
    0: 0, // Free
    1: 5000, // $50
    2: 15000, // $150
    3: 50000, // $500
  };
  return fees[level] || 0;
}
