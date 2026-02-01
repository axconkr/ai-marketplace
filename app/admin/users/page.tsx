'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  status: string;
  createdAt: string;
  _count: { orders: number; products: number };
}

interface Statistics {
  total: number;
  byRole: Record<string, number>;
  byStatus: Record<string, number>;
  newThisMonth: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statistics, setStatistics] = useState<Statistics | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchStatistics();
  }, [roleFilter, page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' });
      if (roleFilter !== 'ALL') params.append('role', roleFilter);
      if (search) params.append('search', search);

      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();
      setUsers(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/admin/users/statistics');
      const data = await response.json();
      setStatistics(data.data);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  const updateRole = async (userId: string, newRole: string) => {
    if (!confirm(`역할을 "${newRole}"로 변경하시겠습니까?`)) return;
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (response.ok) {
        alert('역할이 변경되었습니다.');
        fetchUsers();
        fetchStatistics();
      } else {
        const data = await response.json();
        alert(data.error || '역할 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      alert('오류가 발생했습니다.');
    }
  };

  const toggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    if (!confirm(`사용자를 ${newStatus === 'SUSPENDED' ? '정지' : '활성화'}하시겠습니까?`)) return;
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        alert('상태가 변경되었습니다.');
        fetchUsers();
        fetchStatistics();
      } else {
        const data = await response.json();
        alert(data.error || '상태 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('오류가 발생했습니다.');
    }
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-purple-100 text-purple-800',
      seller: 'bg-blue-100 text-blue-800',
      buyer: 'bg-green-100 text-green-800',
      verifier: 'bg-indigo-100 text-indigo-800',
      user: 'bg-gray-100 text-gray-800',
    };
    const labels: Record<string, string> = {
      admin: '관리자', seller: '판매자', buyer: '구매자', verifier: '검증자', user: '사용자',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[role] || 'bg-gray-100'}`}>
        {labels[role] || role}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      SUSPENDED: 'bg-yellow-100 text-yellow-800',
      BANNED: 'bg-red-100 text-red-800',
    };
    const labels: Record<string, string> = { ACTIVE: '활성', SUSPENDED: '정지', BANNED: '차단' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100'}`}>
        {labels[status] || status}
      </span>
    );
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

      <h1 className="text-3xl font-bold mb-8">사용자 관리</h1>

      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="text-sm font-medium text-gray-600 mb-2">전체</h3>
            <p className="text-2xl font-bold">{statistics.total}</p>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <h3 className="text-sm font-medium text-purple-800 mb-2">관리자</h3>
            <p className="text-2xl font-bold text-purple-900">{statistics.byRole?.admin || 0}</p>
          </div>
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-sm font-medium text-blue-800 mb-2">판매자</h3>
            <p className="text-2xl font-bold text-blue-900">{statistics.byRole?.seller || 0}</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-sm font-medium text-green-800 mb-2">구매자</h3>
            <p className="text-2xl font-bold text-green-900">{statistics.byRole?.buyer || 0}</p>
          </div>
          <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
            <h3 className="text-sm font-medium text-indigo-800 mb-2">검증자</h3>
            <p className="text-2xl font-bold text-indigo-900">{statistics.byRole?.verifier || 0}</p>
          </div>
          <div className="bg-red-50 p-6 rounded-lg border border-red-200">
            <h3 className="text-sm font-medium text-red-800 mb-2">정지됨</h3>
            <p className="text-2xl font-bold text-red-900">{(statistics.byStatus?.SUSPENDED || 0) + (statistics.byStatus?.BANNED || 0)}</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex gap-2">
          {['ALL', 'admin', 'seller', 'buyer', 'verifier'].map((role) => (
            <button
              key={role}
              onClick={() => { setRoleFilter(role); setPage(1); }}
              className={`px-4 py-2 rounded ${roleFilter === role ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              {role === 'ALL' ? '전체' : role === 'admin' ? '관리자' : role === 'seller' ? '판매자' : role === 'buyer' ? '구매자' : '검증자'}
            </button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); setPage(1); fetchUsers(); }} className="flex gap-2">
          <input type="text" placeholder="이메일/이름 검색..." value={search} onChange={(e) => setSearch(e.target.value)} className="px-4 py-2 border rounded" />
          <button type="submit" className="px-4 py-2 bg-gray-800 text-white rounded">검색</button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이메일</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">역할</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">가입일</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">주문수</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상품수</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">액션</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={8} className="px-6 py-4 text-center text-gray-500">로딩 중...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={8} className="px-6 py-4 text-center text-gray-500">사용자가 없습니다.</td></tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{user.name || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getRoleBadge(user.role)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(user.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString('ko-KR')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user._count?.orders || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user._count?.products || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2 items-center">
                      <select
                        value={user.role}
                        onChange={(e) => updateRole(user.id, e.target.value)}
                        className="text-sm border rounded px-2 py-1"
                      >
                        <option value="admin">관리자</option>
                        <option value="seller">판매자</option>
                        <option value="buyer">구매자</option>
                        <option value="verifier">검증자</option>
                      </select>
                      <button
                        onClick={() => toggleStatus(user.id, user.status)}
                        className={user.status === 'ACTIVE' ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}
                      >
                        {user.status === 'ACTIVE' ? '정지' : '활성화'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-center gap-2">
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 border rounded disabled:opacity-50">이전</button>
        <span className="px-4 py-2">{page} / {totalPages} 페이지</span>
        <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 border rounded disabled:opacity-50">다음</button>
      </div>
    </div>
  );
}
