import { Store } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Seller Guide | AI Marketplace',
  description: 'AI Marketplace 판매자 가이드',
};

export default function SellerGuidePage() {
  return (
    <div className="container py-20">
      <div className="max-w-2xl mx-auto text-center">
        <Store className="w-16 h-16 mx-auto text-gray-400 mb-6" />
        <h1 className="text-4xl font-bold mb-4">판매자 가이드</h1>
        <p className="text-xl text-muted-foreground mb-8">
          AI Marketplace에서 제품을 판매하는 방법을 안내해 드립니다.
        </p>
        <div className="space-y-4 text-left bg-muted p-6 rounded-lg">
          <h2 className="font-semibold text-lg">판매 시작하기</h2>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>판매자 계정으로 회원가입</li>
            <li>대시보드에서 &quot;새 제품 등록&quot; 클릭</li>
            <li>제품 정보 및 파일 업로드</li>
            <li>검증 요청 후 승인 대기</li>
            <li>판매 시작!</li>
          </ol>
        </div>
        <div className="mt-8 flex justify-center gap-4">
          <Button asChild>
            <Link href="/register">시작하기</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/help">고객 지원</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
