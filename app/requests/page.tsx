import { Metadata } from 'next';
import { RequestList } from '@/components/requests';

export const metadata: Metadata = {
  title: '개발 의뢰 | AI Marketplace',
  description: '전문 개발자들에게 프로젝트를 의뢰하고 최적의 제안을 받으세요',
};

export default function RequestsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">개발 의뢰</h1>
        <p className="text-lg text-gray-600">
          프로젝트를 등록하고 전문 개발자들의 제안을 받아보세요
        </p>
      </div>

      <RequestList />
    </div>
  );
}
