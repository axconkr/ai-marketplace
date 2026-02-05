/**
 * File Upload System Type Definitions
 */

export type FileStatus = 'ACTIVE' | 'DELETED' | 'SCANNING' | 'QUARANTINED';

export type FileCategory = 'IMAGE' | 'DOCUMENT' | 'CODE' | 'ARCHIVE' | 'VIDEO';

export interface FileMetadata {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
  downloadCount: number;
  status: FileStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface FileUploadResponse {
  message: string;
  file: {
    id: string;
    filename: string;
    originalName: string;
    url: string;
    size: number;
    mimeType: string;
  };
}

export interface BatchUploadResponse {
  message: string;
  files: Array<{
    id: string;
    filename: string;
    originalName: string;
    url: string;
    size: number;
    mimeType: string;
  }>;
  totalUploaded: number;
  totalRequested: number;
}

export interface FileValidationError {
  filename: string;
  errors: string[];
  warnings: string[];
}

export interface UploadProgress {
  fileId: string;
  filename: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export interface StorageConfig {
  provider: 'local' | 'supabase';
  maxSize: number;
  allowedTypes: string[];
  uploadDir: string;
}

export interface FileDownloadOptions {
  inline?: boolean;
  expiresIn?: number;
}

export interface FileSizeLimits {
  IMAGE: number;
  DOCUMENT: number;
  CODE: number;
  ARCHIVE: number;
  VIDEO: number;
}

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  metadata?: {
    category: FileCategory;
    maxSize: number;
  };
}

export interface FileServiceOptions {
  userId: string;
  productId?: string;
  validateOnly?: boolean;
}

export interface FileQueryParams {
  productId?: string;
  userId?: string;
  status?: FileStatus;
  limit?: number;
  offset?: number;
}

export interface FileStats {
  totalFiles: number;
  totalSize: number;
  byCategory: Record<FileCategory, { count: number; size: number }>;
  byStatus: Record<FileStatus, number>;
}

export interface FileItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  downloadCount: number;
  createdAt: string;
}
