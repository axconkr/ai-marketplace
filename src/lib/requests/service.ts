/**
 * Service layer for Development Request System
 */

import { prisma } from '@/lib/db';
import {
  CreateRequestInput,
  UpdateRequestInput,
  CreateProposalInput,
  UpdateProposalInput,
  ListRequestsQuery,
  RequestWithBuyer,
  RequestWithDetails,
  ProposalWithDetails,
} from './types';
import {
  notifyRequestCreated,
  notifyProposalSubmitted,
  notifyProposalSelected,
  notifyEscrowInitiated,
} from './notifications';

// Request Service
export class RequestService {
  /**
   * Create a new development request
   */
  static async createRequest(buyerId: string, data: CreateRequestInput): Promise<RequestWithBuyer> {
    const request = await prisma.developmentRequest.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        budgetMin: data.budgetMin,
        budgetMax: data.budgetMax,
        timeline: data.timeline,
        requirements: data.requirements,
        attachments: data.attachments || [],
        buyerId,
      },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    // Send notification
    await notifyRequestCreated({
      requestId: request.id,
      buyerId: request.buyerId,
      title: request.title,
      category: request.category,
    });

    return request;
  }

  /**
   * Get request by ID with proposals
   */
  static async getRequestById(requestId: string, userId?: string): Promise<RequestWithDetails> {
    const request = await prisma.developmentRequest.findUnique({
      where: { id: requestId },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        proposals: {
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        selectedProposal: {
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!request) {
      throw new Error('Request not found');
    }

    // Hide proposal details from non-owners unless they're the seller
    if (userId && userId !== request.buyerId) {
      const filteredProposals = request.proposals.filter(
        (p) => p.sellerId === userId || p.status === 'ACCEPTED'
      );
      return {
        ...request,
        proposals: filteredProposals,
      };
    }

    return request;
  }

  /**
   * List requests with filters and pagination
   */
  static async listRequests(query: ListRequestsQuery) {
    const {
      status,
      category,
      budgetMin,
      budgetMax,
      page,
      limit,
      sortBy,
      sortOrder,
    } = query;

    const where: any = {};

    if (status) where.status = status;
    if (category) where.category = category;
    if (budgetMin) where.budgetMin = { gte: budgetMin };
    if (budgetMax) where.budgetMax = { lte: budgetMax };

    const [requests, total] = await Promise.all([
      prisma.developmentRequest.findMany({
        where,
        include: {
          buyer: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              proposals: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.developmentRequest.count({ where }),
    ]);

    return {
      requests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update a request
   */
  static async updateRequest(
    requestId: string,
    buyerId: string,
    data: UpdateRequestInput
  ): Promise<RequestWithBuyer> {
    // Verify ownership
    const request = await prisma.developmentRequest.findUnique({
      where: { id: requestId },
      include: {
        _count: {
          select: {
            proposals: true,
          },
        },
      },
    });

    if (!request) {
      throw new Error('Request not found');
    }

    if (request.buyerId !== buyerId) {
      throw new Error('Unauthorized');
    }

    // Cannot update if proposals exist or request is not OPEN
    if (request._count.proposals > 0 && request.status !== 'OPEN') {
      throw new Error('Cannot update request with existing proposals');
    }

    return await prisma.developmentRequest.update({
      where: { id: requestId },
      data,
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });
  }

  /**
   * Delete/Cancel a request
   */
  static async deleteRequest(requestId: string, buyerId: string) {
    const request = await prisma.developmentRequest.findUnique({
      where: { id: requestId },
      include: {
        _count: {
          select: {
            proposals: true,
          },
        },
      },
    });

    if (!request) {
      throw new Error('Request not found');
    }

    if (request.buyerId !== buyerId) {
      throw new Error('Unauthorized');
    }

    // Cannot delete if proposals exist
    if (request._count.proposals > 0) {
      throw new Error(
        'Cannot delete request with proposals. Cancel it instead.'
      );
    }

    await prisma.developmentRequest.delete({
      where: { id: requestId },
    });

    return { success: true };
  }
}

// Proposal Service
export class ProposalService {
  /**
   * Create a new proposal
   */
  static async createProposal(sellerId: string, data: CreateProposalInput): Promise<ProposalWithDetails> {
    // Verify request exists and is open
    const request = await prisma.developmentRequest.findUnique({
      where: { id: data.requestId },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!request) {
      throw new Error('Request not found');
    }

    if (request.status !== 'OPEN') {
      throw new Error('Request is not open for proposals');
    }

    if (request.buyerId === sellerId) {
      throw new Error('Cannot submit proposal to your own request');
    }

    // Check if seller already submitted a proposal
    const existingProposal = await prisma.proposal.findFirst({
      where: {
        requestId: data.requestId,
        sellerId,
      },
    });

    if (existingProposal) {
      throw new Error('You have already submitted a proposal for this request');
    }

    // Validate price is within budget range
    if (data.price < request.budgetMin || data.price > request.budgetMax) {
      throw new Error('Proposal price must be within the budget range');
    }

    const proposal = await prisma.proposal.create({
      data: {
        requestId: data.requestId,
        sellerId,
        price: data.price,
        timeline: data.timeline,
        description: data.description,
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        request: {
          select: {
            id: true,
            title: true,
            buyerId: true,
          },
        },
      },
    });

    // Send notification
    await notifyProposalSubmitted({
      proposalId: proposal.id,
      requestId: proposal.requestId,
      buyerId: request.buyerId,
      sellerId: proposal.sellerId,
      sellerName: proposal.seller.name || 'A seller',
      requestTitle: request.title,
      price: proposal.price,
    });

    return proposal;
  }

  /**
   * Get proposal by ID
   */
  static async getProposalById(proposalId: string, userId: string) {
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        request: {
          include: {
            buyer: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!proposal) {
      throw new Error('Proposal not found');
    }

    // Only buyer or seller can view
    if (
      userId !== proposal.sellerId &&
      userId !== proposal.request.buyerId
    ) {
      throw new Error('Unauthorized');
    }

    return proposal;
  }

  /**
   * Update a proposal
   */
  static async updateProposal(
    proposalId: string,
    sellerId: string,
    data: UpdateProposalInput
  ) {
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        request: true,
      },
    });

    if (!proposal) {
      throw new Error('Proposal not found');
    }

    if (proposal.sellerId !== sellerId) {
      throw new Error('Unauthorized');
    }

    if (proposal.status !== 'PENDING') {
      throw new Error('Cannot update proposal that is not pending');
    }

    // Validate price is within budget range if updating price
    if (data.price) {
      if (
        data.price < proposal.request.budgetMin ||
        data.price > proposal.request.budgetMax
      ) {
        throw new Error('Proposal price must be within the budget range');
      }
    }

    return await prisma.proposal.update({
      where: { id: proposalId },
      data,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
  }

  /**
   * Delete/Withdraw a proposal
   */
  static async deleteProposal(proposalId: string, sellerId: string) {
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
    });

    if (!proposal) {
      throw new Error('Proposal not found');
    }

    if (proposal.sellerId !== sellerId) {
      throw new Error('Unauthorized');
    }

    if (proposal.status !== 'PENDING') {
      throw new Error('Cannot delete proposal that is not pending');
    }

    await prisma.proposal.delete({
      where: { id: proposalId },
    });

    return { success: true };
  }

  /**
   * Select a winning proposal
   */
  static async selectProposal(
    requestId: string,
    proposalId: string,
    buyerId: string
  ) {
    // Verify request and proposal
    const request = await prisma.developmentRequest.findUnique({
      where: { id: requestId },
      include: {
        proposals: {
          include: {
            seller: true,
          },
        },
      },
    });

    if (!request) {
      throw new Error('Request not found');
    }

    if (request.buyerId !== buyerId) {
      throw new Error('Unauthorized');
    }

    if (request.status !== 'OPEN') {
      throw new Error('Request is not open');
    }

    const selectedProposal = request.proposals.find((p) => p.id === proposalId);
    if (!selectedProposal) {
      throw new Error('Proposal not found');
    }

    // Update request and proposals in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update request
      const updatedRequest = await tx.developmentRequest.update({
        where: { id: requestId },
        data: {
          selectedProposalId: proposalId,
          status: 'IN_PROGRESS',
        },
      });

      // Update selected proposal
      await tx.proposal.update({
        where: { id: proposalId },
        data: {
          status: 'ACCEPTED',
          selectedAt: new Date(),
        },
      });

      // Reject other proposals
      await tx.proposal.updateMany({
        where: {
          requestId,
          id: { not: proposalId },
          status: 'PENDING',
        },
        data: {
          status: 'REJECTED',
        },
      });

      // Create escrow record
      const escrow = await tx.requestEscrow.create({
        data: {
          requestId,
          proposalId,
          buyerId,
          sellerId: selectedProposal.sellerId,
          amount: selectedProposal.price,
          status: 'PENDING',
        },
      });

      return { request: updatedRequest, escrow };
    });

    // Get rejected seller IDs
    const rejectedSellerIds = request.proposals
      .filter((p) => p.id !== proposalId && p.status === 'PENDING')
      .map((p) => p.sellerId);

    // Send notifications
    await notifyProposalSelected({
      proposalId,
      requestId,
      winningSellerId: selectedProposal.sellerId,
      buyerId,
      requestTitle: request.title,
      price: selectedProposal.price,
      rejectedSellerIds,
    });

    return result;
  }
}

// Escrow Service
export class EscrowService {
  /**
   * Get escrow by ID
   */
  static async getEscrowByProposalId(proposalId: string, userId: string) {
    const escrow = await prisma.requestEscrow.findFirst({
      where: { proposalId },
      include: {
        proposal: {
          include: {
            request: true,
            seller: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!escrow) {
      throw new Error('Escrow not found');
    }

    // Only buyer or seller can view
    if (userId !== escrow.buyerId && userId !== escrow.sellerId) {
      throw new Error('Unauthorized');
    }

    return escrow;
  }

  /**
   * Update escrow status with Stripe payment intent
   */
  static async updateEscrowWithPayment(
    escrowId: string,
    stripePaymentIntent: string
  ) {
    const escrow = await prisma.requestEscrow.update({
      where: { id: escrowId },
      data: {
        stripePaymentIntent,
        status: 'HELD',
      },
      include: {
        proposal: {
          include: {
            request: true,
          },
        },
      },
    });

    // Send notifications
    await notifyEscrowInitiated({
      requestId: escrow.requestId,
      buyerId: escrow.buyerId,
      sellerId: escrow.sellerId,
      amount: escrow.amount,
      requestTitle: escrow.proposal.request.title,
    });

    return escrow;
  }

  /**
   * Release escrow funds
   */
  static async releaseEscrow(escrowId: string, buyerId: string) {
    const escrow = await prisma.requestEscrow.findUnique({
      where: { id: escrowId },
      include: {
        proposal: {
          include: {
            request: true,
          },
        },
      },
    });

    if (!escrow) {
      throw new Error('Escrow not found');
    }

    if (escrow.buyerId !== buyerId) {
      throw new Error('Unauthorized');
    }

    if (escrow.status !== 'HELD') {
      throw new Error('Escrow is not in held status');
    }

    // Update escrow and request status
    const result = await prisma.$transaction(async (tx) => {
      const updatedEscrow = await tx.requestEscrow.update({
        where: { id: escrowId },
        data: {
          status: 'RELEASED',
        },
      });

      await tx.developmentRequest.update({
        where: { id: escrow.requestId },
        data: {
          status: 'COMPLETED',
        },
      });

      return updatedEscrow;
    });

    return result;
  }
}
