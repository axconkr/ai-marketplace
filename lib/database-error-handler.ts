/**
 * Database Error Handler
 * Provides detailed error messages and automatic retry logic for database operations
 */

import { Prisma } from '@prisma/client';

export class DatabaseError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly suggestion: string,
    public readonly isRetryable: boolean = false
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

/**
 * Handle Prisma/Database errors and convert to user-friendly messages
 */
export function handleDatabaseError(error: unknown): DatabaseError {
  // Prisma Client Initialization Error (database connection issues)
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return new DatabaseError(
      'Cannot connect to database',
      'DB_CONNECTION_ERROR',
      'Please ensure the database is running. Run: npm run db:start or docker-compose up -d postgres',
      true
    );
  }

  // Prisma Client Known Request Error (query errors)
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return new DatabaseError(
          'A record with this information already exists',
          'UNIQUE_CONSTRAINT_VIOLATION',
          'Please use different values for unique fields',
          false
        );

      case 'P2003':
        return new DatabaseError(
          'Related record not found',
          'FOREIGN_KEY_CONSTRAINT_VIOLATION',
          'Please ensure all related records exist',
          false
        );

      case 'P2025':
        return new DatabaseError(
          'Record not found',
          'RECORD_NOT_FOUND',
          'The requested record does not exist in the database',
          false
        );

      default:
        return new DatabaseError(
          'Database operation failed',
          error.code,
          'Please try again or contact support',
          true
        );
    }
  }

  // Prisma Client Validation Error
  if (error instanceof Prisma.PrismaClientValidationError) {
    return new DatabaseError(
      'Invalid data provided',
      'VALIDATION_ERROR',
      'Please check your input data',
      false
    );
  }

  // Prisma Client Rust Panic Error (critical)
  if (error instanceof Prisma.PrismaClientRustPanicError) {
    return new DatabaseError(
      'Critical database error occurred',
      'RUST_PANIC',
      'Please restart the application',
      false
    );
  }

  // Unknown error
  return new DatabaseError(
    'An unexpected error occurred',
    'UNKNOWN_ERROR',
    'Please try again or contact support',
    true
  );
}

/**
 * Retry database operation with exponential backoff
 */
export async function retryDatabaseOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const dbError = handleDatabaseError(error);

      // Don't retry if error is not retryable
      if (!dbError.isRetryable) {
        throw dbError;
      }

      // Don't retry on last attempt
      if (attempt === maxRetries - 1) {
        throw dbError;
      }

      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // Should never reach here, but TypeScript needs it
  throw handleDatabaseError(lastError);
}

/**
 * Format database error for API response
 */
export function formatDatabaseErrorResponse(error: DatabaseError) {
  return {
    error: error.message,
    code: error.code,
    suggestion: error.suggestion,
    details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
  };
}
