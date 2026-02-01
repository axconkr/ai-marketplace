'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminProduct {
  id: string;
  name: string;
  price: number;
  status: string;
  category: string | null;
  seller: { id: string; name: string | null; email: string };
  createdAt: string;
  download_count: number;
  rating_average: number | null;
}

interface Statistics {
  total: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statistics, setStatistics] = useState<Statistics | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchStatistics();
  }, [filter, page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      if (filter !== 'ALL') params.append('status', filter);
      if (search) params.append('search', search);

      const response = await fetch(`/api/admin/products?${params}`);
      const data = await response.json();
      setProducts(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/admin/products/statistics');
      const data = await response.json();
      setStatistics(data.data);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  const updateStatus = async (productId: string, status: string) => {
    if (!confirm(`상품 상태를 "${status}"로 변경하시겠습니까?`)) return;

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        alert('상태가 변경되었습니다.');
        fetchProducts();
        fetchStatistics();
      } else {
        alert('상태 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('오류가 발생했습니다.');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      suspended: 'bg-orange-100 text-orange-800',
    };
    const labels: Record<string, string> = {
      draft: '임시저장',
      pending: '대기중',
      approved: '승인됨',
      rejected: '거부됨',
      suspended: '정지됨',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/admin">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            대시보드로 돌아가기
          </Button>
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">상품 관리</h1>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="text-sm font-medium text-gray-600 mb-2">전체 상품</h3>
            <p className="text-2xl font-bold">{statistics.total}</p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">승인 대기</h3>
            <p className="text-2xl font-bold text-yellow-900">{statistics.byStatus?.pending || 0}</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-sm font-medium text-green-800 mb-2">승인됨</h3>
            <p className="text-2xl font-bold text-green-900">{statistics.byStatus?.approved || 0}</p>
          </div>
          <div className="bg-red-50 p-6 rounded-lg border border-red-200">
            <h3 className="text-sm font-medium text-red-800 mb-2">거부됨</h3>
            <p className="text-2xl font-bold text-red-900">{statistics.byStatus?.rejected || 0}</p>
          </div>
          <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
            <h3 className="text-sm font-medium text-orange-800 mb-2">정지됨</h3>
            <p className="text-2xl font-bold text-orange-900">{statistics.byStatus?.suspended || 0}</p>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex gap-2">
          {['ALL', 'pending', 'approved', 'rejected', 'suspended'].map((status) => (
            <button
              key={status}
              onClick={() => { setFilter(status); setPage(1); }}
              className={`px-4 py-2 rounded ${
                filter === status ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {status === 'ALL' ? '전체' : status === 'pending' ? '대기중' : status === 'approved' ? '승인됨' : status === 'rejected' ? '거부됨' : '정지됨'}
            </button>
          ))}
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="상품명 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border rounded"
          />
          <button type="submit" className="px-4 py-2 bg-gray-800 text-white rounded">
            검색
          </button>
        </form>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상품명</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">판매자</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">카테고리</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">가격</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">등록일</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">액션</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">로딩 중...</td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">상품이 없습니다.</td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{product.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{product.seller?.name || '이름 없음'}</div>
                    <div className="text-sm text-gray-500">{product.seller?.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.category || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(product.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(product.createdAt).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      {product.status === 'pending' && (
                        <>
                          <button onClick={() => updateStatus(product.id, 'approved')} className="text-green-600 hover:text-green-900">승인</button>
                          <button onClick={() => updateStatus(product.id, 'rejected')} className="text-red-600 hover:text-red-900">거부</button>
                        </>
                      )}
                      {product.status === 'approved' && (
                        <button onClick={() => updateStatus(product.id, 'suspended')} className="text-orange-600 hover:text-orange-900">정지</button>
                      )}
                      {product.status === 'suspended' && (
                        <button onClick={() => updateStatus(product.id, 'approved')} className="text-green-600 hover:text-green-900">활성화</button>
                      )}
                      <Link href={`/products/${product.id}`} className="text-blue-600 hover:text-blue-900">상세</Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-center gap-2">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          이전
        </button>
        <span className="px-4 py-2">
          {page} / {totalPages} 페이지
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          다음
        </button>
      </div>
    </div>
  );
}
