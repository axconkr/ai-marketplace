'use client';

import { AlertCircle, RefreshCw, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface PaymentErrorHandlerProps {
  error: string | null;
  onRetry?: () => void;
  className?: string;
}

/**
 * PaymentErrorHandler - User-friendly payment error display with recovery options
 * Categorizes errors and provides appropriate user actions
 */
export function PaymentErrorHandler({
  error,
  onRetry,
  className,
}: PaymentErrorHandlerProps) {
  if (!error) return null;

  const errorInfo = categorizeError(error);

  return (
    <Card className={cn('border-red-200 bg-red-50', className)}>
      <CardContent className="pt-6">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>

          <div className="flex-1 space-y-3">
            {/* Error Title */}
            <div>
              <h3 className="font-semibold text-red-900">
                {errorInfo.title}
              </h3>
              <p className="mt-1 text-sm text-red-800">
                {errorInfo.message}
              </p>
            </div>

            {/* Suggested Actions */}
            {errorInfo.suggestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-red-900">
                  What you can do:
                </p>
                <ul className="space-y-1 text-sm text-red-800">
                  {errorInfo.suggestions.map((suggestion, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-red-600">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              {errorInfo.canRetry && onRetry && (
                <Button
                  onClick={onRetry}
                  variant="outline"
                  size="sm"
                  className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open('/support', '_blank')}
                className="text-red-600 hover:bg-red-100 hover:text-red-700"
              >
                <HelpCircle className="mr-2 h-4 w-4" />
                Contact Support
              </Button>
            </div>

            {/* Technical Details (Collapsible) */}
            <details className="text-xs text-red-700">
              <summary className="cursor-pointer font-medium hover:text-red-800">
                Technical Details
              </summary>
              <pre className="mt-2 overflow-auto rounded bg-red-100 p-2">
                {error}
              </pre>
            </details>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Error categorization and user-friendly messaging
 */
interface ErrorInfo {
  title: string;
  message: string;
  suggestions: string[];
  canRetry: boolean;
}

function categorizeError(error: string): ErrorInfo {
  const errorLower = error.toLowerCase();

  // Card declined
  if (
    errorLower.includes('card_declined') ||
    errorLower.includes('declined') ||
    errorLower.includes('insufficient_funds')
  ) {
    return {
      title: 'Payment Declined',
      message: 'Your card was declined by your bank.',
      suggestions: [
        'Check if you have sufficient funds',
        'Verify your card details are correct',
        'Try a different payment method',
        'Contact your bank for more information',
      ],
      canRetry: true,
    };
  }

  // Invalid card
  if (
    errorLower.includes('invalid') ||
    errorLower.includes('incorrect') ||
    errorLower.includes('card_error')
  ) {
    return {
      title: 'Invalid Card Information',
      message: 'The card information you provided is invalid.',
      suggestions: [
        'Double-check your card number',
        'Verify the expiration date',
        'Confirm the security code (CVV)',
        'Make sure billing address matches',
      ],
      canRetry: true,
    };
  }

  // Network/timeout errors
  if (
    errorLower.includes('network') ||
    errorLower.includes('timeout') ||
    errorLower.includes('connection')
  ) {
    return {
      title: 'Connection Error',
      message: 'We lost connection during the payment process.',
      suggestions: [
        'Check your internet connection',
        'Try again in a few moments',
        'Use a different network if available',
      ],
      canRetry: true,
    };
  }

  // 3D Secure
  if (
    errorLower.includes('authentication') ||
    errorLower.includes('3d secure') ||
    errorLower.includes('requires_action')
  ) {
    return {
      title: 'Additional Authentication Required',
      message: 'Your bank requires additional verification.',
      suggestions: [
        'Check for authentication prompts from your bank',
        'Complete the verification in your banking app',
        'Try again after verification',
      ],
      canRetry: true,
    };
  }

  // Rate limiting
  if (errorLower.includes('rate_limit') || errorLower.includes('too many')) {
    return {
      title: 'Too Many Attempts',
      message: 'You have made too many payment attempts.',
      suggestions: [
        'Wait a few minutes before trying again',
        'Contact support if issue persists',
      ],
      canRetry: false,
    };
  }

  // Generic error
  return {
    title: 'Payment Failed',
    message: 'An unexpected error occurred while processing your payment.',
    suggestions: [
      'Try again in a few moments',
      'Use a different payment method',
      'Contact support if the problem continues',
    ],
    canRetry: true,
  };
}
