import { Users } from 'lucide-react';

export const metadata = {
  title: 'Careers | AI Marketplace',
  description: 'AI Marketplace 채용 - 함께 성장할 인재를 찾습니다',
};

export default function CareersPage() {
  return (
    <div className="container py-20">
      <div className="max-w-2xl mx-auto text-center">
        <Users className="w-16 h-16 mx-auto text-gray-400 mb-6" />
        <h1 className="text-4xl font-bold mb-4">채용</h1>
        <p className="text-xl text-muted-foreground mb-8">
          AI Marketplace와 함께 성장할 인재를 찾고 있습니다.
        </p>
        <p className="text-muted-foreground">채용 공고가 곧 오픈됩니다!</p>
      </div>
    </div>
  );
}
