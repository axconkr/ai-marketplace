'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, ClipboardCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface ChecklistCategory {
  id: string;
  category: string;
  icon: string;
  items: ChecklistItem[];
  notes: string;
}

const DEFAULT_CHECKLIST: ChecklistCategory[] = [
  {
    id: 'code-quality',
    category: '코드 품질',
    icon: '📋',
    items: [
      { id: 'cq-1', label: '코드 구조가 깔끔하고 이해하기 쉬운가', checked: false },
      { id: 'cq-2', label: '변수/함수 네이밍이 일관적이고 의미 있는가', checked: false },
      { id: 'cq-3', label: '중복 코드 없이 모듈화가 되어 있는가', checked: false },
      { id: 'cq-4', label: '에러 처리가 적절하게 되어 있는가', checked: false },
      { id: 'cq-5', label: '코드 스타일이 일관적인가 (포맷팅, 들여쓰기)', checked: false },
    ],
    notes: '',
  },
  {
    id: 'security',
    category: '보안',
    icon: '🔒',
    items: [
      { id: 'sec-1', label: '인증/인가 처리가 적절한가', checked: false },
      { id: 'sec-2', label: '입력 유효성 검사가 있는가', checked: false },
      { id: 'sec-3', label: '민감 정보(API 키, 비밀번호)가 하드코딩되지 않았는가', checked: false },
      { id: 'sec-4', label: '보안 취약점(인젝션, XSS 등)이 없는가', checked: false },
      { id: 'sec-5', label: '의존성 패키지에 알려진 취약점이 없는가', checked: false },
    ],
    notes: '',
  },
  {
    id: 'functionality',
    category: '기능성',
    icon: '⚡',
    items: [
      { id: 'func-1', label: '설명된 기능이 정상적으로 작동하는가', checked: false },
      { id: 'func-2', label: '엣지 케이스가 적절히 처리되는가', checked: false },
      { id: 'func-3', label: '설정/환경변수가 명확히 정의되어 있는가', checked: false },
      { id: 'func-4', label: 'API 호출/연동이 올바르게 구현되어 있는가', checked: false },
    ],
    notes: '',
  },
  {
    id: 'documentation',
    category: '문서화',
    icon: '📚',
    items: [
      { id: 'doc-1', label: 'README 또는 사용 가이드가 있는가', checked: false },
      { id: 'doc-2', label: '설치/설정 방법이 명확하게 기술되어 있는가', checked: false },
      { id: 'doc-3', label: '주요 기능과 사용법이 설명되어 있는가', checked: false },
      { id: 'doc-4', label: '코드 내 필요한 주석이 적절히 있는가', checked: false },
    ],
    notes: '',
  },
  {
    id: 'performance',
    category: '성능',
    icon: '🚀',
    items: [
      { id: 'perf-1', label: '불필요한 API 호출이나 네트워크 요청이 없는가', checked: false },
      { id: 'perf-2', label: '리소스 사용이 효율적인가 (메모리, CPU)', checked: false },
      { id: 'perf-3', label: '대용량 데이터 처리 시 성능 문제가 없는가', checked: false },
    ],
    notes: '',
  },
];

interface TechnicalChecklistProps {
  onChange?: (categories: ChecklistCategory[]) => void;
  readOnly?: boolean;
  initialData?: ChecklistCategory[];
}

export function TechnicalChecklist({ onChange, readOnly = false, initialData }: TechnicalChecklistProps) {
  const [categories, setCategories] = useState<ChecklistCategory[]>(
    initialData || DEFAULT_CHECKLIST.map((cat) => ({
      ...cat,
      items: cat.items.map((item) => ({ ...item })),
    }))
  );
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(categories.map((c) => c.id))
  );

  const toggleExpand = (catId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  const toggleItem = (catId: string, itemId: string) => {
    if (readOnly) return;
    const updated = categories.map((cat) => {
      if (cat.id !== catId) return cat;
      return {
        ...cat,
        items: cat.items.map((item) =>
          item.id === itemId ? { ...item, checked: !item.checked } : item
        ),
      };
    });
    setCategories(updated);
    onChange?.(updated);
  };

  const updateNotes = (catId: string, notes: string) => {
    if (readOnly) return;
    const updated = categories.map((cat) =>
      cat.id === catId ? { ...cat, notes } : cat
    );
    setCategories(updated);
    onChange?.(updated);
  };

  const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);
  const checkedItems = categories.reduce(
    (sum, cat) => sum + cat.items.filter((i) => i.checked).length,
    0
  );
  const progress = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            기술 검토 체크리스트
          </CardTitle>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {checkedItems}/{totalItems} 완료
            </span>
            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  progress === 100 ? 'bg-green-500' : progress > 50 ? 'bg-blue-500' : 'bg-gray-400'
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {categories.map((cat) => {
          const isExpanded = expandedCategories.has(cat.id);
          const catChecked = cat.items.filter((i) => i.checked).length;
          const catTotal = cat.items.length;

          return (
            <div key={cat.id} className="border rounded-lg">
              <button
                onClick={() => toggleExpand(cat.id)}
                className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-base">{cat.icon}</span>
                  <span className="font-medium text-sm">{cat.category}</span>
                </div>
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded-full',
                  catChecked === catTotal ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                )}>
                  {catChecked}/{catTotal}
                </span>
              </button>

              {isExpanded && (
                <div className="px-4 pb-3 space-y-2 border-t bg-gray-50/50">
                  <div className="pt-2 space-y-1.5">
                    {cat.items.map((item) => (
                      <label
                        key={item.id}
                        className={cn(
                          'flex items-start gap-3 px-2 py-1.5 rounded-md cursor-pointer transition-colors',
                          readOnly ? 'cursor-default' : 'hover:bg-white',
                          item.checked && 'text-green-700'
                        )}
                      >
                        <Checkbox
                          checked={item.checked}
                          onCheckedChange={() => toggleItem(cat.id, item.id)}
                          disabled={readOnly}
                          className="mt-0.5"
                        />
                        <span className={cn(
                          'text-sm leading-snug',
                          item.checked && 'line-through opacity-70'
                        )}>
                          {item.label}
                        </span>
                      </label>
                    ))}
                  </div>
                  {!readOnly && (
                    <Textarea
                      value={cat.notes}
                      onChange={(e) => updateNotes(cat.id, e.target.value)}
                      placeholder={`${cat.category} 관련 메모...`}
                      className="text-sm min-h-[60px] bg-white"
                      rows={2}
                    />
                  )}
                  {readOnly && cat.notes && (
                    <div className="text-sm text-gray-600 bg-white p-2 rounded border">
                      {cat.notes}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
