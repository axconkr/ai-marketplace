/**
 * Notification service for Development Request System
 */

import { prisma } from '@/lib/db';
import { NotificationType } from '@prisma/client';

interface NotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  data?: Record<string, any>;
}

export async function createNotification(params: NotificationData) {
  return await prisma.notification.create({
    data: {
      user_id: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      link: params.link,
      data: params.data,
    },
  });
}

export async function notifyRequestCreated(params: {
  requestId: string;
  buyerId: string;
  title: string;
  category: string;
}) {
  // Notify relevant sellers (those who work in this category)
  // For MVP, we'll just create a notification for the buyer confirmation
  await createNotification({
    userId: params.buyerId,
    type: 'REQUEST_CREATED',
    title: 'Development Request Created',
    message: `Your request "${params.title}" has been posted successfully. Sellers can now submit proposals.`,
    link: `/requests/${params.requestId}`,
    data: {
      requestId: params.requestId,
      category: params.category,
    },
  });
}

export async function notifyProposalSubmitted(params: {
  proposalId: string;
  requestId: string;
  buyerId: string;
  sellerId: string;
  sellerName: string;
  requestTitle: string;
  price: number;
}) {
  // Notify buyer
  await createNotification({
    userId: params.buyerId,
    type: 'PROPOSAL_SUBMITTED',
    title: 'New Proposal Received',
    message: `${params.sellerName} submitted a proposal for "${params.requestTitle}" at ₩${params.price.toLocaleString('ko-KR')}`,
    link: `/requests/${params.requestId}`,
    data: {
      proposalId: params.proposalId,
      requestId: params.requestId,
      sellerId: params.sellerId,
      price: params.price,
    },
  });

  // Notify seller (confirmation)
  await createNotification({
    userId: params.sellerId,
    type: 'PROPOSAL_SUBMITTED',
    title: 'Proposal Submitted',
    message: `Your proposal for "${params.requestTitle}" has been submitted successfully.`,
    link: `/proposals/${params.proposalId}`,
    data: {
      proposalId: params.proposalId,
      requestId: params.requestId,
    },
  });
}

export async function notifyProposalSelected(params: {
  proposalId: string;
  requestId: string;
  winningSellerId: string;
  buyerId: string;
  requestTitle: string;
  price: number;
  rejectedSellerIds: string[];
}) {
  // Notify winning seller
  await createNotification({
    userId: params.winningSellerId,
    type: 'PROPOSAL_SELECTED',
    title: 'Proposal Accepted!',
    message: `Congratulations! Your proposal for "${params.requestTitle}" has been accepted. The buyer is initiating payment.`,
    link: `/requests/${params.requestId}`,
    data: {
      proposalId: params.proposalId,
      requestId: params.requestId,
      price: params.price,
    },
  });

  // Notify buyer (confirmation)
  await createNotification({
    userId: params.buyerId,
    type: 'PROPOSAL_SELECTED',
    title: 'Proposal Selected',
    message: `You have selected a proposal for "${params.requestTitle}". Please complete the payment to start the project.`,
    link: `/requests/${params.requestId}/payment`,
    data: {
      proposalId: params.proposalId,
      requestId: params.requestId,
      price: params.price,
    },
  });

  // Notify rejected sellers
  for (const sellerId of params.rejectedSellerIds) {
    await createNotification({
      userId: sellerId,
      type: 'PROPOSAL_REJECTED',
      title: 'Proposal Not Selected',
      message: `Thank you for your proposal on "${params.requestTitle}". The buyer has selected another proposal.`,
      link: `/requests/${params.requestId}`,
      data: {
        requestId: params.requestId,
      },
    });
  }
}

export async function notifyEscrowInitiated(params: {
  requestId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  requestTitle: string;
}) {
  // Notify buyer
  await createNotification({
    userId: params.buyerId,
    type: 'ESCROW_INITIATED',
    title: 'Payment Held in Escrow',
    message: `Your payment of ₩${params.amount.toLocaleString('ko-KR')} for "${params.requestTitle}" is now held in escrow.`,
    link: `/requests/${params.requestId}`,
    data: {
      requestId: params.requestId,
      amount: params.amount,
    },
  });

  // Notify seller
  await createNotification({
    userId: params.sellerId,
    type: 'ESCROW_INITIATED',
    title: 'Project Started - Payment Secured',
    message: `Payment of ₩${params.amount.toLocaleString('ko-KR')} for "${params.requestTitle}" is secured in escrow. You can now start working!`,
    link: `/requests/${params.requestId}`,
    data: {
      requestId: params.requestId,
      amount: params.amount,
    },
  });
}

export async function notifyEscrowReleased(params: {
  requestId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  requestTitle: string;
}) {
  // Notify seller
  await createNotification({
    userId: params.sellerId,
    type: 'ESCROW_RELEASED',
    title: 'Payment Released',
    message: `Payment of ₩${params.amount.toLocaleString('ko-KR')} for "${params.requestTitle}" has been released. Funds will be settled according to your payout schedule.`,
    link: `/requests/${params.requestId}`,
    data: {
      requestId: params.requestId,
      amount: params.amount,
    },
  });

  // Notify buyer
  await createNotification({
    userId: params.buyerId,
    type: 'ESCROW_RELEASED',
    title: 'Project Completed',
    message: `Project "${params.requestTitle}" has been completed. Payment has been released to the seller.`,
    link: `/requests/${params.requestId}`,
    data: {
      requestId: params.requestId,
    },
  });
}
