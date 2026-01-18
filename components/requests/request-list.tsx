'use client';

import { useState, useEffect } from 'react';
import { Loader2, Search, Filter, FileQuestion } from 'lucide-react';
import { RequestCard } from './request-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { RequestWithDetails } from '@/src/lib/requests/types';

/**
 * RequestList Component
 * Displays a list of development requests with filtering
 */

interface RequestListProps {
  initialRequests?: RequestWithDetails[];
  showFilters?: boolean;
}

const REQUEST_CATEGORIES = [
  { value: 'all', label: '전체' },
  { value: 'n8n', label: 'n8n Workflow' },
  { value: 'make', label: 'Make.com' },
  { value: 'ai_agent', label: 'AI Agent' },
  { value: 'app', label: 'Application' },
  { value: 'api', label: 'API' },
  { value: 'prompt', label: 'Prompt' },
];

const REQUEST_STATUSES = [
  { value: 'all', label: '전체' },
  { value: 'OPEN', label: '모집 중' },
  { value: 'IN_PROGRESS', label: '진행 중' },
  { value: 'COMPLETED', label: '완료' },
];

const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: '최신순' },
  { value: 'createdAt:asc', label: '오래된순' },
  { value: 'budgetMax:desc', label: '예산 높은순' },
  { value: 'budgetMax:asc', label: '예산 낮은순' },
];

export function RequestList({
  initialRequests = [],
  showFilters = true,
}: RequestListProps) {
  const [requests, setRequests] = useState<RequestWithDetails[]>(initialRequests);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt:desc');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch requests
  const fetchRequests = async (reset: boolean = false) => {
    try {
      setIsLoading(true);

      const params = new URLSearchParams();
      if (category !== 'all') params.append('category', category);
      if (status !== 'all') params.append('status', status);

      const [sortField, sortOrder] = sortBy.split(':');
      params.append('sortBy', sortField);
      params.append('sortOrder', sortOrder);
      params.append('page', reset ? '1' : page.toString());
      params.append('limit', '12');

      const response = await fetch(`/api/requests?${params.toString()}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch requests');
      }

      const newRequests = result.data.requests || [];

      if (reset) {
        setRequests(newRequests);
        setPage(1);
      } else {
        setRequests((prev) => [...prev, ...newRequests]);
      }

      setHasMore(newRequests.length === 12);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Refetch when filters change
  useEffect(() => {
    if (initialRequests.length === 0) {
      fetchRequests(true);
    }
  }, [category, status, sortBy]);

  // Filter requests by search query (client-side)
  const filteredRequests = searchQuery
    ? requests.filter(
        (request) =>
          request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          request.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : requests;

  const loadMore = () => {
    setPage((prev) => prev + 1);
    fetchRequests(false);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      {showFilters && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="제목 또는 설명으로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="카테고리" />
            </SelectTrigger>
            <SelectContent>
              {REQUEST_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="상태" />
            </SelectTrigger>
            <SelectContent>
              {REQUEST_STATUSES.map((stat) => (
                <SelectItem key={stat.value} value={stat.value}>
                  {stat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="정렬" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Loading State */}
      {isLoading && requests.length === 0 && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredRequests.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="rounded-full bg-muted p-6 mb-6">
            <FileQuestion className="w-16 h-16 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-bold mb-3">개발 의뢰를 찾을 수 없습니다</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            {searchQuery
              ? '검색 조건에 맞는 의뢰가 없습니다. 다른 검색어를 입력해보세요.'
              : '등록된 개발 의뢰가 없습니다. 첫 의뢰를 등록해보세요!'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild>
              <a href="/requests/new">의뢰 등록하기</a>
            </Button>
            {searchQuery && (
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                검색 초기화
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Request Grid */}
      {filteredRequests.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRequests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>

          {/* Load More */}
          {hasMore && !searchQuery && (
            <div className="flex justify-center pt-6">
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    로딩 중...
                  </>
                ) : (
                  '더 보기'
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
