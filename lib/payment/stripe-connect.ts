import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
});

export interface CreateConnectedAccountParams {
  email: string;
  country?: string;
  businessType?: 'individual' | 'company';
  businessProfile?: {
    name?: string;
    url?: string;
  };
}

export interface CreateAccountLinkParams {
  accountId: string;
  refreshUrl: string;
  returnUrl: string;
  type?: 'account_onboarding' | 'account_update';
}

export interface CreateTransferParams {
  amount: number;
  currency: string;
  destinationAccountId: string;
  transferGroup?: string;
  sourceTransaction?: string;
  description?: string;
  metadata?: Record<string, string>;
}

export interface CreatePayoutParams {
  amount: number;
  currency: string;
  connectedAccountId: string;
  description?: string;
  metadata?: Record<string, string>;
}

export interface ConnectedAccountBalance {
  available: Array<{
    amount: number;
    currency: string;
  }>;
  pending: Array<{
    amount: number;
    currency: string;
  }>;
}

export async function createConnectedAccount(
  params: CreateConnectedAccountParams
): Promise<Stripe.Account> {
  const account = await stripe.accounts.create({
    type: 'express',
    country: params.country || 'US',
    email: params.email,
    business_type: params.businessType || 'individual',
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_profile: params.businessProfile,
  });

  return account;
}

export async function createAccountLink(
  params: CreateAccountLinkParams
): Promise<Stripe.AccountLink> {
  const accountLink = await stripe.accountLinks.create({
    account: params.accountId,
    refresh_url: params.refreshUrl,
    return_url: params.returnUrl,
    type: params.type || 'account_onboarding',
  });

  return accountLink;
}

export async function getConnectedAccount(
  accountId: string
): Promise<Stripe.Account> {
  return stripe.accounts.retrieve(accountId);
}

export async function isAccountOnboardingComplete(
  accountId: string
): Promise<{ complete: boolean; requirements: string[] }> {
  const account = await stripe.accounts.retrieve(accountId);
  
  const requirements = account.requirements?.currently_due || [];
  const complete = 
    account.charges_enabled && 
    account.payouts_enabled &&
    requirements.length === 0;

  return { complete, requirements };
}

export async function deleteConnectedAccount(
  accountId: string
): Promise<Stripe.DeletedAccount> {
  return stripe.accounts.del(accountId);
}

export async function createTransfer(
  params: CreateTransferParams
): Promise<Stripe.Transfer> {
  return stripe.transfers.create({
    amount: params.amount,
    currency: params.currency.toLowerCase(),
    destination: params.destinationAccountId,
    transfer_group: params.transferGroup,
    source_transaction: params.sourceTransaction,
    description: params.description,
    metadata: params.metadata,
  });
}

export async function reverseTransfer(
  transferId: string,
  amount?: number,
  description?: string
): Promise<Stripe.TransferReversal> {
  return stripe.transfers.createReversal(transferId, {
    amount,
    description,
  });
}

export async function listTransfers(
  destinationAccountId: string,
  options?: {
    limit?: number;
    startingAfter?: string;
    transferGroup?: string;
  }
): Promise<Stripe.ApiList<Stripe.Transfer>> {
  return stripe.transfers.list({
    destination: destinationAccountId,
    limit: options?.limit || 10,
    starting_after: options?.startingAfter,
    transfer_group: options?.transferGroup,
  });
}

export async function createPayout(
  params: CreatePayoutParams
): Promise<Stripe.Payout> {
  return stripe.payouts.create(
    {
      amount: params.amount,
      currency: params.currency.toLowerCase(),
      description: params.description,
      metadata: params.metadata,
    },
    {
      stripeAccount: params.connectedAccountId,
    }
  );
}

export async function getConnectedAccountBalance(
  accountId: string
): Promise<ConnectedAccountBalance> {
  const balance = await stripe.balance.retrieve({
    stripeAccount: accountId,
  });

  return {
    available: balance.available.map((b) => ({
      amount: b.amount,
      currency: b.currency.toUpperCase(),
    })),
    pending: balance.pending.map((b) => ({
      amount: b.amount,
      currency: b.currency.toUpperCase(),
    })),
  };
}

export async function listPayouts(
  accountId: string,
  options?: {
    limit?: number;
    status?: 'pending' | 'paid' | 'failed' | 'canceled';
    startingAfter?: string;
  }
): Promise<Stripe.ApiList<Stripe.Payout>> {
  return stripe.payouts.list(
    {
      limit: options?.limit || 10,
      status: options?.status,
      starting_after: options?.startingAfter,
    },
    {
      stripeAccount: accountId,
    }
  );
}

export async function cancelPayout(
  payoutId: string,
  accountId: string
): Promise<Stripe.Payout> {
  return stripe.payouts.cancel(payoutId, {
    stripeAccount: accountId,
  });
}

export async function setPayoutSchedule(
  accountId: string,
  schedule: {
    interval: 'manual' | 'daily' | 'weekly' | 'monthly';
    weeklyAnchor?: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    monthlyAnchor?: number;
    delayDays?: number | 'minimum';
  }
): Promise<Stripe.Account> {
  return stripe.accounts.update(accountId, {
    settings: {
      payouts: {
        schedule: {
          interval: schedule.interval,
          weekly_anchor: schedule.weeklyAnchor,
          monthly_anchor: schedule.monthlyAnchor,
          delay_days: schedule.delayDays,
        },
      },
    },
  });
}

export async function addExternalBankAccount(
  accountId: string,
  bankAccountToken: string
): Promise<Stripe.BankAccount> {
  return stripe.accounts.createExternalAccount(accountId, {
    external_account: bankAccountToken,
  }) as Promise<Stripe.BankAccount>;
}

export async function listExternalAccounts(
  accountId: string
): Promise<Stripe.ApiList<Stripe.BankAccount | Stripe.Card>> {
  return stripe.accounts.listExternalAccounts(accountId, {
    limit: 10,
  }) as Promise<Stripe.ApiList<Stripe.BankAccount | Stripe.Card>>;
}

export async function deleteExternalAccount(
  accountId: string,
  externalAccountId: string
): Promise<Stripe.DeletedBankAccount | Stripe.DeletedCard> {
  return stripe.accounts.deleteExternalAccount(accountId, externalAccountId);
}

export async function processSellerSettlement(params: {
  sellerStripeAccountId: string;
  amount: number;
  currency: string;
  settlementId: string;
  description?: string;
}): Promise<{ transferId: string }> {
  const { sellerStripeAccountId, amount, currency, settlementId, description } = params;

  if (!sellerStripeAccountId) {
    throw new Error('Seller does not have a connected Stripe account');
  }

  const accountStatus = await isAccountOnboardingComplete(sellerStripeAccountId);
  if (!accountStatus.complete) {
    throw new Error(
      `Seller account not ready for payouts. Missing: ${accountStatus.requirements.join(', ')}`
    );
  }

  const transfer = await createTransfer({
    amount,
    currency,
    destinationAccountId: sellerStripeAccountId,
    transferGroup: `settlement_${settlementId}`,
    description: description || `Settlement payout - ${settlementId}`,
    metadata: {
      settlementId,
      type: 'seller_settlement',
    },
  });

  return { transferId: transfer.id };
}

export async function processVerifierPayout(params: {
  verifierStripeAccountId: string;
  amount: number;
  currency: string;
  verificationId: string;
  settlementId?: string;
}): Promise<{ transferId: string }> {
  const { verifierStripeAccountId, amount, currency, verificationId, settlementId } = params;

  if (!verifierStripeAccountId) {
    throw new Error('Verifier does not have a connected Stripe account');
  }

  const accountStatus = await isAccountOnboardingComplete(verifierStripeAccountId);
  if (!accountStatus.complete) {
    throw new Error(
      `Verifier account not ready for payouts. Missing: ${accountStatus.requirements.join(', ')}`
    );
  }

  const transfer = await createTransfer({
    amount,
    currency,
    destinationAccountId: verifierStripeAccountId,
    transferGroup: settlementId ? `settlement_${settlementId}` : `verification_${verificationId}`,
    description: `Verification payout - ${verificationId}`,
    metadata: {
      verificationId,
      settlementId: settlementId || '',
      type: 'verifier_payout',
    },
  });

  return { transferId: transfer.id };
}
