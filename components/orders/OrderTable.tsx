'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  Eye,
  Download,
  MoreVertical,
  FileText,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';

export interface OrderData {
  id: string;
  buyer: {
    id: string;
    name: string | null;
    email: string;
  };
  product: {
    id: string;
    name: string;
  };
  amount: number;
  platform_fee: number;
  seller_amount: number;
  currency: string;
  status: 'PENDING' | 'PAID' | 'COMPLETED' | 'REFUNDED' | 'CANCELLED' | 'FAILED';
  payment_provider?: string;
  refund_requested: boolean;
  createdAt: string;
  paid_at?: string;
}

interface OrderTableProps {
  orders: OrderData[];
  isLoading?: boolean;
  onViewDetails: (order: OrderData) => void;
  onDownloadInvoice: (orderId: string) => void;
  onProcessRefund?: (orderId: string) => void;
  onMarkCompleted?: (orderId: string) => void;
}

const STATUS_CONFIG = {
  PENDING: { label: '대기 중', variant: 'outline' as const, color: 'text-yellow-600' },
  PAID: { label: '결제 완료', variant: 'default' as const, color: 'text-blue-600' },
  COMPLETED: { label: '완료', variant: 'secondary' as const, color: 'text-green-600' },
  REFUNDED: { label: '환불됨', variant: 'destructive' as const, color: 'text-red-600' },
  CANCELLED: { label: '취소됨', variant: 'destructive' as const, color: 'text-gray-600' },
  FAILED: { label: '실패', variant: 'destructive' as const, color: 'text-red-600' },
};

export function OrderTable({
  orders,
  isLoading,
  onViewDetails,
  onDownloadInvoice,
  onProcessRefund,
  onMarkCompleted,
}: OrderTableProps) {
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(new Set(orders.map((order) => order.id)));
    } else {
      setSelectedOrders(new Set());
    }
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    const newSelected = new Set(selectedOrders);
    if (checked) {
      newSelected.add(orderId);
    } else {
      newSelected.delete(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const allSelected = orders.length > 0 && selectedOrders.size === orders.length;
  const someSelected = selectedOrders.size > 0 && selectedOrders.size < orders.length;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-16 animate-pulse rounded-lg bg-gray-100"
          />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-12">
        <FileText className="mb-4 h-12 w-12 text-gray-400" />
        <h3 className="mb-2 text-lg font-semibold text-gray-900">
          주문이 없습니다
        </h3>
        <p className="text-sm text-gray-600">
          검색 조건을 변경하거나 필터를 초기화해보세요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions Bar */}
      {selectedOrders.size > 0 && (
        <div className="flex items-center justify-between rounded-lg bg-blue-50 px-4 py-3">
          <span className="text-sm font-medium text-blue-900">
            {selectedOrders.size}개 선택됨
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                // Handle bulk export
                const selectedOrdersList = orders.filter((order) =>
                  selectedOrders.has(order.id)
                );
                console.log('Export orders:', selectedOrdersList);
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              내보내기
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedOrders(new Set())}
            >
              선택 해제
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-12">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="모두 선택"
                    ref={(el) => {
                      if (el) {
                        (el as any).indeterminate = someSelected;
                      }
                    }}
                  />
                </TableHead>
                <TableHead className="min-w-[120px]">주문 ID</TableHead>
                <TableHead className="min-w-[180px]">날짜 및 시간</TableHead>
                <TableHead className="min-w-[200px]">고객</TableHead>
                <TableHead className="min-w-[200px]">상품</TableHead>
                <TableHead className="min-w-[120px] text-right">총 금액</TableHead>
                <TableHead className="min-w-[100px] text-right">
                  플랫폼 수수료
                </TableHead>
                <TableHead className="min-w-[120px] text-right">
                  판매자 수익
                </TableHead>
                <TableHead className="min-w-[100px] text-center">상태</TableHead>
                <TableHead className="w-[100px] text-center">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const statusConfig = STATUS_CONFIG[order.status];
                const isSelected = selectedOrders.has(order.id);

                return (
                  <TableRow
                    key={order.id}
                    className={isSelected ? 'bg-blue-50' : ''}
                  >
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          handleSelectOrder(order.id, checked as boolean)
                        }
                        aria-label={`주문 ${order.id} 선택`}
                      />
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => onViewDetails(order)}
                        className="font-mono text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        #{order.id.slice(0, 8)}
                      </button>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {format(new Date(order.createdAt), 'PPP', { locale: ko })}
                        </div>
                        <div className="text-gray-500">
                          {format(new Date(order.createdAt), 'p', { locale: ko })}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {order.buyer.name || '익명 사용자'}
                        </div>
                        <div className="text-gray-500">{order.buyer.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/products/${order.product.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-blue-600 hover:underline"
                      >
                        {order.product.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(order.amount, order.currency)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="text-sm text-gray-600">
                        {formatCurrency(order.platform_fee, order.currency)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="text-sm font-semibold text-green-600">
                        {formatCurrency(order.seller_amount, order.currency)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <Badge variant={statusConfig.variant}>
                          {statusConfig.label}
                        </Badge>
                        {order.refund_requested && (
                          <Badge variant="outline" className="text-xs">
                            환불 요청됨
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">메뉴 열기</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => onViewDetails(order)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            상세 보기
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDownloadInvoice(order.id)}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            송장 다운로드
                          </DropdownMenuItem>
                          {order.status === 'PAID' && onMarkCompleted && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => onMarkCompleted(order.id)}
                              >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                완료 처리
                              </DropdownMenuItem>
                            </>
                          )}
                          {order.refund_requested &&
                            order.status !== 'REFUNDED' &&
                            onProcessRefund && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => onProcessRefund(order.id)}
                                  className="text-red-600"
                                >
                                  <RefreshCw className="mr-2 h-4 w-4" />
                                  환불 처리
                                </DropdownMenuItem>
                              </>
                            )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
