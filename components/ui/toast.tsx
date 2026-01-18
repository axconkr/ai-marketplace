'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Toast notification UI component
 * Displays toast notifications with different variants
 */

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  toast: (options: Omit<Toast, 'id'>) => void;
  addToast: (options: Omit<Toast, 'id'>) => void; // Backward compatibility
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

export const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

/**
 * Hook to use toast notifications
 */
export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const toast = React.useCallback((options: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const duration = options.duration ?? 5000;

    const newToast: Toast = {
      ...options,
      id,
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const success = React.useCallback((title: string, description?: string) => {
    toast({ title, description, variant: 'success' });
  }, [toast]);

  const error = React.useCallback((title: string, description?: string) => {
    toast({ title, description, variant: 'error', duration: 7000 }); // Longer duration for errors
  }, [toast]);

  const warning = React.useCallback((title: string, description?: string) => {
    toast({ title, description, variant: 'warning' });
  }, [toast]);

  const info = React.useCallback((title: string, description?: string) => {
    toast({ title, description, variant: 'info' });
  }, [toast]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = React.useCallback(() => {
    setToasts([]);
  }, []);

  const value = React.useMemo(
    () => ({
      toasts,
      toast,
      addToast: toast, // Backward compatibility alias
      success,
      error,
      warning,
      info,
      dismiss,
      dismissAll
    }),
    [toasts, toast, success, error, warning, info, dismiss, dismissAll]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport />
    </ToastContext.Provider>
  );
}

function getToastIcon(variant: string) {
  switch (variant) {
    case 'success':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    case 'error':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    case 'warning':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    case 'info':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    default:
      return null;
  }
}

function getToastStyles(variant: string) {
  switch (variant) {
    case 'success':
      return 'bg-green-50 border-green-200 text-green-900 dark:bg-green-900/20 dark:border-green-800 dark:text-green-100';
    case 'error':
      return 'bg-red-50 border-red-200 text-red-900 dark:bg-red-900/20 dark:border-red-800 dark:text-red-100';
    case 'warning':
      return 'bg-yellow-50 border-yellow-200 text-yellow-900 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-100';
    case 'info':
      return 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-100';
    default:
      return 'bg-card text-card-foreground border-border';
  }
}

function getIconColor(variant: string) {
  switch (variant) {
    case 'success':
      return 'text-green-600 dark:text-green-400';
    case 'error':
      return 'text-red-600 dark:text-red-400';
    case 'warning':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'info':
      return 'text-blue-600 dark:text-blue-400';
    default:
      return 'text-foreground';
  }
}

function ToastViewport() {
  const context = React.useContext(ToastContext);
  if (!context) return null;

  const { toasts, dismiss } = context;

  return (
    <div className="fixed bottom-0 right-0 z-50 max-w-md w-full p-4 space-y-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'rounded-lg border p-4 shadow-lg transition-all animate-in slide-in-from-bottom-5 pointer-events-auto',
            getToastStyles(toast.variant || 'default')
          )}
        >
          <div className="flex items-start gap-3">
            {toast.variant && toast.variant !== 'default' && (
              <div className={cn('flex-shrink-0 mt-0.5', getIconColor(toast.variant))}>
                {getToastIcon(toast.variant)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm">{toast.title}</h3>
              {toast.description && (
                <p className="text-sm opacity-90 mt-1">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => dismiss(toast.id)}
              className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
