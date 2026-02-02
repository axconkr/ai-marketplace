import { prisma } from '@/lib/db';
import { sendBankVerificationEmail } from './notification';

const MAX_VERIFICATION_ATTEMPTS = 5;
const VERIFICATION_EXPIRY_HOURS = 24;

function generateVerificationCode(): string {
  return Math.random().toString().slice(2, 8);
}

export async function initiateBankVerification(
  userId: string,
  bankName: string,
  bankAccount: string,
  accountHolder: string
): Promise<{ id: string; expiresAt: Date }> {
  const existingPending = await prisma.bankVerification.findFirst({
    where: {
      user_id: userId,
      status: 'PENDING',
      expires_at: { gt: new Date() },
    },
  });

  if (existingPending) {
    await prisma.bankVerification.update({
      where: { id: existingPending.id },
      data: { status: 'EXPIRED' },
    });
  }

  const verificationCode = generateVerificationCode();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + VERIFICATION_EXPIRY_HOURS);

  const verification = await prisma.bankVerification.create({
    data: {
      user_id: userId,
      bank_name: bankName,
      bank_account: bankAccount,
      account_holder: accountHolder,
      verification_code: verificationCode,
      expires_at: expiresAt,
    },
  });

  try {
    await sendBankVerificationEmail(userId, verificationCode);
  } catch (error) {
    console.error('Failed to send bank verification email:', error);
  }

  return {
    id: verification.id,
    expiresAt: verification.expires_at,
  };
}

export async function verifyBankAccount(
  userId: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  const verification = await prisma.bankVerification.findFirst({
    where: {
      user_id: userId,
      status: 'PENDING',
      expires_at: { gt: new Date() },
    },
    orderBy: { created_at: 'desc' },
  });

  if (!verification) {
    return { success: false, error: '유효한 인증 요청이 없습니다.' };
  }

  if (verification.attempts >= MAX_VERIFICATION_ATTEMPTS) {
    await prisma.bankVerification.update({
      where: { id: verification.id },
      data: { status: 'FAILED' },
    });
    return { success: false, error: '인증 시도 횟수를 초과했습니다. 다시 시작해주세요.' };
  }

  if (verification.verification_code !== code) {
    await prisma.bankVerification.update({
      where: { id: verification.id },
      data: { attempts: { increment: 1 } },
    });
    const remainingAttempts = MAX_VERIFICATION_ATTEMPTS - verification.attempts - 1;
    return {
      success: false,
      error: `인증번호가 일치하지 않습니다. (남은 시도: ${remainingAttempts}회)`,
    };
  }

  await prisma.$transaction([
    prisma.bankVerification.update({
      where: { id: verification.id },
      data: {
        status: 'VERIFIED',
        verified_at: new Date(),
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        bank_name: verification.bank_name,
        bank_account: verification.bank_account,
        account_holder: verification.account_holder,
        bank_verified: true,
      },
    }),
  ]);

  return { success: true };
}

export async function getVerificationStatus(
  userId: string
): Promise<{
  hasPending: boolean;
  expiresAt?: Date;
  attempts?: number;
  maxAttempts: number;
}> {
  const verification = await prisma.bankVerification.findFirst({
    where: {
      user_id: userId,
      status: 'PENDING',
      expires_at: { gt: new Date() },
    },
    orderBy: { created_at: 'desc' },
    select: {
      expires_at: true,
      attempts: true,
    },
  });

  return {
    hasPending: !!verification,
    expiresAt: verification?.expires_at,
    attempts: verification?.attempts,
    maxAttempts: MAX_VERIFICATION_ATTEMPTS,
  };
}

export async function cancelPendingVerification(userId: string): Promise<void> {
  await prisma.bankVerification.updateMany({
    where: {
      user_id: userId,
      status: 'PENDING',
    },
    data: { status: 'EXPIRED' },
  });
}
