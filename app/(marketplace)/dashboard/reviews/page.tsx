'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReviewStats } from '@/components/reviews/ReviewStats';
import { RatingDistribution } from '@/components/reviews/RatingDistribution';
import { ReviewFilters } from '@/components/reviews/ReviewFilters';
import { SellerReviewList } from '@/components/reviews/SellerReviewList';
import { QuickReplyTemplates } from '@/components/reviews/QuickReplyTemplates';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Download, FileText, Flag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRequireRole } from '@/lib/auth/middleware-helper';
import { UserRole } from '@/src/lib/auth/types';

interface Filters {
  rating?: number;
  productId?: string;
  responseStatus?: 'all' | 'answered' | 'unanswered';
  sortBy?: 'date' | 'rating' | 'helpful';
  search?: string;
}

export default function SellerReviewsPage() {
  // Require seller role
  useRequireRole([UserRole.SELLER, UserRole.ADMIN]);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<Filters>({
    responseStatus: 'all',
    sortBy: 'date',
  });
  const [page, setPage] = useState(1);
  const [selectedReviews, setSelectedReviews] = useState<string[]>([]);

  // Fetch review statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['seller-review-stats'],
    queryFn: async () => {
      const res = await fetch('/api/reviews/seller/stats', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    },
  });

  // Fetch reviews
  const {
    data: reviewsData,
    isLoading: reviewsLoading,
    refetch: refetchReviews,
  } = useQuery({
    queryKey: ['seller-reviews', filters, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(filters.rating && { rating: filters.rating.toString() }),
        ...(filters.productId && { productId: filters.productId }),
        ...(filters.responseStatus && { responseStatus: filters.responseStatus }),
        ...(filters.sortBy && { sortBy: filters.sortBy }),
        ...(filters.search && { search: filters.search }),
      });

      const res = await fetch(`/api/reviews/seller?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch reviews');
      return res.json();
    },
  });

  // Fetch seller products for filter
  const { data: products } = useQuery({
    queryKey: ['seller-products'],
    queryFn: async () => {
      const res = await fetch('/api/products', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      return data.products || [];
    },
  });

  // Reply mutation
  const replyMutation = useMutation({
    mutationFn: async ({ reviewId, reply }: { reviewId: string; reply: string }) => {
      const res = await fetch(`/api/reviews/${reviewId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ reply }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to add reply');
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: '답변 등록 완료',
        description: '고객에게 답변이 전송되었습니다.',
      });
      queryClient.invalidateQueries({ queryKey: ['seller-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['seller-review-stats'] });
    },
    onError: (error: Error) => {
      toast({
        title: '답변 등록 실패',
        description: error.message,
        variant: 'error',
      });
    },
  });

  // Edit reply mutation
  const editReplyMutation = useMutation({
    mutationFn: async ({ reviewId, reply }: { reviewId: string; reply: string }) => {
      const res = await fetch(`/api/reviews/${reviewId}/reply`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ reply }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update reply');
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: '답변 수정 완료',
        description: '답변이 수정되었습니다.',
      });
      queryClient.invalidateQueries({ queryKey: ['seller-reviews'] });
    },
    onError: (error: Error) => {
      toast({
        title: '답변 수정 실패',
        description: error.message,
        variant: 'error',
      });
    },
  });

  // Delete reply mutation
  const deleteReplyMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const res = await fetch(`/api/reviews/${reviewId}/reply`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete reply');
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: '답변 삭제 완료',
        description: '답변이 삭제되었습니다.',
      });
      queryClient.invalidateQueries({ queryKey: ['seller-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['seller-review-stats'] });
    },
    onError: (error: Error) => {
      toast({
        title: '답변 삭제 실패',
        description: error.message,
        variant: 'error',
      });
    },
  });

  const handleFilterChange = useCallback((newFilters: Filters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page on filter change
  }, []);

  const handleLoadMore = useCallback(() => {
    setPage((prev) => prev + 1);
  }, []);

  const handleReply = async (reviewId: string, reply: string) => {
    await replyMutation.mutateAsync({ reviewId, reply });
  };

  const handleEditReply = async (reviewId: string, reply: string) => {
    await editReplyMutation.mutateAsync({ reviewId, reply });
  };

  const handleDeleteReply = async (reviewId: string) => {
    await deleteReplyMutation.mutateAsync(reviewId);
  };

  const handleReport = (reviewId: string) => {
    toast({
      title: '리뷰 신고',
      description: '부적절한 리뷰를 관리자에게 신고했습니다.',
    });
    // In production, implement actual report functionality
  };

  const handleExportCSV = () => {
    if (!reviewsData?.reviews) return;

    const csv = [
      ['날짜', '상품명', '고객명', '평점', '리뷰 내용', '판매자 답변', '답변 날짜'].join(','),
      ...reviewsData.reviews.map((review: any) =>
        [
          new Date(review.created_at).toLocaleDateString('ko-KR'),
          review.product.name,
          review.user.name,
          review.rating,
          `"${review.comment.replace(/"/g, '""')}"`,
          review.seller_reply ? `"${review.seller_reply.replace(/"/g, '""')}"` : '',
          review.seller_replied_at
            ? new Date(review.seller_replied_at).toLocaleDateString('ko-KR')
            : '',
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reviews_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: '내보내기 완료',
      description: 'CSV 파일이 다운로드되었습니다.',
    });
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">리뷰 관리</h1>
          <p className="text-gray-600 mt-1">
            고객 리뷰를 확인하고 답변을 작성하세요
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            CSV 내보내기
          </Button>
        </div>
      </div>

      {/* Statistics */}
      {stats && !statsLoading && (
        <ReviewStats
          stats={{
            averageRating: stats.averageRating,
            totalReviews: stats.totalReviews,
            recentReviewsCount: stats.recentReviewsCount,
            responseRate: stats.responseRate,
            averageResponseTime: stats.averageResponseTime,
          }}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Filters */}
          {products && (
            <ReviewFilters
              products={products}
              onFilterChange={handleFilterChange}
            />
          )}

          {/* Reviews List */}
          <SellerReviewList
            reviews={reviewsData?.reviews || []}
            isLoading={reviewsLoading}
            hasMore={reviewsData?.hasMore}
            onLoadMore={handleLoadMore}
            onReply={handleReply}
            onEditReply={handleEditReply}
            onDeleteReply={handleDeleteReply}
            onReport={handleReport}
          />
        </div>

        <div className="space-y-6">
          {/* Rating Distribution */}
          {stats && !statsLoading && (
            <RatingDistribution
              distribution={stats.distribution}
              totalReviews={stats.totalReviews}
            />
          )}

          {/* Quick Reply Templates */}
          <QuickReplyTemplates
            onSelectTemplate={(template) => {
              // This is a helper - actual selection happens in the reply form
              toast({
                title: '템플릿 선택됨',
                description: '리뷰 답변 작성 시 사용하세요.',
              });
            }}
          />

          {/* Help Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                리뷰 관리 팁
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>모든 리뷰에 24시간 내 답변하는 것을 권장합니다</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>부정적 리뷰에도 정중하고 전문적으로 응답하세요</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>구체적인 해결책을 제시하면 신뢰도가 높아집니다</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>긍정적 리뷰에도 감사 인사를 남기세요</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
