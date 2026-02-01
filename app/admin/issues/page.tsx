'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Refund {
  id: string;
  order_id: string;
  amount: number;
  reason: string | null;
  status: string;
  createdAt: string;
  order: {
    product: { id: string; name: string };
    buyer: { id: string; name: string | null; email: string };
  };
}

interface FlaggedReview {
  id: string;
  product_id: string;
  rating: number;
  comment: string;
  flag_reason: string | null;
  created_at: string;
  product: { id: string; name: string };
  user: { id: string; name: string | null; email: string };
}

interface Statistics {
  pendingRefunds: number;
  flaggedReviews: number;
  resolvedThisWeek: number;
}

export default function AdminIssuesPage() {
  const [activeTab, setActiveTab] = useState<'refunds' | 'reviews'>('refunds');
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [reviews, setReviews] = useState<FlaggedReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statistics, setStatistics] = useState<Statistics | null>(null);

  useEffect(() => {
    if (activeTab === 'refunds') fetchRefunds();
    else fetchReviews();
    fetchStatistics();
  }, [activeTab, filter, page]);

  const fetchRefunds = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' });
      if (filter !== 'ALL') params.append('status', filter);
      const response = await fetch(`/api/admin/issues/refunds?${params}`);
      const data = await response.json();
      setRefunds(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch refunds:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' });
      const response = await fetch(`/api/admin/issues/reviews?${params}`);
      const data = await response.json();
      setReviews(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/admin/issues/statistics');
      const data = await response.json();
      setStatistics(data.data);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  const handleRefundAction = async (refundId: string, action: 'approve' | 'reject') => {
    let reason = '';
    if (action === 'reject') {
      reason = prompt('거부 사유를 입력해주세요:') || '';
      if (!reason) return;
    }
    if (!confirm(`환불을 ${action === 'approve' ? '승인' : '거부'}하시겠습니까?`)) return;

    try {
      const response = await fetch(`/api/admin/issues/refunds/${refundId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason }),
      });
      if (response.ok) {
        alert('처리되었습니다.');
        fetchRefunds();
        fetchStatistics();
      } else {
        alert('처리에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('오류가 발생했습니다.');
    }
  };

  const handleReviewAction = async (reviewId: string, action: 'approve' | 'delete' | 'warn_user') => {
    const actionLabels = { approve: '유지(승인)', delete: '삭제', warn_user: '경고' };
    if (!confirm(`리뷰를 ${actionLabels[action]}하시겠습니까?`)) return;

    try {
      const response = await fetch(`/api/admin/issues/reviews/${reviewId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (response.ok) {
        alert('처리되었습니다.');
        fetchReviews();
        fetchStatistics();
      } else {
        alert('처리에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('오류가 발생했습니다.');
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      SUCCEEDED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100'}`}>{status}</span>;
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/admin"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />대시보드로 돌아가기</Button></Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">이슈 관리</h1>

      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">대기중 환불</h3>
            <p className="text-2xl font-bold text-yellow-900">{statistics.pendingRefunds}</p>
          </div>
          <div className="bg-red-50 p-6 rounded-lg border border-red-200">
            <h3 className="text-sm font-medium text-red-800 mb-2">신고된 리뷰</h3>
            <p className="text-2xl font-bold text-red-900">{statistics.flaggedReviews}</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-sm font-medium text-green-800 mb-2">이번 주 처리</h3>
            <p className="text-2xl font-bold text-green-900">{statistics.resolvedThisWeek}</p>
          </div>
        </div>
      )}

      <div className="flex gap-4 mb-6 border-b">
        <button onClick={() => { setActiveTab('refunds'); setPage(1); setFilter('ALL'); }} className={`pb-2 px-4 ${activeTab === 'refunds' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}>환불 요청</button>
        <button onClick={() => { setActiveTab('reviews'); setPage(1); }} className={`pb-2 px-4 ${activeTab === 'reviews' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}>신고된 리뷰</button>
      </div>

      {activeTab === 'refunds' && (
        <>
          <div className="flex gap-2 mb-6">
            {['ALL', 'PENDING', 'SUCCEEDED', 'FAILED'].map((status) => (
              <button key={status} onClick={() => { setFilter(status); setPage(1); }} className={`px-4 py-2 rounded ${filter === status ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                {status === 'ALL' ? '전체' : status === 'PENDING' ? '대기중' : status === 'SUCCEEDED' ? '승인됨' : '거부됨'}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">주문번호</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상품명</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">구매자</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">금액</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">사유</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">요청일</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">액션</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan={8} className="px-6 py-4 text-center text-gray-500">로딩 중...</td></tr>
                ) : refunds.length === 0 ? (
                  <tr><td colSpan={8} className="px-6 py-4 text-center text-gray-500">환불 요청이 없습니다.</td></tr>
                ) : refunds.map((refund) => (
                  <tr key={refund.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{refund.order_id.slice(0, 8)}...</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{refund.order?.product?.name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{refund.order?.buyer?.name || '-'}</div>
                      <div className="text-sm text-gray-500">{refund.order?.buyer?.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(refund.amount)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{refund.reason || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(refund.createdAt).toLocaleDateString('ko-KR')}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(refund.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {refund.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleRefundAction(refund.id, 'approve')} className="text-green-600 hover:text-green-900">승인</button>
                          <button onClick={() => handleRefundAction(refund.id, 'reject')} className="text-red-600 hover:text-red-900">거부</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'reviews' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상품명</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">작성자</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">평점</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">내용</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">신고 사유</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">신고일</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">액션</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-4 text-center text-gray-500">로딩 중...</td></tr>
              ) : reviews.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-4 text-center text-gray-500">신고된 리뷰가 없습니다.</td></tr>
              ) : reviews.map((review) => (
                <tr key={review.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{review.product?.name || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{review.user?.name || '-'}</div>
                    <div className="text-sm text-gray-500">{review.user?.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{'⭐'.repeat(review.rating)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{review.comment}</td>
                  <td className="px-6 py-4 text-sm text-red-600 max-w-xs truncate">{review.flag_reason || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(review.created_at).toLocaleDateString('ko-KR')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button onClick={() => handleReviewAction(review.id, 'approve')} className="text-green-600 hover:text-green-900">유지</button>
                      <button onClick={() => handleReviewAction(review.id, 'delete')} className="text-red-600 hover:text-red-900">삭제</button>
                      <button onClick={() => handleReviewAction(review.id, 'warn_user')} className="text-yellow-600 hover:text-yellow-900">경고</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 flex justify-center gap-2">
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 border rounded disabled:opacity-50">이전</button>
        <span className="px-4 py-2">{page} / {totalPages} 페이지</span>
        <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 border rounded disabled:opacity-50">다음</button>
      </div>
    </div>
  );
}
