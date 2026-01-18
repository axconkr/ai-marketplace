'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, MessageSquare, TrendingUp, Clock } from 'lucide-react';

interface ReviewStatsProps {
  stats: {
    averageRating: number;
    totalReviews: number;
    recentReviewsCount: number;
    responseRate: number;
    averageResponseTime: number; // in hours
  };
}

export function ReviewStats({ stats }: ReviewStatsProps) {
  const formatResponseTime = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}분`;
    }
    if (hours < 24) {
      return `${Math.round(hours)}시간`;
    }
    return `${Math.round(hours / 24)}일`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">평균 평점</CardTitle>
          <Star className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
          <p className="text-xs text-gray-500 mt-1">5점 만점</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">전체 리뷰</CardTitle>
          <MessageSquare className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalReviews.toLocaleString()}개</div>
          <p className="text-xs text-gray-500 mt-1">
            최근 30일: {stats.recentReviewsCount}개
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">응답률</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Math.round(stats.responseRate)}%</div>
          <p className="text-xs text-gray-500 mt-1">
            {stats.responseRate >= 80 ? '우수' : stats.responseRate >= 50 ? '보통' : '개선 필요'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">평균 응답 시간</CardTitle>
          <Clock className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatResponseTime(stats.averageResponseTime)}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {stats.averageResponseTime < 24 ? '빠른 응답' : '응답 속도 개선 권장'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">미응답 리뷰</CardTitle>
          <MessageSquare className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Math.round(stats.totalReviews * (1 - stats.responseRate / 100))}개
          </div>
          <p className="text-xs text-gray-500 mt-1">응답 대기 중</p>
        </CardContent>
      </Card>
    </div>
  );
}
