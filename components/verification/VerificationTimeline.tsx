'use client';

import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VerificationWithExperts } from '@/lib/types/verification-expert';

interface TimelineStep {
  label: string;
  date: Date | string | null;
  completed: boolean;
  current: boolean;
}

interface VerificationTimelineProps {
  verification: VerificationWithExperts;
}

export function VerificationTimeline({
  verification,
}: VerificationTimelineProps) {
  const steps: TimelineStep[] = [
    {
      label: '검증 요청',
      date: verification.requested_at,
      completed: true,
      current: verification.status === 'PENDING',
    },
    {
      label: '검증자 배정',
      date: verification.assigned_at,
      completed: !!verification.assigned_at,
      current: verification.status === 'ASSIGNED',
    },
    {
      label: '검증 진행중',
      date: verification.reviewed_at,
      completed: !!verification.reviewed_at,
      current: verification.status === 'IN_PROGRESS',
    },
    {
      label: '검증 완료',
      date: verification.completed_at,
      completed: !!verification.completed_at,
      current:
        verification.status === 'COMPLETED' ||
        verification.status === 'APPROVED',
    },
  ];

  return (
    <div className="py-4">
      <div className="flex items-start justify-between relative">
        {/* Timeline Line */}
        <div className="absolute left-0 right-0 top-3 h-0.5 bg-gray-200">
          <div
            className="h-full bg-blue-500 transition-all duration-500"
            style={{
              width: `${
                (steps.filter((s) => s.completed).length / steps.length) * 100
              }%`,
            }}
          />
        </div>

        {/* Steps */}
        {steps.map((step, idx) => (
          <div key={idx} className="flex flex-col items-center relative z-10">
            {/* Icon */}
            <div
              className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center border-2 bg-white transition-all',
                step.completed
                  ? 'border-blue-500 bg-blue-500'
                  : step.current
                  ? 'border-blue-500 bg-white'
                  : 'border-gray-300 bg-white'
              )}
            >
              {step.completed ? (
                <CheckCircle2 className="h-4 w-4 text-white" />
              ) : step.current ? (
                <Clock className="h-3 w-3 text-blue-500" />
              ) : (
                <Circle className="h-3 w-3 text-gray-300" />
              )}
            </div>

            {/* Label */}
            <div className="mt-2 text-center">
              <div
                className={cn(
                  'text-xs font-medium whitespace-nowrap',
                  step.completed || step.current
                    ? 'text-gray-900'
                    : 'text-gray-400'
                )}
              >
                {step.label}
              </div>
              {step.date && (
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(step.date).toLocaleDateString('ko-KR', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
