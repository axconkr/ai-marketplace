/**
 * Integration tests for Development Request System
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { prisma } from '@/lib/db';
import { RequestService, ProposalService } from '@/src/lib/requests';

describe('Development Request System - Integration Tests', () => {
  let buyerId: string;
  let sellerId: string;
  let requestId: string;
  let proposalId: string;

  beforeAll(async () => {
    // Create test users
    const buyer = await prisma.user.create({
      data: {
        email: 'buyer-test@example.com',
        password: 'hashedpassword',
        name: 'Test Buyer',
        role: 'user',
      },
    });
    buyerId = buyer.id;

    const seller = await prisma.user.create({
      data: {
        email: 'seller-test@example.com',
        password: 'hashedpassword',
        name: 'Test Seller',
        role: 'user',
      },
    });
    sellerId = seller.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.proposal.deleteMany({
      where: { requestId },
    });
    await prisma.developmentRequest.deleteMany({
      where: { id: requestId },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [buyerId, sellerId] } },
    });
    await prisma.$disconnect();
  });

  describe('Request Creation', () => {
    it('should create a new development request', async () => {
      const requestData = {
        title: 'Build a custom n8n workflow',
        description:
          'I need a custom n8n workflow to automate my email marketing campaigns with Mailchimp integration.',
        category: 'n8n' as const,
        budgetMin: 100000,
        budgetMax: 300000,
        timeline: '2 weeks',
        requirements: {
          integrations: ['Mailchimp', 'Google Sheets'],
          automation: true,
          testing: true,
        },
        attachments: [],
      };

      const request = await RequestService.createRequest(buyerId, requestData);

      expect(request).toBeDefined();
      expect(request.id).toBeDefined();
      expect(request.title).toBe(requestData.title);
      expect(request.status).toBe('OPEN');
      expect(request.buyerId).toBe(buyerId);

      requestId = request.id;
    });

    it('should retrieve request by ID', async () => {
      const request = await RequestService.getRequestById(requestId);

      expect(request).toBeDefined();
      expect(request.id).toBe(requestId);
      expect(request.proposals).toEqual([]);
    });

    it('should list requests with filters', async () => {
      const result = await RequestService.listRequests({
        status: 'OPEN',
        category: 'n8n',
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(result.requests).toBeDefined();
      expect(result.requests.length).toBeGreaterThan(0);
      expect(result.pagination.total).toBeGreaterThan(0);
    });
  });

  describe('Proposal Submission', () => {
    it('should create a proposal for a request', async () => {
      const proposalData = {
        requestId,
        price: 200000,
        timeline: '10 days',
        description:
          'I have 5 years of experience building n8n workflows. I can deliver this within 10 days with full testing.',
      };

      const proposal = await ProposalService.createProposal(
        sellerId,
        proposalData
      );

      expect(proposal).toBeDefined();
      expect(proposal.id).toBeDefined();
      expect(proposal.price).toBe(proposalData.price);
      expect(proposal.status).toBe('PENDING');
      expect(proposal.sellerId).toBe(sellerId);

      proposalId = proposal.id;
    });

    it('should not allow duplicate proposals from same seller', async () => {
      const proposalData = {
        requestId,
        price: 250000,
        timeline: '1 week',
        description: 'Another proposal',
      };

      await expect(
        ProposalService.createProposal(sellerId, proposalData)
      ).rejects.toThrow('already submitted a proposal');
    });

    it('should not allow price outside budget range', async () => {
      const anotherSeller = await prisma.user.create({
        data: {
          email: 'seller2-test@example.com',
          password: 'hashedpassword',
          name: 'Test Seller 2',
          role: 'user',
        },
      });

      const proposalData = {
        requestId,
        price: 500000, // Outside budget range (100k-300k)
        timeline: '1 week',
        description: 'Expensive proposal',
      };

      await expect(
        ProposalService.createProposal(anotherSeller.id, proposalData)
      ).rejects.toThrow('within the budget range');

      // Cleanup
      await prisma.user.delete({ where: { id: anotherSeller.id } });
    });

    it('should retrieve proposal by ID', async () => {
      const proposal = await ProposalService.getProposalById(
        proposalId,
        sellerId
      );

      expect(proposal).toBeDefined();
      expect(proposal.id).toBe(proposalId);
    });

    it('should update proposal', async () => {
      const updatedProposal = await ProposalService.updateProposal(
        proposalId,
        sellerId,
        {
          price: 220000,
          timeline: '12 days',
        }
      );

      expect(updatedProposal.price).toBe(220000);
      expect(updatedProposal.timeline).toBe('12 days');
    });
  });

  describe('Proposal Selection', () => {
    it('should select a proposal', async () => {
      const result = await ProposalService.selectProposal(
        requestId,
        proposalId,
        buyerId
      );

      expect(result.request).toBeDefined();
      expect(result.request.selectedProposalId).toBe(proposalId);
      expect(result.request.status).toBe('IN_PROGRESS');
      expect(result.escrow).toBeDefined();
      expect(result.escrow.status).toBe('PENDING');
    });

    it('should verify proposal is marked as accepted', async () => {
      const proposal = await ProposalService.getProposalById(
        proposalId,
        sellerId
      );

      expect(proposal.status).toBe('ACCEPTED');
      expect(proposal.selectedAt).toBeDefined();
    });

    it('should verify escrow is created', async () => {
      const escrows = await prisma.requestEscrow.findMany({
        where: { proposalId },
      });

      expect(escrows.length).toBe(1);
      expect(escrows[0].buyerId).toBe(buyerId);
      expect(escrows[0].sellerId).toBe(sellerId);
      expect(escrows[0].status).toBe('PENDING');
    });
  });

  describe('Request Updates', () => {
    it('should not allow updates after proposals exist', async () => {
      await expect(
        RequestService.updateRequest(requestId, buyerId, {
          title: 'Updated title',
        })
      ).rejects.toThrow('Cannot update request');
    });
  });

  describe('Edge Cases', () => {
    it('should not allow buyer to submit proposal to own request', async () => {
      const newRequest = await RequestService.createRequest(buyerId, {
        title: 'Another request',
        description: 'Testing edge cases for proposal submission validation',
        category: 'api',
        budgetMin: 50000,
        budgetMax: 150000,
        timeline: '1 week',
        requirements: {},
        attachments: [],
      });

      await expect(
        ProposalService.createProposal(buyerId, {
          requestId: newRequest.id,
          price: 100000,
          timeline: '5 days',
          description: 'Self proposal',
        })
      ).rejects.toThrow('Cannot submit proposal to your own request');

      // Cleanup
      await prisma.developmentRequest.delete({ where: { id: newRequest.id } });
    });

    it('should not allow proposals on closed requests', async () => {
      const closedRequest = await prisma.developmentRequest.create({
        data: {
          title: 'Closed request',
          description: 'This request is closed',
          category: 'app',
          budgetMin: 100000,
          budgetMax: 200000,
          timeline: '1 week',
          requirements: {},
          buyerId,
          status: 'COMPLETED',
        },
      });

      await expect(
        ProposalService.createProposal(sellerId, {
          requestId: closedRequest.id,
          price: 150000,
          timeline: '5 days',
          description: 'Proposal for closed request',
        })
      ).rejects.toThrow('not open for proposals');

      // Cleanup
      await prisma.developmentRequest.delete({
        where: { id: closedRequest.id },
      });
    });
  });
});
