'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export type CheckoutStep = 'review' | 'payment' | 'confirmation';

interface CheckoutProgressProps {
  currentStep: CheckoutStep;
  className?: string;
}

interface Step {
  id: CheckoutStep;
  label: string;
  order: number;
}

const steps: Step[] = [
  { id: 'review', label: 'Review Order', order: 1 },
  { id: 'payment', label: 'Payment', order: 2 },
  { id: 'confirmation', label: 'Confirmation', order: 3 },
];

/**
 * CheckoutProgress - Multi-step checkout progress indicator
 * Shows current step and completed steps with visual feedback
 */
export function CheckoutProgress({
  currentStep,
  className,
}: CheckoutProgressProps) {
  const currentStepOrder =
    steps.find((s) => s.id === currentStep)?.order || 1;

  return (
    <div className={cn('w-full', className)}>
      <nav aria-label="Checkout progress">
        <ol className="flex items-center justify-between">
          {steps.map((step, idx) => {
            const isCompleted = step.order < currentStepOrder;
            const isCurrent = step.id === currentStep;
            const isUpcoming = step.order > currentStepOrder;

            return (
              <li
                key={step.id}
                className={cn(
                  'flex flex-1 items-center',
                  idx !== steps.length - 1 && 'pr-8 sm:pr-20'
                )}
              >
                <div className="flex flex-col items-center space-y-2">
                  {/* Step Circle */}
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all',
                      {
                        'border-green-600 bg-green-600 text-white': isCompleted,
                        'border-blue-600 bg-blue-600 text-white shadow-lg':
                          isCurrent,
                        'border-gray-300 bg-white text-gray-500': isUpcoming,
                      }
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-semibold">{step.order}</span>
                    )}
                  </div>

                  {/* Step Label */}
                  <span
                    className={cn(
                      'text-xs font-medium sm:text-sm',
                      {
                        'text-green-600': isCompleted,
                        'text-blue-600': isCurrent,
                        'text-gray-500': isUpcoming,
                      }
                    )}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Connector Line */}
                {idx !== steps.length - 1 && (
                  <div
                    className={cn(
                      'h-0.5 flex-1 transition-all',
                      isCompleted ? 'bg-green-600' : 'bg-gray-300'
                    )}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
