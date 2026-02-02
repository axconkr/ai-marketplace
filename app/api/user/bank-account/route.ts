import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { initiateBankVerification, getVerificationStatus } from '@/lib/services/bank-verification';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        bank_name: true,
        bank_account: true,
        account_holder: true,
        bank_verified: true,
        stripe_account_id: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const verificationStatus = await getVerificationStatus(userId);

    return NextResponse.json({
      ...user,
      verification: verificationStatus,
    });
  } catch (error) {
    console.error('Error fetching bank account:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bank account' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { bank_name, bank_account, account_holder } = body;

    if (!bank_name || !bank_account || !account_holder) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate account number format (basic validation)
    const accountRegex = /^[\d-]+$/;
    if (!accountRegex.test(bank_account)) {
      return NextResponse.json(
        { error: 'Invalid account number format' },
        { status: 400 }
      );
    }

    // Check if bank account is being changed
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { bank_account: true, bank_verified: true },
    });

    const isChangingAccount =
      currentUser?.bank_account &&
      currentUser.bank_account !== bank_account;

    // Update user's bank account
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        bank_name,
        bank_account,
        account_holder,
        // Reset verification if account changed
        bank_verified: isChangingAccount ? false : currentUser?.bank_verified,
      },
      select: {
        bank_name: true,
        bank_account: true,
        account_holder: true,
        bank_verified: true,
        stripe_account_id: true,
      },
    });

    let verificationInitiated = false;
    if (isChangingAccount || !currentUser?.bank_verified) {
      try {
        await initiateBankVerification(userId, bank_name, bank_account, account_holder);
        verificationInitiated = true;
      } catch (error) {
        console.error('Failed to initiate bank verification:', error);
      }
    }

    const verificationStatus = await getVerificationStatus(userId);

    return NextResponse.json({
      ...user,
      verificationInitiated,
      verification: verificationStatus,
    });
  } catch (error) {
    console.error('Error updating bank account:', error);
    return NextResponse.json(
      { error: 'Failed to update bank account' },
      { status: 500 }
    );
  }
}
