'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface RefundModalProps {
  orderId: string | null;
  orderAmount: number;
  currency: string;
  refundReason?: string;
  open: boolean;
  onClose: () => void;
  onConfirm: (orderId: string, adminNotes: string) => void;
  isProcessing?: boolean;
}

export function RefundModal({
  orderId,
  orderAmount,
  currency,
  refundReason,
  open,
  onClose,
  onConfirm,
  isProcessing = false,
}: RefundModalProps) {
  const [adminNotes, setAdminNotes] = useState('');

  const handleConfirm = () => {
    if (!orderId) return;
    onConfirm(orderId, adminNotes);
  };

  const handleClose = () => {
    setAdminNotes('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>환불 요청 승인</DialogTitle>
          <DialogDescription>
            이 주문에 대한 환불을 처리하시겠습니까?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Refund Amount */}
          <div className="rounded-lg bg-red-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-red-900">
                환불 금액
              </span>
              <span className="text-lg font-bold text-red-900">
                {formatCurrency(orderAmount, currency)}
              </span>
            </div>
            <p className="mt-2 text-xs text-red-700">
              플랫폼 수수료는 환불되지 않으며, 판매자 계정에서 차감됩니다.
            </p>
          </div>

          {/* Customer's Refund Reason */}
          {refundReason && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">고객의 환불 사유</Label>
              <div className="rounded-lg border bg-gray-50 p-3 text-sm text-gray-700">
                {refundReason}
              </div>
            </div>
          )}

          {/* Admin Notes */}
          <div className="space-y-2">
            <Label htmlFor="admin-notes">
              관리자 메모 <span className="text-gray-500">(선택사항)</span>
            </Label>
            <Textarea
              id="admin-notes"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="환불 처리에 대한 메모를 입력하세요..."
              rows={3}
            />
          </div>

          {/* Warning */}
          <div className="flex gap-2 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <div>
              <p className="font-medium">주의사항</p>
              <ul className="mt-1 list-inside list-disc space-y-1 text-xs">
                <li>환불 처리는 되돌릴 수 없습니다</li>
                <li>고객의 파일 접근 권한이 즉시 제거됩니다</li>
                <li>환불 금액은 5-10 영업일 내에 처리됩니다</li>
                <li>환불 수수료가 발생할 수 있습니다</li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isProcessing}
            >
              취소
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirm}
              className="flex-1"
              disabled={isProcessing}
            >
              {isProcessing ? (
                '처리 중...'
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  환불 승인
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
