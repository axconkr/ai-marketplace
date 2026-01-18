'use client';

import { Shield, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * Verification Level Badge Component
 * Visual representation of product verification status
 */

interface VerificationBadgeProps {
  level: number;
  showLabel?: boolean;
  className?: string;
}

const VERIFICATION_CONFIG = {
  0: {
    label: '미인증',
    icon: ShieldAlert,
    variant: 'secondary' as const,
    color: 'text-gray-400',
  },
  1: {
    label: '레벨 1',
    icon: Shield,
    variant: 'outline' as const,
    color: 'text-blue-500',
  },
  2: {
    label: '레벨 2',
    icon: ShieldCheck,
    variant: 'default' as const,
    color: 'text-green-500',
  },
  3: {
    label: '레벨 3',
    icon: ShieldCheck,
    variant: 'default' as const,
    color: 'text-purple-500',
  },
};

export function VerificationBadge({
  level,
  showLabel = true,
  className,
}: VerificationBadgeProps) {
  const config = VERIFICATION_CONFIG[level as keyof typeof VERIFICATION_CONFIG] || VERIFICATION_CONFIG[0];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={cn('gap-1', className)}>
      <Icon className={cn('h-3 w-3', config.color)} />
      {showLabel && <span>{config.label}</span>}
    </Badge>
  );
}
