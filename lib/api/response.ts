/**
 * API Response Helpers
 * Standardized response formats and error handling
 */

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AuthError } from '../auth';

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

// ============================================================================
// SUCCESS RESPONSES
// ============================================================================

/**
 * Success response (200 OK)
 */
export function successResponse<T>(data: T, status: number = 200): NextResponse {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
  };

  return NextResponse.json(response, { status });
}

/**
 * Success response with pagination
 */
export function paginatedResponse<T>(
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  },
  status: number = 200
): NextResponse {
  const response: ApiSuccessResponse<T[]> = {
    success: true,
    data,
    pagination: {
      ...pagination,
      totalPages: Math.ceil(pagination.total / pagination.limit),
    },
  };

  return NextResponse.json(response, { status });
}

/**
 * Created response (201 Created)
 */
export function createdResponse<T>(data: T): NextResponse {
  return successResponse(data, 201);
}

/**
 * No content response (204 No Content)
 */
export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

// ============================================================================
// ERROR RESPONSES
// ============================================================================

/**
 * Error response builder
 */
export function errorResponse(
  code: string,
  message: string,
  status: number,
  details?: any
): NextResponse {
  const response: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  };

  return NextResponse.json(response, { status });
}

/**
 * Bad request (400)
 */
export function badRequestResponse(message: string, details?: any): NextResponse {
  return errorResponse('BAD_REQUEST', message, 400, details);
}

/**
 * Unauthorized (401)
 */
export function unauthorizedResponse(message: string = 'Authentication required'): NextResponse {
  return errorResponse('UNAUTHORIZED', message, 401);
}

/**
 * Forbidden (403)
 */
export function forbiddenResponse(message: string = 'Access denied'): NextResponse {
  return errorResponse('FORBIDDEN', message, 403);
}

/**
 * Not found (404)
 */
export function notFoundResponse(resource: string = 'Resource'): NextResponse {
  return errorResponse('NOT_FOUND', `${resource} not found`, 404);
}

/**
 * Conflict (409)
 */
export function conflictResponse(message: string): NextResponse {
  return errorResponse('CONFLICT', message, 409);
}

/**
 * Internal server error (500)
 */
export function serverErrorResponse(message: string = 'Internal server error'): NextResponse {
  return errorResponse('SERVER_ERROR', message, 500);
}

// ============================================================================
// ERROR HANDLER
// ============================================================================

/**
 * Handle and format errors
 */
export function handleError(error: unknown): NextResponse {
  console.error('API Error:', error);

  // Zod validation errors
  if (error instanceof ZodError) {
    return badRequestResponse('Validation failed', {
      errors: error.errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
      })),
    });
  }

  // Auth errors
  if (error instanceof AuthError) {
    return errorResponse(error.code, error.message, error.status);
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return conflictResponse(
          `A record with this ${(error.meta?.target as string[])?.join(', ') || 'field'} already exists`
        );
      case 'P2025':
        return notFoundResponse('Record');
      case 'P2003':
        return badRequestResponse('Invalid reference');
      default:
        return serverErrorResponse('Database error');
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return badRequestResponse('Invalid data format');
  }

  // Generic errors
  if (error instanceof Error) {
    return serverErrorResponse(
      process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    );
  }

  return serverErrorResponse();
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Parse and validate request body
 */
export async function parseBody<T>(request: Request, schema: any): Promise<T> {
  try {
    const body = await request.json();
    return schema.parse(body) as T;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON');
    }
    throw error;
  }
}

/**
 * Parse and validate URL search params
 */
export function parseSearchParams<T>(searchParams: URLSearchParams, schema: any): T {
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return schema.parse(params) as T;
}
