/**
 * Auth Layout
 * Layout for authentication pages (login, register)
 */

import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Marketplace
          </h1>
          <p className="text-gray-600">
            AI 워크플로우 & 에이전트 마켓플레이스
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
