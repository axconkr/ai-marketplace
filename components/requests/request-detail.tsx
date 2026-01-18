'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Clock,
  DollarSign,
  User,
  Calendar,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  FileText,
  Link as LinkIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { ProposalCard } from './proposal-card';
import { ProposalForm } from './proposal-form';
import type { RequestWithDetails } from '@/src/lib/requests/types';

/**
 * RequestDetail Component
 * Shows detailed view of a development request with proposals
 */

interface RequestDetailProps {
  request: RequestWithDetails;
  currentUserId?: string;
  onUpdate?: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  n8n: 'n8n Workflow',
  make: 'Make.com Automation',
  ai_agent: 'AI Agent',
  app: 'Application',
  api: 'API Integration',
  prompt: 'Prompt Engineering',
};

const STATUS_LABELS: Record<string, string> = {
  OPEN: '모집 중',
  IN_PROGRESS: '진행 중',
  COMPLETED: '완료',
  CANCELLED: '취소됨',
};

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-green-500',
  IN_PROGRESS: 'bg-blue-500',
  COMPLETED: 'bg-gray-500',
  CANCELLED: 'bg-red-500',
};

export function RequestDetail({
  request,
  currentUserId,
  onUpdate,
}: RequestDetailProps) {
  const router = useRouter();
  const { success, error } = useToast();
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isBuyer = currentUserId === request.buyerId;
  const hasSelfProposal = request.proposals?.some(
    (p) => p.seller.id === currentUserId
  );
  const canSubmitProposal =
    currentUserId &&
    !isBuyer &&
    !hasSelfProposal &&
    request.status === 'OPEN';

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

  const handleDelete = async () => {
    if (!confirm('정말 이 의뢰를 삭제하시겠습니까?')) return;

    try {
      setIsDeleting(true);

      const response = await fetch(`/api/requests/${request.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to delete request');
      }

      success('의뢰가 삭제되었습니다');
      router.push('/requests');
    } catch (err: any) {
      console.error('Error deleting request:', err);
      error(err.message || '의뢰 삭제에 실패했습니다');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">
                  {CATEGORY_LABELS[request.category] || request.category}
                </Badge>
                <Badge className={`${STATUS_COLORS[request.status]} text-white`}>
                  {STATUS_LABELS[request.status]}
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold">{request.title}</h1>
            </div>

            {isBuyer && request.status === 'OPEN' && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/requests/${request.id}/edit`)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  수정
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  삭제
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Buyer Info */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <User className="w-10 h-10 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">의뢰인</p>
              <p className="font-medium">{request.buyer.name}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">프로젝트 설명</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{request.description}</p>
          </div>

          {/* Budget & Timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">예산</p>
                <p className="font-semibold text-lg">
                  {formatCurrency(request.budgetMin)} - {formatCurrency(request.budgetMax)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">예상 기간</p>
                <p className="font-semibold text-lg">{request.timeline}</p>
              </div>
            </div>
          </div>

          {/* Requirements */}
          {request.requirements && Object.keys(request.requirements).length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                추가 요구사항
              </h3>
              <div className="space-y-2">
                {Object.entries(request.requirements).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex gap-3 p-3 bg-gray-50 rounded"
                  >
                    <span className="font-medium text-gray-700">{key}:</span>
                    <span className="text-gray-600">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attachments */}
          {request.attachments && request.attachments.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <LinkIcon className="w-5 h-5" />
                첨부 파일
              </h3>
              <div className="space-y-2">
                {request.attachments.map((url, index) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                  >
                    <LinkIcon className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-600 hover:underline truncate">
                      {url}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Created Date */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(request.createdAt)} 등록</span>
          </div>
        </CardContent>
      </Card>

      {/* Proposals Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              제안서 ({request.proposals?.length || 0})
            </CardTitle>
            {canSubmitProposal && !showProposalForm && (
              <Button onClick={() => setShowProposalForm(true)}>
                제안서 제출
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Proposal Form */}
          {showProposalForm && (
            <div className="p-4 border rounded-lg bg-gray-50">
              <ProposalForm
                requestId={request.id}
                onSuccess={() => {
                  setShowProposalForm(false);
                  if (onUpdate) onUpdate();
                }}
                onCancel={() => setShowProposalForm(false)}
              />
            </div>
          )}

          {/* Selected Proposal */}
          {request.selectedProposal && (
            <div className="border-2 border-green-500 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-semibold text-green-700">선정된 제안</span>
              </div>
              <ProposalCard
                proposal={request.selectedProposal}
                requestId={request.id}
                isBuyer={isBuyer}
                isSelected={true}
                onUpdate={onUpdate}
              />
            </div>
          )}

          {/* Other Proposals */}
          {request.proposals && request.proposals.length > 0 ? (
            <div className="space-y-4">
              {request.proposals
                .filter((p) => p.id !== request.selectedProposalId)
                .map((proposal) => (
                  <ProposalCard
                    key={proposal.id}
                    proposal={proposal}
                    requestId={request.id}
                    isBuyer={isBuyer}
                    isSelected={false}
                    onUpdate={onUpdate}
                  />
                ))}
            </div>
          ) : (
            !request.selectedProposal && (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>아직 제안서가 없습니다</p>
                {canSubmitProposal && (
                  <Button
                    variant="link"
                    onClick={() => setShowProposalForm(true)}
                    className="mt-2"
                  >
                    첫 제안서를 제출해보세요
                  </Button>
                )}
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}
