'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { VERIFICATION_LEVEL_INFO } from '@/lib/types/verification-expert';
import { useRequestVerification } from '@/hooks/use-verifications';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  thumbnail_url: string | null;
}

interface RequestVerificationModalProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RequestVerificationModal({
  product,
  open,
  onClose,
  onSuccess,
}: RequestVerificationModalProps) {
  const [selectedLevel, setSelectedLevel] = useState<0 | 1 | 2 | 3>(1);
  const requestMutation = useRequestVerification();

  const handleSubmit = async () => {
    if (!product) return;

    try {
      await requestMutation.mutateAsync({
        productId: product.id,
        level: selectedLevel,
      });

      toast.success('검증 요청이 성공적으로 제출되었습니다.');
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : '검증 요청에 실패했습니다.'
      );
    }
  };

  if (!product) return null;

  const selectedLevelInfo = VERIFICATION_LEVEL_INFO[selectedLevel];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>검증 요청</DialogTitle>
          <p className="text-sm text-gray-600 mt-1">
            {product.name}에 대한 검증 레벨을 선택해주세요
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Level Selection */}
          <div className="grid gap-3">
            {([0, 1, 2, 3] as const).map((level) => {
              const info = VERIFICATION_LEVEL_INFO[level];
              const isSelected = selectedLevel === level;

              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSelectedLevel(level)}
                  className={cn(
                    'border-2 rounded-lg p-4 text-left transition-all',
                    'hover:border-blue-300',
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{info.name}</h3>
                        <Badge className={info.color}>
                          Level {level}
                        </Badge>
                        {level > 1 && (
                          <Badge variant="outline" className="text-xs">
                            출시 예정
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {info.description}
                      </p>

                      {/* Features */}
                      <div className="space-y-1.5">
                        {info.features.map((feature, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 text-sm"
                          >
                            <Check className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                            <span className="text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="ml-4 text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        ${(info.fee / 100).toFixed(0)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">USD</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Level 3 Expert Explanation */}
          {selectedLevel === 3 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-sm text-yellow-900 mb-2">
                프리미엄 4개 분야 전문가 검수
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎨</span>
                  <div>
                    <div className="font-medium text-yellow-900">
                      디자인 전문가
                    </div>
                    <div className="text-xs text-yellow-700">
                      UI/UX 및 디자인 평가
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">📋</span>
                  <div>
                    <div className="font-medium text-yellow-900">
                      기획 전문가
                    </div>
                    <div className="text-xs text-yellow-700">
                      제품 기획 및 로직 평가
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">💻</span>
                  <div>
                    <div className="font-medium text-yellow-900">
                      개발 전문가
                    </div>
                    <div className="text-xs text-yellow-700">
                      코드 품질 및 보안 평가
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎯</span>
                  <div>
                    <div className="font-medium text-yellow-900">
                      도메인 전문가
                    </div>
                    <div className="text-xs text-yellow-700">
                      산업 전문성 및 실용성 평가
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">선택한 레벨</span>
              <span className="font-medium">{selectedLevelInfo.name}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">검증 비용</span>
              <span className="font-medium">
                ${(selectedLevelInfo.fee / 100).toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">상품명</span>
              <span className="font-medium">{product.name}</span>
            </div>
          </div>

          {/* Notice */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>• 검증 비용은 계정 잔액에서 차감됩니다.</p>
            <p>• 검증 완료 후 환불은 불가능합니다.</p>
            <p>
              • Level 1 검증은 일반적으로 2-3일 소요됩니다.
            </p>
            <p>
              • Level 3 검증은 4명의 전문가 검수로 5-7일 소요됩니다.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={requestMutation.isPending}>
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={requestMutation.isPending || selectedLevel > 1}
          >
            {requestMutation.isPending
              ? '요청 중...'
              : selectedLevel > 1
              ? '출시 예정'
              : `${(selectedLevelInfo.fee / 100).toFixed(0)}달러 결제 및 요청`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
