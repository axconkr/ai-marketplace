'use client';

import { useState, useEffect } from 'react';
import { Settlement, SettlementStatus } from '@prisma/client';

interface SettlementWithSeller extends Settlement {
  seller: {
    id: string;
    email: string;
    name: string | null;
  };
  items: any[];
}

export default function AdminSettlementsPage() {
  const [settlements, setSettlements] = useState<SettlementWithSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<SettlementStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    fetchSettlements();
    fetchSummary();
  }, [filter, page]);

  const fetchSettlements = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      if (filter !== 'ALL') {
        params.append('status', filter);
      }

      const response = await fetch(`/api/settlements?${params}`);
      const data = await response.json();

      setSettlements(data.settlements);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error('Failed to fetch settlements:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await fetch('/api/settlements/summary');
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    }
  };

  const processSettlement = async (settlementId: string, method: string) => {
    if (!confirm('Are you sure you want to process this settlement?')) {
      return;
    }

    try {
      const response = await fetch(`/api/settlements/process/${settlementId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod: method }),
      });

      if (response.ok) {
        alert('Settlement processed successfully');
        fetchSettlements();
        fetchSummary();
      } else {
        alert('Failed to process settlement');
      }
    } catch (error) {
      console.error('Error processing settlement:', error);
      alert('Error processing settlement');
    }
  };

  const markAsPaid = async (settlementId: string) => {
    if (!confirm('Mark this settlement as paid?')) {
      return;
    }

    try {
      const response = await fetch(`/api/settlements/process/${settlementId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_paid' }),
      });

      if (response.ok) {
        alert('Settlement marked as paid');
        fetchSettlements();
        fetchSummary();
      }
    } catch (error) {
      console.error('Error marking settlement as paid:', error);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount / 100);
  };

  const getStatusBadge = (status: SettlementStatus) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      PAID: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Settlement Management</h1>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">
              Pending
            </h3>
            <p className="text-2xl font-bold text-yellow-900">
              ${(summary.pending.amount / 100).toFixed(2)}
            </p>
            <p className="text-sm text-yellow-700 mt-1">
              {summary.pending.count} settlements
            </p>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              Processing
            </h3>
            <p className="text-2xl font-bold text-blue-900">
              ${(summary.processing.amount / 100).toFixed(2)}
            </p>
            <p className="text-sm text-blue-700 mt-1">
              {summary.processing.count} settlements
            </p>
          </div>

          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-sm font-medium text-green-800 mb-2">Paid</h3>
            <p className="text-2xl font-bold text-green-900">
              ${(summary.paid.amount / 100).toFixed(2)}
            </p>
            <p className="text-sm text-green-700 mt-1">
              {summary.paid.count} settlements
            </p>
          </div>

          <div className="bg-red-50 p-6 rounded-lg border border-red-200">
            <h3 className="text-sm font-medium text-red-800 mb-2">Failed</h3>
            <p className="text-2xl font-bold text-red-900">
              ${(summary.failed.amount / 100).toFixed(2)}
            </p>
            <p className="text-sm text-red-700 mt-1">
              {summary.failed.count} settlements
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-4 py-2 rounded ${
            filter === 'ALL'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('PENDING')}
          className={`px-4 py-2 rounded ${
            filter === 'PENDING'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter('PROCESSING')}
          className={`px-4 py-2 rounded ${
            filter === 'PROCESSING'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Processing
        </button>
        <button
          onClick={() => setFilter('PAID')}
          className={`px-4 py-2 rounded ${
            filter === 'PAID'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Paid
        </button>
      </div>

      {/* Settlements Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Period
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Seller
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Sales
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Platform Fee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payout Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : settlements.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  No settlements found
                </td>
              </tr>
            ) : (
              settlements.map((settlement) => (
                <tr key={settlement.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(settlement.period_start).toLocaleDateString()} -{' '}
                    {new Date(settlement.period_end).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">
                        {settlement.seller.name || 'No name'}
                      </div>
                      <div className="text-gray-500">
                        {settlement.seller.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(settlement.total_amount, settlement.currency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(settlement.platform_fee, settlement.currency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(settlement.payout_amount, settlement.currency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(settlement.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {settlement.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            processSettlement(settlement.id, 'bank_transfer')
                          }
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Process
                        </button>
                      </div>
                    )}
                    {settlement.status === 'PROCESSING' && (
                      <button
                        onClick={() => markAsPaid(settlement.id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Mark Paid
                      </button>
                    )}
                    <a
                      href={`/admin/settlements/${settlement.id}`}
                      className="ml-4 text-gray-600 hover:text-gray-900"
                    >
                      View
                    </a>
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
          Previous
        </button>
        <span className="px-4 py-2">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
