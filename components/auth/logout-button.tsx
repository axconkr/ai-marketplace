'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

interface LogoutButtonProps {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showIcon?: boolean;
  showText?: boolean;
}

export function LogoutButton({
  variant = 'ghost',
  size = 'default',
  className,
  showIcon = true,
  showText = true
}: LogoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      // Clear tokens and user info first (before API call fails)
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userInfo');

      // Try to call logout API, but don't block if it fails
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            refreshToken: refreshToken
          }),
        });
      } catch (logoutError) {
        console.error('Logout API error (non-blocking):', logoutError);
      }

      // Trigger custom event for header update (same tab)
      window.dispatchEvent(new Event('authStateChanged'));
      // Also trigger storage event for other tabs
      window.dispatchEvent(new Event('storage'));

      // Redirect to home
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      disabled={loading}
      className={className}
    >
      {showIcon && <LogOut className="h-4 w-4" />}
      {showText && <span className={showIcon ? 'ml-2' : ''}>{loading ? '로그아웃 중...' : '로그아웃'}</span>}
      {!showText && <span className="sr-only">로그아웃</span>}
    </Button>
  );
}
