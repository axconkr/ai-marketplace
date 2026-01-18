'use client';

import { useState } from 'react';
import { useOrders, useDownloadOrderFiles } from '@/hooks/use-orders';
import { OrderCard } from '@/components/orders/OrderCard';
import { OrderDetailsModal } from '@/components/orders/OrderDetailsModal';
import { RefundRequestModal } from '@/components/orders/RefundRequestModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { Order } from '@/lib/api/orders';

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [refundOrderId, setRefundOrderId] = useState<string | null>(null);
  const [refundOrderAmount, setRefundOrderAmount] = useState(0);
  const [refundOrderCurrency, setRefundOrderCurrency] = useState('USD');

  const pageSize = 10;
  const { data, isLoading, error } = useOrders(
    page,
    pageSize,
    statusFilter || undefined
  );
  const downloadMutation = useDownloadOrderFiles();

  const handleDownload = (orderId: string) => {
    downloadMutation.mutate(orderId);
  };

  const handleViewDetails = (orderId: string) => {
    const order = data?.orders.find((o) => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
      setDetailsModalOpen(true);
    }
  };

  const handleRequestRefund = (orderId: string) => {
    const order = data?.orders.find((o) => o.id === orderId);
    if (order) {
      setRefundOrderId(orderId);
      setRefundOrderAmount(order.amount);
      setRefundOrderCurrency(order.currency);
      setRefundModalOpen(true);
    }
  };

  const handleRefundSuccess = () => {
    // Refresh orders list
    setRefundModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-gray-200"></div>
          <div className="h-64 rounded-lg bg-gray-200"></div>
          <div className="h-64 rounded-lg bg-gray-200"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-600">주문 내역을 불러오는데 실패했습니다</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              다시 시도
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const orders = data?.orders || [];
  const totalPages = data ? Math.ceil(data.total / pageSize) : 1;

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="mb-2 flex items-center gap-2 text-3xl font-bold">
          <Package className="h-8 w-8" />
          내 주문
        </h1>
        <p className="text-gray-600">
          구매한 상품을 확인하고 관리하세요
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex items-center gap-4">
        <div className="w-full sm:w-64">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="모든 상태" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">모든 상태</SelectItem>
              <SelectItem value="PENDING">대기 중</SelectItem>
              <SelectItem value="PAID">결제 완료</SelectItem>
              <SelectItem value="COMPLETED">완료</SelectItem>
              <SelectItem value="REFUNDED">환불됨</SelectItem>
              <SelectItem value="CANCELLED">취소됨</SelectItem>
              <SelectItem value="FAILED">실패</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {statusFilter && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStatusFilter('')}
          >
            필터 지우기
          </Button>
        )}
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className="mb-2 text-lg font-semibold text-gray-600">
              주문 내역이 없습니다
            </p>
            <p className="mb-4 text-sm text-gray-500">
              {statusFilter
                ? '필터를 변경해보세요'
                : '쇼핑을 시작하여 주문 내역을 확인하세요'}
            </p>
            <Button onClick={() => (window.location.href = '/products')}>
              상품 둘러보기
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onDownload={handleDownload}
                onViewDetails={handleViewDetails}
                onRequestRefund={handleRequestRefund}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                전체 {data!.total}개 중 {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, data!.total)}개 표시
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  이전
                </Button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => {
                      // Show first, last, current, and adjacent pages
                      return (
                        p === 1 ||
                        p === totalPages ||
                        Math.abs(p - page) <= 1
                      );
                    })
                    .map((p, idx, arr) => {
                      // Add ellipsis
                      const prevPage = arr[idx - 1];
                      const showEllipsis = prevPage && p - prevPage > 1;

                      return (
                        <div key={p} className="flex items-center gap-2">
                          {showEllipsis && (
                            <span className="text-gray-400">...</span>
                          )}
                          <Button
                            variant={p === page ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPage(p)}
                          >
                            {p}
                          </Button>
                        </div>
                      );
                    })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  다음
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <OrderDetailsModal
        order={selectedOrder}
        open={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedOrder(null);
        }}
        onDownload={handleDownload}
        onRequestRefund={handleRequestRefund}
      />

      <RefundRequestModal
        orderId={refundOrderId}
        orderAmount={refundOrderAmount}
        currency={refundOrderCurrency}
        open={refundModalOpen}
        onClose={() => {
          setRefundModalOpen(false);
          setRefundOrderId(null);
        }}
        onSuccess={handleRefundSuccess}
      />
    </div>
  );
}
