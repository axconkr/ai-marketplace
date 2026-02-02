import { NextRequest, NextResponse } from 'next/server';
import { verifyBankAccount, getVerificationStatus } from '@/lib/services/bank-verification';

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: '인증번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    const result = await verifyBankAccount(userId, code.trim());

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '계좌 인증이 완료되었습니다.',
    });
  } catch (error) {
    console.error('Error verifying bank account:', error);
    return NextResponse.json(
      { error: '계좌 인증 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const status = await getVerificationStatus(userId);
    return NextResponse.json(status);
  } catch (error) {
    console.error('Error getting verification status:', error);
    return NextResponse.json(
      { error: 'Failed to get verification status' },
      { status: 500 }
    );
  }
}
