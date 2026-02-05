import { FileText } from 'lucide-react';

export const metadata = {
  title: 'Blog | AI Marketplace',
  description: 'AI Marketplace 블로그 - 곧 오픈합니다',
};

export default function BlogPage() {
  return (
    <div className="container py-20">
      <div className="max-w-2xl mx-auto text-center">
        <FileText className="w-16 h-16 mx-auto text-gray-400 mb-6" />
        <h1 className="text-4xl font-bold mb-4">블로그</h1>
        <p className="text-xl text-muted-foreground mb-8">
          AI 자동화와 마켓플레이스에 관한 다양한 콘텐츠를 준비 중입니다.
        </p>
        <p className="text-muted-foreground">곧 만나요!</p>
      </div>
    </div>
  );
}
