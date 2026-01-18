'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

interface QuickReplyTemplatesProps {
  onSelectTemplate: (template: string) => void;
}

const templates = [
  {
    id: 'thank-you',
    title: '감사 인사',
    content: '소중한 리뷰 남겨주셔서 진심으로 감사드립니다. 앞으로도 더욱 좋은 제품과 서비스로 보답하겠습니다.',
  },
  {
    id: 'positive-feedback',
    title: '긍정적 리뷰 감사',
    content: '제품을 만족스럽게 사용해 주셔서 정말 감사합니다. 좋은 평가를 남겨주셔서 큰 힘이 됩니다. 더 나은 제품으로 찾아뵙겠습니다!',
  },
  {
    id: 'apology',
    title: '사과 및 개선 약속',
    content: '불편을 끼쳐드려 죄송합니다. 소중한 의견 감사드리며, 지적해 주신 부분은 빠른 시일 내에 개선하도록 하겠습니다. 더 나은 서비스로 보답하겠습니다.',
  },
  {
    id: 'solution-offered',
    title: '해결책 제시',
    content: '불편을 드려 죄송합니다. 문제 해결을 위해 고객센터로 연락 주시면 즉시 도움드리겠습니다. 빠른 해결을 위해 최선을 다하겠습니다.',
  },
  {
    id: 'follow-up',
    title: '후속 조치 안내',
    content: '문제를 해결하기 위해 업데이트를 준비 중입니다. 곧 개선된 버전을 만나보실 수 있을 것입니다. 조금만 기다려 주세요!',
  },
  {
    id: 'verification-thanks',
    title: '검증 제품 리뷰 감사',
    content: '검증된 제품에 대한 신뢰를 보내주셔서 감사합니다. 앞으로도 철저한 검증을 통해 최고 품질의 제품만을 제공하겠습니다.',
  },
];

export function QuickReplyTemplates({ onSelectTemplate }: QuickReplyTemplatesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          빠른 답변 템플릿
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {templates.map((template) => (
            <Button
              key={template.id}
              variant="outline"
              size="sm"
              onClick={() => onSelectTemplate(template.content)}
              className="text-left h-auto py-2 px-3 justify-start"
            >
              <div className="text-xs">
                <div className="font-medium mb-1">{template.title}</div>
                <div className="text-gray-500 line-clamp-2">{template.content}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
