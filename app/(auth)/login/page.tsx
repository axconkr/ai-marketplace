'use client';

/**
 * Login Page
 * 로그인 페이지
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle database connection error specifically
        if (response.status === 503 && data.code === 'DB_CONNECTION_ERROR') {
          throw new Error(
            `데이터베이스에 연결할 수 없습니다.\n\n${data.suggestion}\n\n또는 터미널에서 'npm run db:start'를 실행하세요.`
          );
        }

        // Show detailed error message if available
        const errorMessage = data.suggestion
          ? `${data.error}\n\n💡 ${data.suggestion}`
          : data.error || '로그인에 실패했습니다.';

        throw new Error(errorMessage);
      }

      // Store access token and user info
      if (data.token) {
        localStorage.setItem('accessToken', data.token);
      }
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      if (data.user) {
        localStorage.setItem('userInfo', JSON.stringify(data.user));
      }

      // Trigger custom event for header update (same tab)
      window.dispatchEvent(new Event('authStateChanged'));
      // Also trigger storage event for other tabs
      window.dispatchEvent(new Event('storage'));

      if (data.user?.role === 'verifier') {
        router.push('/verifications');
      } else if (data.user?.role === 'seller' || data.user?.role === 'admin') {
        router.push('/dashboard');
      } else {
        router.push('/products');
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || '로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        로그인
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            이메일
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="이메일을 입력하세요"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            비밀번호
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="••••••••"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="remember"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-600">
              로그인 상태 유지
            </span>
          </label>
          <Link
            href="/forgot-password"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            비밀번호 찾기
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          계정이 없으신가요?{' '}
          <Link
            href="/register"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            회원가입
          </Link>
        </p>
      </div>


    </div>
  );
}
