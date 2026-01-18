'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Download } from 'lucide-react';
import { OrderStats } from '@/components/orders/OrderStats';
import { OrderFilters, OrderFilterState } from '@/components/orders/OrderFilters';
import { OrderTable, OrderData } from '@/components/orders/OrderTable';
import { SellerOrderDetailsModal } from '@/components/orders/SellerOrderDetailsModal';
import { RefundModal } from '@/components/orders/RefundModal';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const ORDERS_PER_PAGE = 20;

export default function OrdersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Filter state
  const [filters, setFilters] = useState<OrderFilterState>({
    search: '',
    status: 'all',
    dateRange: {
      from: (() => {
        const date = new Date();
        date.setDate(date.getDate() - 30);
        return date;
      })(),
      to: new Date(),
    },
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Modal state
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [refundOrderId, setRefundOrderId] = useState<string | null>(null);

  // Fetch orders
  const { data: ordersResponse, isLoading } = useQuery({
    queryKey: ['seller-orders'],
    queryFn: async () => {
      const res = await fetch('/api/orders');
      if (!res.ok) throw new Error('Failed to fetch orders');
      return res.json();
    },
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  const orders: OrderData[] = ordersResponse || [];

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (order) =>
          order.id.toLowerCase().includes(searchLower) ||
          order.product.name.toLowerCase().includes(searchLower) ||
          order.buyer.email.toLowerCase().includes(searchLower) ||
          (order.buyer.name && order.buyer.name.toLowerCase().includes(searchLower))
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      result = result.filter((order) => order.status === filters.status);
    }

    // Date range filter
    if (filters.dateRange.from && filters.dateRange.to) {
      result = result.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return (
          orderDate >= filters.dateRange.from! &&
          orderDate <= filters.dateRange.to!
        );
      });
    }

    // Sort
    result.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (filters.sortBy) {
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = a.createdAt;
          bValue = b.createdAt;
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return result;
  }, [orders, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  );

  // Reset to page 1 when filters change
  const handleFiltersChange = (newFilters: OrderFilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  // Calculate stats
  const stats = useMemo(() => {
    const totalRevenue = filteredOrders.reduce(
      (sum, order) =>
        sum +
        (order.status === 'PAID' || order.status === 'COMPLETED'
          ? order.seller_amount
          : 0),
      0
    );
    const pendingOrders = filteredOrders.filter(
      (o) => o.status === 'PENDING'
    ).length;
    const refundedOrders = filteredOrders.filter(
      (o) => o.status === 'REFUNDED'
    ).length;
    const refundRate =
      filteredOrders.length > 0
        ? (refundedOrders / filteredOrders.length) * 100
        : 0;

    return {
      totalOrders: filteredOrders.length,
      totalRevenue,
      pendingOrders,
      refundRate,
    };
  }, [filteredOrders]);

  // Download invoice mutation
  const downloadInvoiceMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const res = await fetch(`/api/orders/${orderId}/invoice`);
      if (!res.ok) throw new Error('Failed to download invoice');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast({
        title: '성공',
        description: '송장이 다운로드되었습니다.',
      });
    },
    onError: (error) => {
      toast({
        title: '오류',
        description: '송장 다운로드에 실패했습니다.',
        variant: 'error',
      });
    },
  });

  // Mark completed mutation
  const markCompletedMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const res = await fetch(`/api/orders/${orderId}/complete`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to mark as completed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
      toast({
        title: '성공',
        description: '주문이 완료 처리되었습니다.',
      });
    },
    onError: () => {
      toast({
        title: '오류',
        description: '주문 완료 처리에 실패했습니다.',
        variant: 'error',
      });
    },
  });

  // Process refund mutation
  const processRefundMutation = useMutation({
    mutationFn: async ({
      orderId,
      adminNotes,
    }: {
      orderId: string;
      adminNotes: string;
    }) => {
      const res = await fetch(`/api/orders/${orderId}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNotes }),
      });
      if (!res.ok) throw new Error('Failed to process refund');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
      setRefundModalOpen(false);
      setRefundOrderId(null);
      toast({
        title: '성공',
        description: '환불이 승인되었습니다. 처리까지 5-10 영업일이 소요됩니다.',
      });
    },
    onError: () => {
      toast({
        title: '오류',
        description: '환불 처리에 실패했습니다.',
        variant: 'error',
      });
    },
  });

  // Export to CSV
  const handleExportCSV = () => {
    const csvContent = [
      [
        '주문 ID',
        '날짜',
        '고객 이름',
        '고객 이메일',
        '상품명',
        '총 금액',
        '플랫폼 수수료',
        '판매자 수익',
        '상태',
      ],
      ...filteredOrders.map((order) => [
        order.id,
        new Date(order.createdAt).toISOString(),
        order.buyer.name || '',
        order.buyer.email,
        order.product.name,
        order.amount.toString(),
        order.platform_fee.toString(),
        order.seller_amount.toString(),
        order.status,
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast({
      title: '성공',
      description: 'CSV 파일이 다운로드되었습니다.',
    });
  };

  // Handlers
  const handleViewDetails = (order: OrderData) => {
    setSelectedOrder(order);
    setDetailsModalOpen(true);
  };

  const handleProcessRefund = (orderId: string) => {
    setRefundOrderId(orderId);
    setRefundModalOpen(true);
  };

  const handleConfirmRefund = (orderId: string, adminNotes: string) => {
    processRefundMutation.mutate({ orderId, adminNotes });
  };

  const refundOrder = refundOrderId
    ? orders.find((o) => o.id === refundOrderId)
    : null;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">주문 관리</h1>
          <p className="mt-1 text-gray-600">
            고객 주문을 조회하고 관리하세요
          </p>
        </div>
        <Button onClick={handleExportCSV} disabled={filteredOrders.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          CSV 내보내기
        </Button>
      </div>

      {/* Statistics */}
      <div className="mb-6">
        <OrderStats
          totalOrders={stats.totalOrders}
          totalRevenue={stats.totalRevenue}
          pendingOrders={stats.pendingOrders}
          refundRate={stats.refundRate}
        />
      </div>

      {/* Filters */}
      <div className="mb-6">
        <OrderFilters filters={filters} onFiltersChange={handleFiltersChange} />
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            전체 주문 ({filteredOrders.length.toLocaleString()})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <OrderTable
            orders={paginatedOrders}
            isLoading={isLoading}
            onViewDetails={handleViewDetails}
            onDownloadInvoice={(orderId) =>
              downloadInvoiceMutation.mutate(orderId)
            }
            onProcessRefund={handleProcessRefund}
            onMarkCompleted={(orderId) => markCompletedMutation.mutate(orderId)}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        setCurrentPage((p) => Math.max(1, p - 1))
                      }
                      className={
                        currentPage === 1
                          ? 'pointer-events-none opacity-50'
                          : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>

                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    // Show first page, last page, current page, and pages around current
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            onClick={() => setCurrentPage(pageNum)}
                            isActive={currentPage === pageNum}
                            className="cursor-pointer"
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    } else if (
                      pageNum === currentPage - 2 ||
                      pageNum === currentPage + 2
                    ) {
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    return null;
                  })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      className={
                        currentPage === totalPages
                          ? 'pointer-events-none opacity-50'
                          : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>

              <div className="mt-2 text-center text-sm text-gray-600">
                페이지 {currentPage} / {totalPages} (총{' '}
                {filteredOrders.length.toLocaleString()}개 주문)
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      <SellerOrderDetailsModal
        order={selectedOrder}
        open={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedOrder(null);
        }}
        onDownloadInvoice={(orderId) => downloadInvoiceMutation.mutate(orderId)}
        onProcessRefund={handleProcessRefund}
        onMarkCompleted={(orderId) => markCompletedMutation.mutate(orderId)}
      />

      {/* Refund Modal */}
      {refundOrder && (
        <RefundModal
          orderId={refundOrderId}
          orderAmount={refundOrder.amount}
          currency={refundOrder.currency}
          open={refundModalOpen}
          onClose={() => {
            setRefundModalOpen(false);
            setRefundOrderId(null);
          }}
          onConfirm={handleConfirmRefund}
          isProcessing={processRefundMutation.isPending}
        />
      )}
    </div>
  );
}
