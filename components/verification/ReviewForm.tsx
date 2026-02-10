'use client';

import { useState } from 'react';
import { Loader2, Plus, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { TechnicalChecklist } from './TechnicalChecklist';
import type { ChecklistCategory } from './TechnicalChecklist';
import type { SubmitReviewInput } from '@/lib/types/verification';

interface ReviewFormProps {
  verificationId: string;
  onSuccess?: () => void;
}

const AVAILABLE_BADGES = [
  { value: 'security', label: '보안', description: '보안 취약점이 발견되지 않음' },
  { value: 'performance', label: '성능', description: '성능 기준 충족' },
  { value: 'quality', label: '품질', description: '높은 코드 품질 기준' },
  { value: 'documentation', label: '문서화', description: '잘 문서화됨' },
];

export function ReviewForm({ verificationId, onSuccess }: ReviewFormProps) {
  const [score, setScore] = useState(50);
  const [comments, setComments] = useState('');
  const [approved, setApproved] = useState<boolean | null>(null);
  const [badges, setBadges] = useState<string[]>([]);
  const [improvements, setImprovements] = useState<string[]>(['']);
  const [strengths, setStrengths] = useState<string[]>(['']);
  const [weaknesses, setWeaknesses] = useState<string[]>(['']);
  const [checklist, setChecklist] = useState<ChecklistCategory[] | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleAddItem = (items: string[], setter: (items: string[]) => void) => {
    setter([...items, '']);
  };

  const handleRemoveItem = (index: number, items: string[], setter: (items: string[]) => void) => {
    setter(items.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, value: string, items: string[], setter: (items: string[]) => void) => {
    const updated = [...items];
    updated[index] = value;
    setter(updated);
  };

  const getScoreColor = () => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (approved === null) {
      setSubmitError('승인 권고 또는 거부 권고를 선택해주세요');
      return;
    }

    if (!comments.trim()) {
      setSubmitError('코멘트를 작성해주세요');
      return;
    }

    setSubmitting(true);

    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const body: SubmitReviewInput & { technicalChecklist?: any[] } = {
      score,
      comments,
      approved,
      badges,
      improvements: improvements.filter((i) => i.trim()),
      strengths: strengths.filter((s) => s.trim()),
      weaknesses: weaknesses.filter((w) => w.trim()),
    };

    if (checklist) {
      body.technicalChecklist = checklist.map((cat) => ({
        category: cat.category,
        items: cat.items.map((item) => ({ label: item.label, checked: item.checked })),
        notes: cat.notes,
      }));
    }

    try {
      const res = await fetch(`/api/verifications/${verificationId}/review`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `서버 오류 (${res.status})`);
      }

      onSuccess?.();
    } catch (error) {
      setSubmitError((error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <TechnicalChecklist onChange={setChecklist} />

      <Card>
        <CardHeader>
          <CardTitle>품질 점수</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">종합 점수</span>
            <span className={`text-3xl font-bold ${getScoreColor()}`}>{score}점</span>
          </div>
          <Slider
            value={[score]}
            onValueChange={(values) => setScore(values[0])}
            min={0}
            max={100}
            step={5}
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>0 (매우 낮음)</span>
            <span>50 (보통)</span>
            <span>100 (매우 높음)</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>최종 검증 의견</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setApproved(true)}
              className={`p-4 rounded-lg border-2 text-center transition-all ${
                approved === true
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'
              }`}
            >
              <div className="text-2xl mb-1">✅</div>
              <div className="font-semibold">승인 권고</div>
              <div className="text-xs text-gray-500 mt-1">기준을 충족합니다</div>
            </button>
            <button
              type="button"
              onClick={() => setApproved(false)}
              className={`p-4 rounded-lg border-2 text-center transition-all ${
                approved === false
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 hover:border-red-300 hover:bg-red-50/50'
              }`}
            >
              <div className="text-2xl mb-1">❌</div>
              <div className="font-semibold">거절 권고</div>
              <div className="text-xs text-gray-500 mt-1">기준 미달입니다</div>
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>품질 뱃지</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-500 mb-2">해당하는 품질 뱃지를 선택해주세요</p>
          <div className="grid grid-cols-2 gap-3">
            {AVAILABLE_BADGES.map((badge) => (
              <label
                key={badge.value}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  badges.includes(badge.value) ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Checkbox
                  checked={badges.includes(badge.value)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setBadges([...badges, badge.value]);
                    } else {
                      setBadges(badges.filter((b) => b !== badge.value));
                    }
                  }}
                  className="mt-0.5"
                />
                <div>
                  <Label className="font-medium cursor-pointer">{badge.label}</Label>
                  <p className="text-xs text-gray-500">{badge.description}</p>
                </div>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>상세 코멘트</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="제품에 대한 전반적인 평가와 기술적 의견을 작성해주세요. 소스코드 검토 결과, 발견한 문제점, 개선 사항 등을 구체적으로 기술해주세요."
            rows={6}
            required
          />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">강점</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={() => handleAddItem(strengths, setStrengths)}>
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {strengths.map((strength, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={strength}
                  onChange={(e) => handleUpdateItem(index, e.target.value, strengths, setStrengths)}
                  placeholder="예: 깔끔한 코드 구조"
                  className="text-sm"
                />
                {strengths.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" className="shrink-0" onClick={() => handleRemoveItem(index, strengths, setStrengths)}>
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">약점</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={() => handleAddItem(weaknesses, setWeaknesses)}>
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {weaknesses.map((weakness, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={weakness}
                  onChange={(e) => handleUpdateItem(index, e.target.value, weaknesses, setWeaknesses)}
                  placeholder="예: 에러 처리 부족"
                  className="text-sm"
                />
                {weaknesses.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" className="shrink-0" onClick={() => handleRemoveItem(index, weaknesses, setWeaknesses)}>
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">개선 제안</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={() => handleAddItem(improvements, setImprovements)}>
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {improvements.map((improvement, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={improvement}
                  onChange={(e) => handleUpdateItem(index, e.target.value, improvements, setImprovements)}
                  placeholder="예: 입력 유효성 검사 추가"
                  className="text-sm"
                />
                {improvements.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" className="shrink-0" onClick={() => handleRemoveItem(index, improvements, setImprovements)}>
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {submitError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {submitError}
        </div>
      )}

      <Card className="border-2">
        <CardContent className="pt-6">
          <Button
            type="submit"
            disabled={submitting || approved === null}
            size="lg"
            className="w-full text-lg py-6"
          >
            {submitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                리뷰 제출 중...
              </>
            ) : (
              <>
                <Send className="h-5 w-5 mr-2" />
                검증 리뷰 제출
              </>
            )}
          </Button>
          {approved === null && (
            <p className="text-center text-sm text-gray-500 mt-3">
              승인 또는 거절 의견을 선택해야 제출할 수 있습니다
            </p>
          )}
        </CardContent>
      </Card>
    </form>
  );
}
