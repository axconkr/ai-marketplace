'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SupportTicket {
  id: string;
  subject: string;
  description?: string;
  status: string;
  priority: string;
  resolution?: string | null;
  created_at: string;
  resolved_at?: string | null;
  user: { id: string; name: string | null; email: string };
  assignee: { id: string; name: string | null } | null;
}

interface Statistics {
  total: number;
  open: number;
  inProgress: number;
  avgResolutionHours: number;
  byPriority: Record<string, number>;
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  useEffect(() => {
    fetchTickets();
    fetchStatistics();
  }, [statusFilter, priorityFilter, page]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' });
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (priorityFilter !== 'ALL') params.append('priority', priorityFilter);
      const response = await fetch(`/api/admin/support?${params}`);
      const data = await response.json();
      setTickets(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/admin/support/statistics');
      const data = await response.json();
      setStatistics(data.data);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  const fetchTicketDetails = async (ticketId: string) => {
    try {
      const response = await fetch(`/api/admin/support/${ticketId}`);
      const data = await response.json();
      setSelectedTicket(data.data);
    } catch (error) {
      console.error('Failed to fetch ticket details:', error);
    }
  };

  const assignTicket = async (ticketId: string) => {
    try {
      const response = await fetch(`/api/admin/support/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assign_to_me: true }),
      });
      if (response.ok) {
        alert('티켓이 배정되었습니다.');
        fetchTickets();
        if (selectedTicket?.id === ticketId) fetchTicketDetails(ticketId);
      } else {
        alert('배정에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const updateStatus = async (ticketId: string, status: string) => {
    if (!confirm(`상태를 변경하시겠습니까?`)) return;
    try {
      const response = await fetch(`/api/admin/support/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        alert('상태가 변경되었습니다.');
        fetchTickets();
        fetchStatistics();
        if (selectedTicket?.id === ticketId) fetchTicketDetails(ticketId);
      } else {
        alert('변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const resolveTicket = async (ticketId: string) => {
    const resolution = prompt('해결 내용을 입력해주세요:');
    if (!resolution) return;
    try {
      const response = await fetch(`/api/admin/support/${ticketId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolution }),
      });
      if (response.ok) {
        alert('티켓이 해결되었습니다.');
        fetchTickets();
        fetchStatistics();
        setSelectedTicket(null);
      } else {
        alert('처리에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      OPEN: 'bg-yellow-100 text-yellow-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      RESOLVED: 'bg-green-100 text-green-800',
      CLOSED: 'bg-gray-100 text-gray-800',
    };
    const labels: Record<string, string> = { OPEN: '열림', IN_PROGRESS: '진행중', RESOLVED: '해결됨', CLOSED: '종료' };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100'}`}>{labels[status] || status}</span>;
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      LOW: 'bg-gray-100 text-gray-800',
      MEDIUM: 'bg-blue-100 text-blue-800',
      HIGH: 'bg-orange-100 text-orange-800',
      URGENT: 'bg-red-100 text-red-800',
    };
    const labels: Record<string, string> = { LOW: '낮음', MEDIUM: '보통', HIGH: '높음', URGENT: '긴급' };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[priority] || 'bg-gray-100'}`}>{labels[priority] || priority}</span>;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/admin"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />대시보드로 돌아가기</Button></Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">기술 지원 관리</h1>

      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="text-sm font-medium text-gray-600 mb-2">전체</h3>
            <p className="text-2xl font-bold">{statistics.total}</p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">열림</h3>
            <p className="text-2xl font-bold text-yellow-900">{statistics.open}</p>
          </div>
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-sm font-medium text-blue-800 mb-2">진행중</h3>
            <p className="text-2xl font-bold text-blue-900">{statistics.inProgress}</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-sm font-medium text-green-800 mb-2">평균 해결 시간</h3>
            <p className="text-2xl font-bold text-green-900">{statistics.avgResolutionHours?.toFixed(1) || 0}시간</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex gap-2">
          {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((status) => (
            <button key={status} onClick={() => { setStatusFilter(status); setPage(1); }} className={`px-4 py-2 rounded ${statusFilter === status ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
              {status === 'ALL' ? '전체' : status === 'OPEN' ? '열림' : status === 'IN_PROGRESS' ? '진행중' : status === 'RESOLVED' ? '해결됨' : '종료'}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {['ALL', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((priority) => (
            <button key={priority} onClick={() => { setPriorityFilter(priority); setPage(1); }} className={`px-3 py-2 rounded text-sm ${priorityFilter === priority ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
              {priority === 'ALL' ? '우선순위' : priority === 'LOW' ? '낮음' : priority === 'MEDIUM' ? '보통' : priority === 'HIGH' ? '높음' : '긴급'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">제목</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">요청자</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">우선순위</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">담당자</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">생성일</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">액션</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={7} className="px-6 py-4 text-center text-gray-500">로딩 중...</td></tr>
            ) : tickets.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-4 text-center text-gray-500">티켓이 없습니다.</td></tr>
            ) : tickets.map((ticket) => (
              <tr key={ticket.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 max-w-xs truncate">{ticket.subject}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{ticket.user?.name || '-'}</div>
                  <div className="text-sm text-gray-500">{ticket.user?.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{getPriorityBadge(ticket.priority)}</td>
                <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(ticket.status)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ticket.assignee?.name || '미배정'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(ticket.created_at).toLocaleDateString('ko-KR')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex gap-2">
                    {!ticket.assignee && <button onClick={() => assignTicket(ticket.id)} className="text-blue-600 hover:text-blue-900">배정</button>}
                    <button onClick={() => fetchTicketDetails(ticket.id)} className="text-gray-600 hover:text-gray-900">상세</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-center gap-2">
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 border rounded disabled:opacity-50">이전</button>
        <span className="px-4 py-2">{page} / {totalPages} 페이지</span>
        <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 border rounded disabled:opacity-50">다음</button>
      </div>

      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">{selectedTicket.subject}</h2>
                <button onClick={() => setSelectedTicket(null)}><X className="w-6 h-6" /></button>
              </div>
              <div className="space-y-4">
                <div className="flex gap-2">{getPriorityBadge(selectedTicket.priority)} {getStatusBadge(selectedTicket.status)}</div>
                <div><span className="font-medium">요청자:</span> {selectedTicket.user?.name || '-'} ({selectedTicket.user?.email})</div>
                <div><span className="font-medium">담당자:</span> {selectedTicket.assignee?.name || '미배정'}</div>
                <div><span className="font-medium">생성일:</span> {new Date(selectedTicket.created_at).toLocaleString('ko-KR')}</div>
                {selectedTicket.resolved_at && <div><span className="font-medium">해결일:</span> {new Date(selectedTicket.resolved_at).toLocaleString('ko-KR')}</div>}
                <div className="border-t pt-4"><span className="font-medium">내용:</span><p className="mt-2 text-gray-700 whitespace-pre-wrap">{selectedTicket.description || '내용 없음'}</p></div>
                {selectedTicket.resolution && <div className="border-t pt-4 bg-green-50 p-4 rounded"><span className="font-medium text-green-800">해결 내용:</span><p className="mt-2 text-green-700">{selectedTicket.resolution}</p></div>}
                <div className="flex gap-2 pt-4 border-t">
                  {!selectedTicket.assignee && <Button onClick={() => assignTicket(selectedTicket.id)}>내게 배정</Button>}
                  {selectedTicket.status !== 'RESOLVED' && selectedTicket.status !== 'CLOSED' && (
                    <>
                      <select onChange={(e) => updateStatus(selectedTicket.id, e.target.value)} value={selectedTicket.status} className="border rounded px-3 py-2">
                        <option value="OPEN">열림</option>
                        <option value="IN_PROGRESS">진행중</option>
                        <option value="CLOSED">종료</option>
                      </select>
                      <Button onClick={() => resolveTicket(selectedTicket.id)} className="bg-green-600 hover:bg-green-700">해결</Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
