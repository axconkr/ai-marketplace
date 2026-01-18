import { CheckCircle2, Circle, Clock, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  VerificationStatus as Status,
  Verification,
} from '@/lib/types/verification';
import { VERIFICATION_STATUS_INFO } from '@/lib/types/verification';

interface VerificationStatusProps {
  verification: Verification;
  className?: string;
}

export function VerificationStatus({
  verification,
  className,
}: VerificationStatusProps) {
  const status = VERIFICATION_STATUS_INFO[verification.status];
  const steps = [
    { name: '요청됨', status: 'PENDING' },
    { name: '할당됨', status: 'ASSIGNED' },
    { name: '진행중', status: 'IN_PROGRESS' },
    { name: '검토완료', status: 'COMPLETED' },
    {
      name: verification.status === 'APPROVED' ? '승인됨' : '결과',
      status: verification.status === 'APPROVED' ? 'APPROVED' : 'REJECTED',
    },
  ];

  const currentStep = status.step;

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">검증 상태</h3>
        <StatusBadge status={verification.status} />
      </div>

      <div className="relative">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;
            const isRejected =
              verification.status === 'REJECTED' && stepNumber === 5;

            return (
              <div key={step.name} className="flex flex-col items-center flex-1">
                <div className="relative flex items-center justify-center">
                  {index > 0 && (
                    <div
                      className={cn(
                        'absolute right-1/2 w-full h-0.5 -z-10',
                        isCompleted ? 'bg-green-500' : 'bg-gray-300'
                      )}
                      style={{ width: '100%', right: '50%' }}
                    />
                  )}
                  <div
                    className={cn(
                      'flex items-center justify-center w-8 h-8 rounded-full border-2',
                      isRejected
                        ? 'bg-red-100 border-red-500 text-red-500'
                        : isCompleted
                          ? 'bg-green-500 border-green-500 text-white'
                          : isCurrent
                            ? 'bg-blue-100 border-blue-500 text-blue-500'
                            : 'bg-gray-100 border-gray-300 text-gray-400'
                    )}
                  >
                    {isRejected ? (
                      <XCircle className="h-4 w-4" />
                    ) : isCompleted ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : isCurrent ? (
                      <Clock className="h-4 w-4" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                  </div>
                </div>
                <span
                  className={cn(
                    'mt-2 text-xs text-center',
                    isCurrent ? 'font-medium text-blue-600' : 'text-gray-500'
                  )}
                >
                  {step.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-sm text-gray-600">
        <div className="flex justify-between">
          <span>요청일:</span>
          <span>{new Date(verification.requested_at).toLocaleDateString()}</span>
        </div>
        {verification.assigned_at && (
          <div className="flex justify-between">
            <span>할당일:</span>
            <span>{new Date(verification.assigned_at).toLocaleDateString()}</span>
          </div>
        )}
        {verification.reviewed_at && (
          <div className="flex justify-between">
            <span>검토일:</span>
            <span>{new Date(verification.reviewed_at).toLocaleDateString()}</span>
          </div>
        )}
        {verification.completed_at && (
          <div className="flex justify-between">
            <span>완료일:</span>
            <span>{new Date(verification.completed_at).toLocaleDateString()}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const info = VERIFICATION_STATUS_INFO[status];

  const colorMap = {
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    blue: 'bg-blue-100 text-blue-800 border-blue-300',
    green: 'bg-green-100 text-green-800 border-green-300',
    red: 'bg-red-100 text-red-800 border-red-300',
    gray: 'bg-gray-100 text-gray-800 border-gray-300',
  };

  return (
    <span
      className={cn(
        'px-3 py-1 rounded-full text-xs font-medium border',
        colorMap[info.color]
      )}
    >
      {info.text}
    </span>
  );
}
