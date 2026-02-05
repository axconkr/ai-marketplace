'use client';

import { useState } from 'react';
import {
  DollarSign,
  Clock,
  User,
  CheckCircle,
  XCircle,
  CreditCard,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { EscrowPaymentModal } from './escrow-payment-modal';
import type { ProposalWithSeller } from '@/src/lib/requests/types';

/**
 * ProposalCard Component
 * Displays a single proposal with actions
 */

interface ProposalCardProps {
  proposal: ProposalWithSeller & { status?: string };
  requestId: string;
  isBuyer: boolean;
  isSelected: boolean;
  onUpdate?: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: '대기 중',
  ACCEPTED: '선정됨',
  REJECTED: '거절됨',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-500',
  ACCEPTED: 'bg-green-500',
  REJECTED: 'bg-red-500',
};

export function ProposalCard({
  proposal,
  requestId,
  isBuyer,
  isSelected,
  onUpdate,
}: ProposalCardProps) {
  const { success, error } = useToast();
  const [isSelecting, setIsSelecting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleSelect = async () => {
    if (!confirm('이 제안을 선정하시겠습니까? 선정 후에는 에스크로 결제가 필요합니다.')) {
      return;
    }

    try {
      setIsSelecting(true);

      const response = await fetch(
        `/api/requests/${requestId}/select-proposal`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ proposalId: proposal.id }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to select proposal');
      }

      success('제안이 선정되었습니다! 이제 결제를 진행해주세요.');
      setShowPaymentModal(true);

      if (onUpdate) {
        onUpdate();
      }
    } catch (err: any) {
      console.error('Error selecting proposal:', err);
      error(err.message || '제안 선정에 실패했습니다');
    } finally {
      setIsSelecting(false);
    }
  };

  return (
    <>
      <Card
        className={`${
          isSelected ? 'border-green-500 border-2' : ''
        } hover:shadow-md transition-shadow`}
      >
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Seller Info */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  {proposal.seller.avatar ? (
                    <img
                      src={proposal.seller.avatar}
                      alt={proposal.seller.name ?? 'Seller'}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="font-semibold">{proposal.seller.name}</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(proposal.createdAt)} 제출
                  </p>
                </div>
              </div>

              {proposal.status && (
                <Badge
                  className={`${STATUS_COLORS[proposal.status]} text-white`}
                >
                  {STATUS_LABELS[proposal.status]}
                </Badge>
              )}
            </div>

            {/* Price & Timeline */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">제안 금액</p>
                  <p className="font-semibold">{formatCurrency(proposal.price)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">작업 기간</p>
                  <p className="font-semibold">{proposal.timeline}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="font-semibold mb-2">제안 내용</h4>
              <p className="text-gray-700 whitespace-pre-wrap text-sm">
                {proposal.description}
              </p>
            </div>

            {/* Actions */}
            {isBuyer && !isSelected && proposal.status === 'PENDING' && (
              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelect}
                  disabled={isSelecting}
                >
                  {isSelecting ? (
                    <>처리 중...</>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      선정하기
                    </>
                  )}
                </Button>
              </div>
            )}

            {isSelected && (
              <div className="flex justify-between items-center pt-3 border-t">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">선정된 제안입니다</span>
                </div>
                {isBuyer && (
                  <Button
                    size="sm"
                    onClick={() => setShowPaymentModal(true)}
                  >
                    <CreditCard className="w-4 h-4 mr-1" />
                    결제하기
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Escrow Payment Modal */}
      {showPaymentModal && (
        <EscrowPaymentModal
          proposalId={proposal.id}
          amount={proposal.price}
          sellerName={proposal.seller.name ?? 'Unknown Seller'}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => {
            setShowPaymentModal(false);
            if (onUpdate) onUpdate();
          }}
        />
      )}
    </>
  );
}
