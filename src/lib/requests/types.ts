/**
 * Types for Development Request System
 */

import { z } from 'zod';
import { Prisma } from '@prisma/client';

// Request Categories
export const REQUEST_CATEGORIES = [
  'n8n',
  'make',
  'ai_agent',
  'app',
  'api',
  'prompt',
] as const;

export type RequestCategory = (typeof REQUEST_CATEGORIES)[number];

// Request Statuses
export const REQUEST_STATUSES = [
  'OPEN',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
] as const;

export type RequestStatus = (typeof REQUEST_STATUSES)[number];

// Proposal Statuses
export const PROPOSAL_STATUSES = ['PENDING', 'ACCEPTED', 'REJECTED'] as const;

export type ProposalStatus = (typeof PROPOSAL_STATUSES)[number];

// Escrow Statuses
export const ESCROW_STATUSES = [
  'PENDING',
  'HELD',
  'RELEASED',
  'REFUNDED',
] as const;

export type EscrowStatus = (typeof ESCROW_STATUSES)[number];

// Validation Schemas
export const createRequestSchema = z.object({
  title: z.string().min(10).max(200),
  description: z.string().min(50).max(5000),
  category: z.enum(REQUEST_CATEGORIES),
  budgetMin: z.number().int().positive().min(10000),
  budgetMax: z.number().int().positive(),
  timeline: z.string().min(3).max(100),
  requirements: z.record(z.any()),
  attachments: z.array(z.string().url()).optional().default([]),
}).refine((data) => data.budgetMax >= data.budgetMin, {
  message: 'budgetMax must be greater than or equal to budgetMin',
  path: ['budgetMax'],
});

export const updateRequestSchema = z.object({
  title: z.string().min(10).max(200).optional(),
  description: z.string().min(50).max(5000).optional(),
  category: z.enum(REQUEST_CATEGORIES).optional(),
  budgetMin: z.number().int().positive().min(10000).optional(),
  budgetMax: z.number().int().positive().optional(),
  timeline: z.string().min(3).max(100).optional(),
  requirements: z.record(z.any()).optional(),
  attachments: z.array(z.string().url()).optional(),
  status: z.enum(REQUEST_STATUSES).optional(),
});

export const createProposalSchema = z.object({
  requestId: z.string().cuid(),
  price: z.number().int().positive().min(10000),
  timeline: z.string().min(3).max(100),
  description: z.string().min(50).max(3000),
});

export const updateProposalSchema = z.object({
  price: z.number().int().positive().min(10000).optional(),
  timeline: z.string().min(3).max(100).optional(),
  description: z.string().min(50).max(3000).optional(),
});

export const selectProposalSchema = z.object({
  proposalId: z.string().cuid(),
});

export const listRequestsQuerySchema = z.object({
  status: z.enum(REQUEST_STATUSES).optional(),
  category: z.enum(REQUEST_CATEGORIES).optional(),
  budgetMin: z.number().int().positive().optional(),
  budgetMax: z.number().int().positive().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'budgetMin', 'budgetMax']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Type exports
export type CreateRequestInput = z.infer<typeof createRequestSchema>;
export type UpdateRequestInput = z.infer<typeof updateRequestSchema>;
export type CreateProposalInput = z.infer<typeof createProposalSchema>;
export type UpdateProposalInput = z.infer<typeof updateProposalSchema>;
export type SelectProposalInput = z.infer<typeof selectProposalSchema>;
export type ListRequestsQuery = z.infer<typeof listRequestsQuerySchema>;

// Prisma return type definitions for service methods
export type RequestWithBuyer = Prisma.DevelopmentRequestGetPayload<{
  include: {
    buyer: {
      select: {
        id: true;
        name: true;
        email: true;
        avatar: true;
      };
    };
  };
}>;

export type RequestWithDetails = Prisma.DevelopmentRequestGetPayload<{
  include: {
    buyer: {
      select: {
        id: true;
        name: true;
        email: true;
        avatar: true;
      };
    };
    proposals: {
      include: {
        seller: {
          select: {
            id: true;
            name: true;
            email: true;
            avatar: true;
          };
        };
      };
    };
    selectedProposal: {
      include: {
        seller: {
          select: {
            id: true;
            name: true;
            avatar: true;
          };
        };
      };
    };
  };
}>;

export type ProposalWithSeller = Prisma.ProposalGetPayload<{
  include: {
    seller: {
      select: {
        id: true;
        name: true;
        email: true;
        avatar: true;
      };
    };
  };
}>;

export type ProposalWithDetails = Prisma.ProposalGetPayload<{
  include: {
    seller: {
      select: {
        id: true;
        name: true;
        email: true;
        avatar: true;
      };
    };
    request: {
      select: {
        id: true;
        title: true;
        buyerId: true;
      };
    };
  };
}>;
