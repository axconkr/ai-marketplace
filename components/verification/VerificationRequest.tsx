'use client';

import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRequestVerification } from '@/hooks/use-verifications';
import { VERIFICATION_LEVELS } from '@/lib/types/verification';
import type { VerificationLevel } from '@/lib/types/verification';
import { cn } from '@/lib/utils';

interface VerificationRequestProps {
  productId: string;
  onSuccess?: () => void;
}

export function VerificationRequest({
  productId,
  onSuccess,
}: VerificationRequestProps) {
  const [open, setOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<VerificationLevel | null>(
    null
  );
  const requestMutation = useRequestVerification();

  const handleRequest = async () => {
    if (selectedLevel === null) return;

    try {
      await requestMutation.mutateAsync({
        productId,
        level: selectedLevel,
      });
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to request verification:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>검증 요청</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>상품 검증 요청</DialogTitle>
          <DialogDescription>
            상품에 대한 검증 레벨을 선택하세요. 높은 레벨일수록 더 포괄적인 검토가 이루어지며 구매자의 신뢰도가 높아집니다.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {Object.entries(VERIFICATION_LEVELS).map(([level, config]) => {
            const levelNum = parseInt(level) as VerificationLevel;
            const isSelected = selectedLevel === levelNum;
            const isDisabled = config.comingSoon;

            return (
              <Card
                key={level}
                className={cn(
                  'cursor-pointer transition-all',
                  isSelected && 'ring-2 ring-blue-500',
                  isDisabled && 'opacity-50 cursor-not-allowed'
                )}
                onClick={() => !isDisabled && setSelectedLevel(levelNum)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{config.name}</CardTitle>
                    {config.comingSoon && (
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                        준비 중
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1">
                    {config.price === 0 ? (
                      <span className="text-2xl font-bold">무료</span>
                    ) : (
                      <>
                        <span className="text-2xl font-bold">
                          ${config.price}
                        </span>
                        <span className="text-sm text-gray-500">일회성</span>
                      </>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div
                      className={cn(
                        'inline-block px-3 py-1 rounded text-white text-sm font-medium',
                        config.color
                      )}
                    >
                      {config.badge} 뱃지
                    </div>
                    <ul className="space-y-2 mt-3">
                      {config.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            취소
          </Button>
          <Button
            onClick={handleRequest}
            disabled={
              selectedLevel === null ||
              requestMutation.isPending ||
              VERIFICATION_LEVELS[selectedLevel]?.comingSoon
            }
          >
            {requestMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                요청 중...
              </>
            ) : (
              `${selectedLevel !== null ? VERIFICATION_LEVELS[selectedLevel].name : '검증'} 요청`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
