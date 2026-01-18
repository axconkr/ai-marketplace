import { Metadata } from 'next';
import { RequestForm } from '@/components/requests';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: '새 개발 의뢰 등록 | AI Marketplace',
  description: '새로운 개발 프로젝트를 등록하고 전문가들의 제안을 받으세요',
};

export default function NewRequestPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/requests">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            목록으로
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">새 개발 의뢰 등록</h1>
        <p className="text-lg text-gray-600">
          프로젝트 요구사항을 상세히 작성하면 전문 개발자들의 제안을 받을 수 있습니다
        </p>
      </div>

      <RequestForm />
    </div>
  );
}
