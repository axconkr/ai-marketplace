import { Mail, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Contact | AI Marketplace',
  description: 'AI Marketplace 문의하기',
};

export default function ContactPage() {
  return (
    <div className="container py-20">
      <div className="max-w-2xl mx-auto text-center">
        <MessageSquare className="w-16 h-16 mx-auto text-gray-400 mb-6" />
        <h1 className="text-4xl font-bold mb-4">문의하기</h1>
        <p className="text-xl text-muted-foreground mb-8">
          궁금한 점이 있으시면 언제든 연락해 주세요.
        </p>
        <div className="space-y-6">
          <div className="bg-muted p-6 rounded-lg">
            <Mail className="w-8 h-8 mx-auto mb-3 text-primary" />
            <h2 className="font-semibold mb-2">이메일 문의</h2>
            <a 
              href="mailto:support@aimarket.com" 
              className="text-primary hover:underline"
            >
              support@aimarket.com
            </a>
          </div>
          <p className="text-sm text-muted-foreground">
            영업일 기준 24시간 이내 답변 드리겠습니다.
          </p>
          <Button asChild variant="outline">
            <Link href="/help">자주 묻는 질문 보기</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
