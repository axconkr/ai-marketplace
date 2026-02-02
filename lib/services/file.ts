/**
 * File Service
 * Business logic for file operations
 */

import { PrismaClient, FileStatus, OrderStatus } from '@prisma/client';
import { storage } from '../storage';
import {
  validateFile,
  generateUniqueFilename,
  getFileCategory,
} from '../validations/file';

const prisma = new PrismaClient();

export interface UploadFileInput {
  userId: string;
  productId?: string;
  file: {
    name: string;
    size: number;
    type: string;
  };
  buffer: Buffer;
}

export interface UploadFileResult {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  size: number;
  mimeType: string;
}

/**
 * Upload a single file
 */
export async function uploadFile(
  input: UploadFileInput
): Promise<UploadFileResult> {
  const { userId, productId, file, buffer } = input;

  // Validate file
  const validation = await validateFile(file, buffer);
  if (!validation.isValid) {
    throw new Error(
      `File validation failed: ${validation.errors.join(', ')}`
    );
  }

  // Generate unique filename
  const uniqueFilename = generateUniqueFilename(file.name);

  // Determine storage path (organize by user and product)
  const category = getFileCategory(file.type) || 'OTHER';
  const subPath = productId
    ? `products/${productId}`
    : `users/${userId}/${category.toLowerCase()}`;

  // Upload to storage
  const uploadResult = await storage.upload(buffer, uniqueFilename, subPath);

  // Save metadata to database
  const fileRecord = await prisma.file.create({
    data: {
      user_id: userId,
      product_id: productId,
      filename: uploadResult.filename,
      original_name: file.name,
      mime_type: file.type,
      size: file.size,
      path: uploadResult.path,
      url: uploadResult.url,
      status: FileStatus.ACTIVE,
    },
  });

  return {
    id: fileRecord.id,
    filename: fileRecord.filename,
    originalName: fileRecord.original_name,
    url: fileRecord.url,
    size: fileRecord.size,
    mimeType: fileRecord.mime_type,
  };
}

/**
 * Upload multiple files
 */
export async function uploadFiles(
  userId: string,
  productId: string | undefined,
  files: Array<{ name: string; size: number; type: string; buffer: Buffer }>
): Promise<UploadFileResult[]> {
  const results: UploadFileResult[] = [];
  const errors: Array<{ filename: string; error: string }> = [];

  for (const file of files) {
    try {
      const result = await uploadFile({
        userId,
        productId,
        file: {
          name: file.name,
          size: file.size,
          type: file.type,
        },
        buffer: file.buffer,
      });
      results.push(result);
    } catch (error) {
      errors.push({
        filename: file.name,
        error: error instanceof Error ? error.message : 'Upload failed',
      });
    }
  }

  if (errors.length > 0 && results.length === 0) {
    throw new Error(
      `All uploads failed: ${errors.map((e) => `${e.filename}: ${e.error}`).join('; ')}`
    );
  }

  // Return successful uploads (partial success allowed)
  return results;
}

/**
 * Delete file (soft delete)
 */
export async function deleteFile(
  fileId: string,
  userId: string,
  isAdmin = false
): Promise<void> {
  // Get file record
  const file = await prisma.file.findUnique({
    where: { id: fileId },
  });

  if (!file) {
    throw new Error('File not found');
  }

  // Check authorization
  if (!isAdmin && file.user_id !== userId) {
    throw new Error('Unauthorized to delete this file');
  }

  // Soft delete (mark as deleted)
  await prisma.file.update({
    where: { id: fileId },
    data: {
      status: FileStatus.DELETED,
      deleted_at: new Date(),
    },
  });

  // TODO: Schedule hard delete after 30 days
  // For now, we keep the file in storage for recovery
}

/**
 * Hard delete file (remove from storage)
 */
export async function hardDeleteFile(fileId: string): Promise<void> {
  const file = await prisma.file.findUnique({
    where: { id: fileId },
  });

  if (!file) {
    throw new Error('File not found');
  }

  // Delete from storage
  await storage.delete(file.path);

  // Delete from database
  await prisma.file.delete({
    where: { id: fileId },
  });
}

/**
 * Get file by ID
 */
export async function getFileById(fileId: string) {
  return await prisma.file.findUnique({
    where: { id: fileId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      product: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

/**
 * Get files by product ID
 */
export async function getFilesByProduct(productId: string) {
  return await prisma.file.findMany({
    where: {
      product_id: productId,
      status: FileStatus.ACTIVE,
    },
    orderBy: {
      created_at: 'desc',
    },
  });
}

/**
 * Get files by user ID
 */
export async function getFilesByUser(userId: string) {
  return await prisma.file.findMany({
    where: {
      user_id: userId,
      status: FileStatus.ACTIVE,
    },
    orderBy: {
      created_at: 'desc',
    },
  });
}

/**
 * Increment download count
 */
export async function incrementDownloadCount(fileId: string): Promise<void> {
  await prisma.file.update({
    where: { id: fileId },
    data: {
      download_count: {
        increment: 1,
      },
    },
  });
}

/**
 * Check if user can access file
 */
export async function canAccessFile(
  fileId: string,
  userId: string | null
): Promise<boolean> {
  const file = await prisma.file.findUnique({
    where: { id: fileId },
    include: {
      product: true,
    },
  });

  if (!file) return false;

  // File owner can always access
  if (file.user_id === userId) return true;

  // Public files (no product) are accessible to authenticated users
  if (!file.product_id && userId) return true;

  // Product files require purchase verification
  if (file.product && userId) {
    // Free products (price = 0) are accessible to all authenticated users
    if (file.product.price === 0) {
      return file.product.status === 'active';
    }

    // Seller always has access to their own product files
    if (file.product.seller_id === userId) {
      return true;
    }

    // Check if user has purchased the product with valid status
    const validPurchase = await prisma.order.findFirst({
      where: {
        buyer_id: userId,
        product_id: file.product_id!,
        status: {
          in: [OrderStatus.PAID, OrderStatus.COMPLETED],
        },
      },
    });

    return !!validPurchase;
  }

  return false;
}

/**
 * Clean up deleted files older than specified days
 */
export async function cleanupDeletedFiles(
  olderThanDays = 30
): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

  const deletedFiles = await prisma.file.findMany({
    where: {
      status: FileStatus.DELETED,
      deleted_at: {
        lte: cutoffDate,
      },
    },
  });

  let deletedCount = 0;

  for (const file of deletedFiles) {
    try {
      await hardDeleteFile(file.id);
      deletedCount++;
    } catch (error) {
      console.error(`Failed to hard delete file ${file.id}:`, error);
    }
  }

  return deletedCount;
}
