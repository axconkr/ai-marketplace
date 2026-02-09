import { Check, Star, Shield, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VerificationLevel } from '@/lib/types/verification';

interface VerificationBadgeProps {
  level: VerificationLevel;
  score?: number | null;
  className?: string;
}

const BADGE_CONFIG = {
  0: {
    text: '검증됨',
    color: 'bg-gray-500',
    icon: Check,
  },
  1: {
    text: '리뷰됨',
    color: 'bg-blue-500',
    icon: Star,
  },
  2: {
    text: '전문가',
    color: 'bg-purple-500',
    icon: Shield,
  },
  3: {
    text: '프리미엄',
    color: 'bg-yellow-600',
    icon: Crown,
  },
} as const;

export function VerificationBadge({
  level,
  score,
  className,
}: VerificationBadgeProps) {
  const badge = BADGE_CONFIG[level];
  const Icon = badge.icon;

  return (
    <div
      className={cn(
        'flex items-center gap-1 px-2 py-1 rounded text-white text-xs font-medium',
        badge.color,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      <span>{badge.text}</span>
      {score !== null && score !== undefined && (
        <span className="ml-0.5">({Math.round(score)}%)</span>
      )}
    </div>
  );
}

export function VerificationBadgeList({
  badges,
  className,
}: {
  badges: string[];
  className?: string;
}) {
  if (!badges || badges.length === 0) return null;

  const badgeConfig: Record<string, { color: string; label: string }> = {
    security: { color: 'bg-red-500', label: '보안' },
    performance: { color: 'bg-green-500', label: '성능' },
    quality: { color: 'bg-blue-500', label: '품질' },
    documentation: { color: 'bg-purple-500', label: '문서화' },
  };

  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {badges.map((badge) => {
        const config = badgeConfig[badge.toLowerCase()] || {
          color: 'bg-gray-500',
          label: badge,
        };
        return (
          <span
            key={badge}
            className={cn(
              'px-2 py-0.5 rounded text-white text-xs font-medium',
              config.color
            )}
          >
            {config.label}
          </span>
        );
      })}
    </div>
  );
}
