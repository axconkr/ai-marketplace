import Link from 'next/link';
import { Calendar, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VerificationBadge } from './VerificationBadge';
import type { VerificationWithDetails } from '@/lib/types/verification';
import { VERIFICATION_STATUS_INFO, VERIFICATION_LEVELS } from '@/lib/types/verification';
import { cn } from '@/lib/utils';

interface VerificationCardProps {
  verification: VerificationWithDetails;
  viewType: 'seller' | 'verifier' | 'admin';
  onClaim?: (id: string) => void;
  isClaimPending?: boolean;
}

export function VerificationCard({
  verification,
  viewType,
  onClaim,
  isClaimPending,
}: VerificationCardProps) {
  const status = VERIFICATION_STATUS_INFO[verification.status];
  const levelInfo = VERIFICATION_LEVELS[verification.level];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">
              {verification.product.name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>
                Requested {new Date(verification.requested_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          <VerificationBadge
            level={verification.level}
            score={verification.score}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Level</span>
          <span className="font-medium">{levelInfo.name}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Status</span>
          <span
            className={cn(
              'px-2 py-1 rounded text-xs font-medium',
              status.color === 'green' && 'bg-green-100 text-green-800',
              status.color === 'blue' && 'bg-blue-100 text-blue-800',
              status.color === 'yellow' && 'bg-yellow-100 text-yellow-800',
              status.color === 'red' && 'bg-red-100 text-red-800',
              status.color === 'gray' && 'bg-gray-100 text-gray-800'
            )}
          >
            {status.text}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Fee</span>
          <span className="font-medium">${(verification.fee / 100).toFixed(2)}</span>
        </div>

        {viewType === 'verifier' && verification.verifier_share && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Your Share (70%)</span>
            <span className="font-medium text-green-600">
              ${(verification.verifier_share / 100).toFixed(2)}
            </span>
          </div>
        )}

        {verification.verifier && (
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">Verifier:</span>
            <span className="font-medium">
              {verification.verifier.name || verification.verifier.email}
            </span>
          </div>
        )}

        {verification.score !== null && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Score</span>
            <span className="font-medium">{Math.round(verification.score)}%</span>
          </div>
        )}

        <div className="flex gap-2 mt-4">
          {viewType === 'verifier' &&
            verification.status === 'PENDING' &&
            onClaim && (
              <Button
                onClick={() => onClaim(verification.id)}
                disabled={isClaimPending}
                className="flex-1"
              >
                {isClaimPending ? 'Claiming...' : 'Claim Verification'}
              </Button>
            )}

          {viewType === 'verifier' &&
            (verification.status === 'ASSIGNED' ||
              verification.status === 'IN_PROGRESS') && (
              <Button asChild className="flex-1">
                <Link href={`/verifications/${verification.id}/review`}>
                  {verification.status === 'ASSIGNED'
                    ? 'Start Review'
                    : 'Continue Review'}
                </Link>
              </Button>
            )}

          {(viewType === 'seller' || viewType === 'admin') && (
            <Button asChild variant="outline" className="flex-1">
              <Link href={`/verifications/${verification.id}`}>
                View Details
              </Link>
            </Button>
          )}

          {viewType === 'admin' &&
            verification.status === 'PENDING' && (
              <Button asChild className="flex-1">
                <Link href={`/admin/verifications/${verification.id}/assign`}>
                  Assign Verifier
                </Link>
              </Button>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
