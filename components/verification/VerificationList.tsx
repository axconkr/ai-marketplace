'use client';

import { useState } from 'react';
import { Filter, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { VerificationListCard } from './VerificationListCard';
import { VerificationDetailModal } from './VerificationDetailModal';
import type { VerificationWithExperts } from '@/lib/types/verification-expert';

interface VerificationListProps {
  verifications: VerificationWithExperts[];
}

type StatusFilter = 'all' | 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'APPROVED' | 'REJECTED';
type LevelFilter = 'all' | '0' | '1' | '2' | '3';
type SortBy = 'newest' | 'oldest' | 'level-high' | 'level-low' | 'fee-high' | 'fee-low';

export function VerificationList({ verifications }: VerificationListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [selectedVerification, setSelectedVerification] =
    useState<VerificationWithExperts | null>(null);

  // Filter and sort
  let filtered = verifications;

  // Search filter
  if (searchQuery) {
    filtered = filtered.filter((v) =>
      v.product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Status filter
  if (statusFilter !== 'all') {
    filtered = filtered.filter((v) => v.status === statusFilter);
  }

  // Level filter
  if (levelFilter !== 'all') {
    filtered = filtered.filter((v) => v.level === parseInt(levelFilter));
  }

  // Sort
  filtered = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return (
          new Date(b.requested_at).getTime() -
          new Date(a.requested_at).getTime()
        );
      case 'oldest':
        return (
          new Date(a.requested_at).getTime() -
          new Date(b.requested_at).getTime()
        );
      case 'level-high':
        return b.level - a.level;
      case 'level-low':
        return a.level - b.level;
      case 'fee-high':
        return b.fee - a.fee;
      case 'fee-low':
        return a.fee - b.fee;
      default:
        return 0;
    }
  });

  return (
    <>
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="상품명 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Status Filter */}
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as StatusFilter)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="상태 필터" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 상태</SelectItem>
              <SelectItem value="PENDING">대기중</SelectItem>
              <SelectItem value="ASSIGNED">배정됨</SelectItem>
              <SelectItem value="IN_PROGRESS">진행중</SelectItem>
              <SelectItem value="COMPLETED">완료</SelectItem>
              <SelectItem value="APPROVED">승인됨</SelectItem>
              <SelectItem value="REJECTED">거절됨</SelectItem>
            </SelectContent>
          </Select>

          {/* Level Filter */}
          <Select
            value={levelFilter}
            onValueChange={(value) => setLevelFilter(value as LevelFilter)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="레벨 필터" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 레벨</SelectItem>
              <SelectItem value="0">Level 0</SelectItem>
              <SelectItem value="1">Level 1</SelectItem>
              <SelectItem value="2">Level 2</SelectItem>
              <SelectItem value="3">Level 3</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as SortBy)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="정렬" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">최신순</SelectItem>
              <SelectItem value="oldest">오래된순</SelectItem>
              <SelectItem value="level-high">레벨 높은순</SelectItem>
              <SelectItem value="level-low">레벨 낮은순</SelectItem>
              <SelectItem value="fee-high">비용 높은순</SelectItem>
              <SelectItem value="fee-low">비용 낮은순</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-600">
          총 {filtered.length}개의 검증 요청
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">검색 결과가 없습니다.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((verification) => (
              <VerificationListCard
                key={verification.id}
                verification={verification}
                onClick={() => setSelectedVerification(verification)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <VerificationDetailModal
        verification={selectedVerification}
        open={!!selectedVerification}
        onClose={() => setSelectedVerification(null)}
      />
    </>
  );
}
