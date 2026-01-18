'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRequestRefund } from '@/hooks/use-payment';
import { AlertCircle } from 'lucide-react';

const refundSchema = z.object({
  reason: z.string().min(1, 'Please select a reason'),
  comments: z.string().optional(),
});

type RefundFormData = z.infer<typeof refundSchema>;

interface RefundRequestModalProps {
  orderId: string | null;
  orderAmount: number;
  currency: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const REFUND_REASONS = [
  { value: 'not_as_described', label: 'Product not as described' },
  { value: 'technical_issue', label: 'Technical issues with files' },
  { value: 'duplicate_purchase', label: 'Duplicate purchase' },
  { value: 'changed_mind', label: 'Changed my mind' },
  { value: 'poor_quality', label: 'Poor quality' },
  { value: 'other', label: 'Other' },
];

export function RefundRequestModal({
  orderId,
  orderAmount,
  currency,
  open,
  onClose,
  onSuccess,
}: RefundRequestModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const refundMutation = useRequestRefund();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RefundFormData>({
    resolver: zodResolver(refundSchema),
  });

  const onSubmit = async (data: RefundFormData) => {
    if (!orderId) return;

    try {
      const reasonLabel =
        REFUND_REASONS.find((r) => r.value === data.reason)?.label ||
        data.reason;
      const refundReason = data.comments
        ? `${reasonLabel}: ${data.comments}`
        : reasonLabel;

      await refundMutation.mutateAsync({
        orderId,
        reason: refundReason,
      });

      reset();
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Refund request failed:', error);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedReason('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Request Refund</DialogTitle>
          <DialogDescription>
            Please provide a reason for your refund request.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Refund Amount */}
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Refund Amount</span>
              <span className="text-lg font-bold">
                {formatCurrency(orderAmount, currency)}
              </span>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Full refund will be processed to your original payment method
            </p>
          </div>

          {/* Reason Selection */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Refund *</Label>
            <Select
              value={selectedReason}
              onValueChange={(value) => {
                setSelectedReason(value);
                register('reason').onChange({
                  target: { value, name: 'reason' },
                });
              }}
            >
              <SelectTrigger className={errors.reason ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {REFUND_REASONS.map((reason) => (
                  <SelectItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.reason && (
              <p className="text-sm text-red-500">{errors.reason.message}</p>
            )}
          </div>

          {/* Additional Comments */}
          <div className="space-y-2">
            <Label htmlFor="comments">Additional Comments (Optional)</Label>
            <Textarea
              id="comments"
              {...register('comments')}
              placeholder="Please provide any additional details..."
              rows={4}
            />
          </div>

          {/* Warning */}
          <div className="flex gap-2 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <p>
              Refunds are typically processed within 5-10 business days. You
              will lose access to the product files immediately upon refund
              approval.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={refundMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={refundMutation.isPending}
            >
              {refundMutation.isPending
                ? 'Submitting...'
                : 'Submit Refund Request'}
            </Button>
          </div>

          {refundMutation.isError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
              {refundMutation.error instanceof Error
                ? refundMutation.error.message
                : 'Failed to submit refund request'}
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}

function formatCurrency(amount: number, currency: string): string {
  if (currency === 'KRW') {
    return `₩${amount.toLocaleString('ko-KR')}`;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}
