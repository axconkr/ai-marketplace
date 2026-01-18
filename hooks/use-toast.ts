/**
 * Enhanced Toast Hook
 * Provides easy-to-use toast notifications with error handling
 */

import { useContext } from 'react';
import { ToastContext } from '@/components/ui/toast';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
