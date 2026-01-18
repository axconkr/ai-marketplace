'use client';

import { useState } from 'react';
import { Loader2, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useSubmitReview } from '@/hooks/use-verifications';
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

  const submitMutation = useSubmitReview();

  const handleAddItem = (
    items: string[],
    setter: (items: string[]) => void
  ) => {
    setter([...items, '']);
  };

  const handleRemoveItem = (
    index: number,
    items: string[],
    setter: (items: string[]) => void
  ) => {
    setter(items.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (
    index: number,
    value: string,
    items: string[],
    setter: (items: string[]) => void
  ) => {
    const updated = [...items];
    updated[index] = value;
    setter(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (approved === null) {
      alert('승인 또는 거부를 선택해주세요');
      return;
    }

    const input: SubmitReviewInput = {
      score,
      comments,
      approved,
      badges,
      improvements: improvements.filter((i) => i.trim()),
      strengths: strengths.filter((s) => s.trim()),
      weaknesses: weaknesses.filter((w) => w.trim()),
    };

    try {
      await submitMutation.mutateAsync({
        id: verificationId,
        review: input,
      });
      onSuccess?.();
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Score */}
      <Card>
        <CardHeader>
          <CardTitle>품질 점수</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">점수</span>
            <span className="text-2xl font-bold">{score}%</span>
          </div>
          <Slider
            value={[score]}
            onValueChange={(values) => setScore(values[0])}
            min={0}
            max={100}
            step={5}
          />
          <p className="text-sm text-gray-500">
            상품의 전반적인 품질을 평가해주세요 (0-100)
          </p>
        </CardContent>
      </Card>

      {/* Approval Decision */}
      <Card>
        <CardHeader>
          <CardTitle>결정</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-4">
            <Button
              type="button"
              variant={approved === true ? 'default' : 'outline'}
              onClick={() => setApproved(true)}
              className="flex-1"
            >
              승인
            </Button>
            <Button
              type="button"
              variant={approved === false ? 'destructive' : 'outline'}
              onClick={() => setApproved(false)}
              className="flex-1"
            >
              거부
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle>품질 뱃지</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {AVAILABLE_BADGES.map((badge) => (
            <div key={badge.value} className="flex items-start space-x-3">
              <Checkbox
                id={badge.value}
                checked={badges.includes(badge.value)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setBadges([...badges, badge.value]);
                  } else {
                    setBadges(badges.filter((b) => b !== badge.value));
                  }
                }}
              />
              <div className="flex-1">
                <Label htmlFor={badge.value} className="font-medium">
                  {badge.label}
                </Label>
                <p className="text-sm text-gray-500">{badge.description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Comments */}
      <Card>
        <CardHeader>
          <CardTitle>코멘트</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="상품에 대한 자세한 피드백을 제공해주세요..."
            rows={6}
            required
          />
        </CardContent>
      </Card>

      {/* Strengths */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>강점</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAddItem(strengths, setStrengths)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {strengths.map((strength, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={strength}
                onChange={(e) =>
                  handleUpdateItem(index, e.target.value, strengths, setStrengths)
                }
                placeholder="예: 깔끔한 코드 구조"
              />
              {strengths.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    handleRemoveItem(index, strengths, setStrengths)
                  }
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Weaknesses */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>약점</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAddItem(weaknesses, setWeaknesses)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {weaknesses.map((weakness, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={weakness}
                onChange={(e) =>
                  handleUpdateItem(
                    index,
                    e.target.value,
                    weaknesses,
                    setWeaknesses
                  )
                }
                placeholder="예: 에러 처리 부족"
              />
              {weaknesses.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    handleRemoveItem(index, weaknesses, setWeaknesses)
                  }
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Improvements */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>개선 제안</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAddItem(improvements, setImprovements)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {improvements.map((improvement, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={improvement}
                onChange={(e) =>
                  handleUpdateItem(
                    index,
                    e.target.value,
                    improvements,
                    setImprovements
                  )
                }
                placeholder="예: 입력 유효성 검사 추가"
              />
              {improvements.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    handleRemoveItem(index, improvements, setImprovements)
                  }
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={submitMutation.isPending || approved === null}
          className="flex-1"
        >
          {submitMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              제출 중...
            </>
          ) : (
            '리뷰 제출'
          )}
        </Button>
      </div>
    </form>
  );
}
