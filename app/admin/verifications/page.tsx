'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Verification {
  id: string;
  product_id: string;
  verifier_id: string | null;
  level: number;
  status: string;
  requested_at: string;
  product: { id: string; name: string; seller: { id: string; name: string | null } };
  verifier: { id: string; name: string | null; email: string } | null;
}

interface VerificationDetails extends Verification {
  fee: number;
  platform_share: number;
  verifier_share: number;
  report: any;
  score: number | null;
  badges: string[];
  reviewed_at: string | null;
  completed_at: string | null;
  expertReviews?: Array<{
    id: string;
    expert_type: string;
    status: string;
    expert: { id: string; name: string | null } | null;
  }>;
}

interface Statistics {
  total: number;
  byStatus: Record<string, number>;
  avgCompletionDays: number;
  pendingAssignments: number;
}

interface User {
  id: string;
  name: string | null;
  email: string;
}

export default function AdminVerificationsPage() {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [selectedVerification, setSelectedVerification] = useState<VerificationDetails | null>(null);
  const [verifiers, setVerifiers] = useState<User[]>([]);
  const [experts, setExperts] = useState<User[]>([]);
  const [adminComment, setAdminComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchVerifications();
    fetchStatistics();
  }, [statusFilter, levelFilter, page]);

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' });
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (levelFilter !== 'ALL') params.append('level', levelFilter);
      const response = await fetch(`/api/admin/verifications?${params}`);
      const data = await response.json();
      setVerifications(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/admin/verifications/statistics');
      const data = await response.json();
      setStatistics(data.data);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  const fetchVerificationDetails = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/verifications/${id}`);
      const data = await response.json();
      setSelectedVerification(data.data);
      fetchVerifiers();
    } catch (error) {
      console.error('Failed to fetch verification details:', error);
    }
  };

  const fetchVerifiers = async () => {
    try {
      const response = await fetch('/api/admin/verifications/verifiers');
      const data = await response.json();
      setVerifiers(data.data || []);
    } catch (error) {
      console.error('Failed to fetch verifiers:', error);
    }
  };

  const fetchExperts = async (type: string) => {
    try {
      const response = await fetch(`/api/admin/verifications/experts?type=${type}`);
      const data = await response.json();
      setExperts(data.data || []);
    } catch (error) {
      console.error('Failed to fetch experts:', error);
    }
  };

  const assignVerifier = async (verificationId: string, verifierId: string) => {
    try {
      const response = await fetch(`/api/admin/verifications/${verificationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verifier_id: verifierId }),
      });
      if (response.ok) {
        alert('검증자가 배정되었습니다.');
        fetchVerifications();
        if (selectedVerification?.id === verificationId) fetchVerificationDetails(verificationId);
      } else {
        alert('배정에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const assignExpert = async (expertReviewId: string, expertId: string) => {
    try {
      const response = await fetch(`/api/admin/verifications/experts/${expertReviewId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expert_id: expertId }),
      });
      if (response.ok) {
        alert('전문가가 배정되었습니다.');
        if (selectedVerification) fetchVerificationDetails(selectedVerification.id);
      } else {
        alert('배정에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleAdminAction = async (verificationId: string, action: 'approve' | 'reject') => {
    if (action === 'reject' && !adminComment.trim()) {
      alert('거부 사유를 입력해주세요.');
      return;
    }
    setActionLoading(true);
    try {
      const body: any = { action };
      if (action === 'approve') {
        body.comment = adminComment || undefined;
      } else {
        body.reason = adminComment;
      }
      const response = await fetch(`/api/admin/verifications/${verificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (response.ok) {
        alert(action === 'approve' ? '검증이 승인되었습니다.' : '검증이 거부되었습니다.');
        setSelectedVerification(null);
        setAdminComment('');
        fetchVerifications();
      } else {
        const data = await response.json();
        alert(data.error || '처리에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('처리 중 오류가 발생했습니다.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      ASSIGNED: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-indigo-100 text-indigo-800',
      COMPLETED: 'bg-green-100 text-green-800',
      APPROVED: 'bg-emerald-100 text-emerald-800',
      REJECTED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    };
    const labels: Record<string, string> = {
      PENDING: '대기중', ASSIGNED: '배정됨', IN_PROGRESS: '진행중',
      COMPLETED: '완료됨', APPROVED: '승인됨', REJECTED: '거부됨', CANCELLED: '취소됨',
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100'}`}>{labels[status] || status}</span>;
  };

  const getExpertTypeLabel = (type: string) => {
    const labels: Record<string, string> = { DESIGN: '디자인', PLANNING: '기획', DEVELOPMENT: '개발', DOMAIN: '도메인' };
    return labels[type] || type;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/admin"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />대시보드로 돌아가기</Button></Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">검증 시스템 관리</h1>

      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">대기중</h3>
            <p className="text-2xl font-bold text-yellow-900">{statistics.byStatus?.PENDING || 0}</p>
          </div>
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-sm font-medium text-blue-800 mb-2">진행중</h3>
            <p className="text-2xl font-bold text-blue-900">{(statistics.byStatus?.IN_PROGRESS || 0) + (statistics.byStatus?.ASSIGNED || 0)}</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-sm font-medium text-green-800 mb-2">완료됨</h3>
            <p className="text-2xl font-bold text-green-900">{(statistics.byStatus?.COMPLETED || 0) + (statistics.byStatus?.APPROVED || 0)}</p>
          </div>
          <div className="bg-red-50 p-6 rounded-lg border border-red-200">
            <h3 className="text-sm font-medium text-red-800 mb-2">거부됨</h3>
            <p className="text-2xl font-bold text-red-900">{statistics.byStatus?.REJECTED || 0}</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex gap-2">
          {['ALL', 'PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'].map((status) => (
            <button key={status} onClick={() => { setStatusFilter(status); setPage(1); }} className={`px-4 py-2 rounded ${statusFilter === status ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
              {status === 'ALL' ? '전체' : status === 'PENDING' ? '대기중' : status === 'ASSIGNED' ? '배정됨' : status === 'IN_PROGRESS' ? '진행중' : status === 'COMPLETED' ? '완료됨' : '거부됨'}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {['ALL', '0', '1', '2', '3'].map((level) => (
            <button key={level} onClick={() => { setLevelFilter(level); setPage(1); }} className={`px-3 py-2 rounded text-sm ${levelFilter === level ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
              {level === 'ALL' ? '모든 레벨' : `Level ${level}`}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상품명</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">판매자</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">검증 레벨</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">검증자</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">요청일</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">액션</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={7} className="px-6 py-4 text-center text-gray-500">로딩 중...</td></tr>
            ) : verifications.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-4 text-center text-gray-500">검증 요청이 없습니다.</td></tr>
            ) : verifications.map((v) => (
              <tr key={v.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{v.product?.name || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{v.product?.seller?.name || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Level {v.level}</td>
                <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(v.status)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{v.verifier?.name || '미배정'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(v.requested_at).toLocaleDateString('ko-KR')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex gap-2">
                    {!v.verifier_id && (
                      <select onChange={(e) => e.target.value && assignVerifier(v.id, e.target.value)} className="text-sm border rounded px-2 py-1" defaultValue="">
                        <option value="">검증자 배정</option>
                        {verifiers.map((u) => <option key={u.id} value={u.id}>{u.name || u.email}</option>)}
                      </select>
                    )}
                    <button onClick={() => fetchVerificationDetails(v.id)} className="text-blue-600 hover:text-blue-900">상세</button>
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

      {selectedVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">검증 상세 정보</h2>
                <button onClick={() => { setSelectedVerification(null); setAdminComment(''); }}><X className="w-6 h-6" /></button>
              </div>
              <div className="space-y-4">
                <div><span className="font-medium">상품:</span> {selectedVerification.product?.name}</div>
                <div><span className="font-medium">판매자:</span> {selectedVerification.product?.seller?.name || '-'}</div>
                <div className="flex gap-2"><span className="font-medium">상태:</span> {getStatusBadge(selectedVerification.status)}</div>
                <div><span className="font-medium">레벨:</span> Level {selectedVerification.level}</div>
                <div><span className="font-medium">검증자:</span> {selectedVerification.verifier?.name || '미배정'}</div>

                {['COMPLETED', 'APPROVED', 'REJECTED'].includes(selectedVerification.status) && selectedVerification.report?.manual && (
                  <div className="border-t pt-4">
                    <h3 className="font-medium mb-3">검증자 리뷰 결과</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-4">
                        <div>
                          <span className="font-medium">검증자 점수:</span>{' '}
                          <span className="text-lg font-bold text-blue-600">
                            {selectedVerification.score ?? selectedVerification.report.manual.score ?? '-'}
                          </span>
                          <span className="text-gray-500 text-sm"> / 100</span>
                        </div>
                        <div>
                          <span className="font-medium">검증자 의견:</span>{' '}
                          {selectedVerification.report.manual.approved ? (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">승인 권고</span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">거부 권고</span>
                          )}
                        </div>
                      </div>
                      {selectedVerification.report.manual.comments && (
                        <div>
                          <span className="font-medium">코멘트:</span>
                          <p className="mt-1 text-gray-700 bg-white p-2 rounded border">{selectedVerification.report.manual.comments}</p>
                        </div>
                      )}
                      {selectedVerification.badges && selectedVerification.badges.length > 0 && (
                        <div>
                          <span className="font-medium">뱃지:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedVerification.badges.map((badge: string, idx: number) => (
                              <span key={idx} className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">{badge}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedVerification.report.manual.strengths && selectedVerification.report.manual.strengths.length > 0 && (
                        <div>
                          <span className="font-medium">강점:</span>
                          <ul className="mt-1 list-disc list-inside text-sm text-gray-700">
                            {selectedVerification.report.manual.strengths.map((s: string, idx: number) => (
                              <li key={idx}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {selectedVerification.report.manual.weaknesses && selectedVerification.report.manual.weaknesses.length > 0 && (
                        <div>
                          <span className="font-medium">약점:</span>
                          <ul className="mt-1 list-disc list-inside text-sm text-gray-700">
                            {selectedVerification.report.manual.weaknesses.map((w: string, idx: number) => (
                              <li key={idx}>{w}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {selectedVerification.report.manual.improvements && selectedVerification.report.manual.improvements.length > 0 && (
                        <div>
                          <span className="font-medium">개선 제안:</span>
                          <ul className="mt-1 list-disc list-inside text-sm text-gray-700">
                            {selectedVerification.report.manual.improvements.map((i: string, idx: number) => (
                              <li key={idx}>{i}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedVerification.status === 'COMPLETED' && (
                  <div className="border-t pt-4">
                    <h3 className="font-medium mb-3">관리자 최종 결정</h3>
                    <div className="space-y-3">
                      <textarea
                        value={adminComment}
                        onChange={(e) => setAdminComment(e.target.value)}
                        placeholder="코멘트 또는 거부 사유를 입력하세요"
                        className="w-full border rounded-lg p-3 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleAdminAction(selectedVerification.id, 'approve')}
                          disabled={actionLoading}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                        >
                          {actionLoading ? '처리 중...' : '최종 승인'}
                        </button>
                        <button
                          onClick={() => handleAdminAction(selectedVerification.id, 'reject')}
                          disabled={actionLoading}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
                        >
                          {actionLoading ? '처리 중...' : '거부'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {selectedVerification.expertReviews && selectedVerification.expertReviews.length > 0 && (
                  <div className="border-t pt-4">
                    <h3 className="font-medium mb-3">전문가 리뷰</h3>
                    <div className="space-y-3">
                      {selectedVerification.expertReviews.map((review) => (
                        <div key={review.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <span className="font-medium">{getExpertTypeLabel(review.expert_type)}</span>
                            <span className="ml-2 text-gray-500">{review.expert?.name || '미배정'}</span>
                            <span className="ml-2">{getStatusBadge(review.status)}</span>
                          </div>
                          {!review.expert && (
                            <select
                              onChange={(e) => {
                                if (e.target.value) assignExpert(review.id, e.target.value);
                              }}
                              onClick={() => fetchExperts(review.expert_type)}
                              className="text-sm border rounded px-2 py-1"
                              defaultValue=""
                            >
                              <option value="">전문가 배정</option>
                              {experts.map((u) => <option key={u.id} value={u.id}>{u.name || u.email}</option>)}
                            </select>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
