import { BookOpen } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Documentation | AI Marketplace',
  description: 'AI Marketplace 문서 및 가이드',
};

export default function DocsPage() {
  return (
    <div className="container py-20">
      <div className="max-w-2xl mx-auto text-center">
        <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-6" />
        <h1 className="text-4xl font-bold mb-4">문서</h1>
        <p className="text-xl text-muted-foreground mb-8">
          AI Marketplace 이용 가이드 및 API 문서를 준비 중입니다.
        </p>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            현재 이용 가능한 도움말:
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild variant="outline">
              <Link href="/help">고객 지원 센터</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
