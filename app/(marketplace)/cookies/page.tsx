import { Cookie } from 'lucide-react';

export const metadata = {
  title: 'Cookie Policy | AI Marketplace',
  description: 'AI Marketplace 쿠키 정책',
};

export default function CookiesPage() {
  return (
    <div className="container py-20">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <Cookie className="w-16 h-16 mx-auto text-gray-400 mb-6" />
          <h1 className="text-4xl font-bold mb-4">쿠키 정책</h1>
          <p className="text-muted-foreground">최종 업데이트: 2026년 2월</p>
        </div>
        
        <div className="prose prose-gray max-w-none">
          <h2 className="text-xl font-semibold mt-8 mb-4">1. 쿠키란?</h2>
          <p className="text-muted-foreground mb-4">
            쿠키는 웹사이트가 사용자의 브라우저에 저장하는 작은 텍스트 파일입니다. 
            이를 통해 사용자 경험을 개선하고 서비스를 제공합니다.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">2. 사용하는 쿠키 종류</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
            <li><strong>필수 쿠키:</strong> 로그인 상태 유지, 보안 기능</li>
            <li><strong>기능 쿠키:</strong> 사용자 설정 저장</li>
            <li><strong>분석 쿠키:</strong> 서비스 개선을 위한 사용 통계</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">3. 쿠키 관리</h2>
          <p className="text-muted-foreground mb-4">
            브라우저 설정에서 쿠키를 관리하거나 삭제할 수 있습니다. 
            단, 필수 쿠키를 차단하면 일부 서비스 이용에 제한이 있을 수 있습니다.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">4. 문의</h2>
          <p className="text-muted-foreground">
            쿠키 정책에 관한 문의사항은{' '}
            <a href="mailto:privacy@aimarket.com" className="text-primary hover:underline">
              privacy@aimarket.com
            </a>
            으로 연락해 주세요.
          </p>
        </div>
      </div>
    </div>
  );
}
