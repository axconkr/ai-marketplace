import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { UserRole } from '@/src/lib/auth/types';
import { submitVerificationReview } from '@/lib/services/verification/review';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const verificationId = params.id;

    const user = await requireRole(request, [UserRole.VERIFIER, UserRole.ADMIN]);

    const body = await request.json();

    const { approved, score, comments, badges, improvements, strengths, weaknesses, technicalChecklist } = body;

    if (approved === undefined || score === undefined || !comments) {
      return NextResponse.json(
        { error: '리뷰 데이터가 불완전합니다 (approved, score, comments 필수)' },
        { status: 400 }
      );
    }

    if (typeof score !== 'number' || score < 0 || score > 100) {
      return NextResponse.json(
        { error: '점수는 0에서 100 사이의 숫자여야 합니다' },
        { status: 400 }
      );
    }

    let finalComments = comments;
    if (technicalChecklist) {
      finalComments = formatCommentsWithChecklist(comments, technicalChecklist);
    }

    const review = {
      approved,
      score,
      comments: finalComments,
      badges: badges || [],
      improvements: improvements || [],
      strengths: strengths || [],
      weaknesses: weaknesses || [],
    };

    const verification = await submitVerificationReview({
      verificationId,
      verifierId: user.userId,
      review: review as any,
    });

    return NextResponse.json({
      verification,
      message: `검증이 ${approved ? '승인' : '거절'}되었습니다`,
    });
  } catch (error: any) {
    console.error('Error submitting verification review:', error);
    return NextResponse.json(
      { error: error.message || '검증 리뷰 제출에 실패했습니다' },
      { status: 500 }
    );
  }
}

interface ChecklistCategory {
  category: string;
  items: { label: string; checked: boolean }[];
  notes: string;
}

function formatCommentsWithChecklist(
  comments: string,
  checklist: ChecklistCategory[]
): string {
  const checklistSection = checklist
    .map((cat) => {
      const items = cat.items
        .map((item) => `  ${item.checked ? '[✓]' : '[✗]'} ${item.label}`)
        .join('\n');
      const notes = cat.notes ? `  메모: ${cat.notes}` : '';
      return `[${cat.category}]\n${items}${notes ? '\n' + notes : ''}`;
    })
    .join('\n\n');

  return `${comments}\n\n--- 기술 검토 체크리스트 ---\n${checklistSection}`;
}
