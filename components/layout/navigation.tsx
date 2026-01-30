'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Home,
  Package,
  LayoutDashboard,
  Settings,
  HelpCircle,
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  ShoppingCart
} from 'lucide-react';
import { getUserRoleFromToken } from '@/lib/auth/middleware-helper';
import { UserRole } from '@/src/lib/auth/types';
import { useEffect, useState } from 'react';

// Admin navigation
const adminItems = [
  {
    href: '/dashboard',
    label: '관리자 대시보드',
    icon: LayoutDashboard,
  },
  {
    href: '/admin/users',
    label: '사용자 관리',
    icon: Users,
  },
  {
    href: '/admin/products',
    label: '상품 관리',
    icon: Package,
  },
  {
    href: '/admin/verifications',
    label: '검증 시스템',
    icon: TrendingUp,
  },
  {
    href: '/admin/support',
    label: '기술 지원',
    icon: HelpCircle,
  },
  {
    href: '/admin/issues',
    label: '이슈 관리',
    icon: FileText,
  },
  {
    href: '/admin/settlements',
    label: '정산 관리',
    icon: DollarSign,
  },
  {
    href: '/admin/settings',
    label: '시스템 설정',
    icon: Settings,
  },
];

// Seller navigation
const sellerItems = [
  {
    href: '/dashboard',
    label: '판매자 대시보드',
    icon: LayoutDashboard,
  },
  {
    href: '/dashboard/products',
    label: '내 상품',
    icon: Package,
  },
  {
    href: '/dashboard/products/new',
    label: '상품 등록',
    icon: Package,
  },
  {
    href: '/dashboard/orders',
    label: '주문 관리',
    icon: ShoppingCart,
  },
  {
    href: '/dashboard/analytics',
    label: '판매 분석',
    icon: TrendingUp,
  },
  {
    href: '/profile',
    label: '설정',
    icon: Settings,
  },
];

// Buyer navigation
const buyerItems = [
  {
    href: '/dashboard',
    label: '대시보드',
    icon: LayoutDashboard,
  },
  {
    href: '/products',
    label: '제품 둘러보기',
    icon: Package,
  },
  {
    href: '/cart',
    label: '장바구니',
    icon: ShoppingCart,
  },
  {
    href: '/wishlist',
    label: '위시리스트',
    icon: FileText,
  },
  {
    href: '/profile',
    label: '설정',
    icon: Settings,
  },
];

interface NavigationProps {
  className?: string;
}

export function Navigation({ className }: NavigationProps) {
  const pathname = usePathname();
  const [sidebarItems, setSidebarItems] = useState(buyerItems);

  useEffect(() => {
    const role = getUserRoleFromToken();

    if (role === UserRole.ADMIN) {
      setSidebarItems(adminItems);
    } else if (role === UserRole.SELLER) {
      setSidebarItems(sellerItems);
    } else {
      setSidebarItems(buyerItems);
    }
  }, []);

  return (
    <nav className={cn('flex flex-col gap-2', className)}>
      {sidebarItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
