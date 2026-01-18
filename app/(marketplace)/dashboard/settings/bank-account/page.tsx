'use client';

import { useState, useEffect } from 'react';

interface BankAccountData {
  bank_name: string;
  bank_account: string;
  account_holder: string;
  bank_verified: boolean;
  stripe_account_id: string | null;
}

export default function BankAccountPage() {
  const [formData, setFormData] = useState<BankAccountData>({
    bank_name: '',
    bank_account: '',
    account_holder: '',
    bank_verified: false,
    stripe_account_id: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchBankAccount();
  }, []);

  const fetchBankAccount = async () => {
    try {
      const response = await fetch('/api/user/bank-account');
      if (response.ok) {
        const data = await response.json();
        setFormData(data);
      }
    } catch (error) {
      console.error('Failed to fetch bank account:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/user/bank-account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bank_name: formData.bank_name,
          bank_account: formData.bank_account,
          account_holder: formData.account_holder,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Bank account updated successfully' });
        fetchBankAccount();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to update bank account' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleStripeConnect = async () => {
    try {
      const response = await fetch('/api/user/stripe-connect', {
        method: 'POST',
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        setMessage({ type: 'error', text: 'Failed to connect Stripe account' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <p className="text-center text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Bank Account Settings</h1>
          <p className="text-gray-600">
            Set up your bank account to receive settlement payments
          </p>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Bank Transfer (Korea) */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Bank Transfer (Korea)</h2>
            {formData.bank_verified && (
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                Verified
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Name
              </label>
              <select
                value={formData.bank_name}
                onChange={(e) =>
                  setFormData({ ...formData, bank_name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Bank</option>
                <option value="KB국민은행">KB국민은행</option>
                <option value="신한은행">신한은행</option>
                <option value="우리은행">우리은행</option>
                <option value="하나은행">하나은행</option>
                <option value="NH농협은행">NH농협은행</option>
                <option value="IBK기업은행">IBK기업은행</option>
                <option value="카카오뱅크">카카오뱅크</option>
                <option value="토스뱅크">토스뱅크</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Number
              </label>
              <input
                type="text"
                value={formData.bank_account}
                onChange={(e) =>
                  setFormData({ ...formData, bank_account: e.target.value })
                }
                placeholder="123-456-789012"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Holder Name
              </label>
              <input
                type="text"
                value={formData.account_holder}
                onChange={(e) =>
                  setFormData({ ...formData, account_holder: e.target.value })
                }
                placeholder="홍길동"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Name must match your bank account exactly
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Bank Account'}
            </button>
          </form>

          {!formData.bank_verified && formData.bank_account && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Verification Required:</strong> Your bank account needs to be
                verified before you can receive payments. We will send a small deposit
                (1원) to verify your account.
              </p>
            </div>
          )}
        </div>

        {/* Stripe Connect (Global) */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Stripe Connect (Global)</h2>
            {formData.stripe_account_id && (
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                Connected
              </span>
            )}
          </div>

          <p className="text-gray-600 mb-4">
            Connect your Stripe account to receive payments in multiple currencies
            worldwide.
          </p>

          {formData.stripe_account_id ? (
            <div className="flex items-center gap-3">
              <svg
                className="w-6 h-6 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="font-medium text-gray-900">Stripe Connected</p>
                <p className="text-sm text-gray-500">
                  Account ID: {formData.stripe_account_id}
                </p>
              </div>
            </div>
          ) : (
            <button
              onClick={handleStripeConnect}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z" />
              </svg>
              Connect with Stripe
            </button>
          )}
        </div>

        {/* Information */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">
            Important Information
          </h3>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• Settlements are processed monthly on the 1st of each month</li>
            <li>• Bank account verification may take 1-2 business days</li>
            <li>• Ensure your account information is accurate to avoid delays</li>
            <li>• You can use either bank transfer or Stripe Connect</li>
            <li>• Contact support if you need to change your verified account</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
