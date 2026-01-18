/**
 * File Validation Utilities
 * Comprehensive file validation including MIME type, size, and security checks
 */

import { z } from 'zod';

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
  CODE: 100 * 1024 * 1024, // 100MB
  ARCHIVE: 100 * 1024 * 1024, // 100MB
  VIDEO: 50 * 1024 * 1024, // 50MB
} as const;

// Allowed MIME types by category
export const ALLOWED_MIME_TYPES = {
  IMAGES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ],
  DOCUMENTS: [
    'application/pdf',
    'text/markdown',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  CODE: [
    'application/json',
    'text/javascript',
    'application/javascript',
    'text/x-python',
    'application/x-python-code',
    'text/x-typescript',
  ],
  ARCHIVES: [
    'application/zip',
    'application/x-zip-compressed',
    'application/gzip',
    'application/x-gzip',
    'application/x-tar',
    'application/x-compressed-tar',
  ],
  VIDEOS: ['video/mp4', 'video/webm', 'video/quicktime'],
} as const;

// All allowed MIME types
export const ALL_ALLOWED_MIME_TYPES = [
  ...ALLOWED_MIME_TYPES.IMAGES,
  ...ALLOWED_MIME_TYPES.DOCUMENTS,
  ...ALLOWED_MIME_TYPES.CODE,
  ...ALLOWED_MIME_TYPES.ARCHIVES,
  ...ALLOWED_MIME_TYPES.VIDEOS,
];

// Allowed file extensions
export const ALLOWED_EXTENSIONS = [
  // Images
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.svg',
  // Documents
  '.pdf',
  '.md',
  '.txt',
  '.doc',
  '.docx',
  // Code
  '.js',
  '.ts',
  '.jsx',
  '.tsx',
  '.py',
  '.json',
  // Archives
  '.zip',
  '.tar',
  '.gz',
  '.tar.gz',
  // Videos
  '.mp4',
  '.webm',
  '.mov',
];

// Magic bytes for file type detection
const MAGIC_BYTES: Record<string, number[][]> = {
  'image/jpeg': [
    [0xff, 0xd8, 0xff],
  ],
  'image/png': [
    [0x89, 0x50, 0x4e, 0x47],
  ],
  'image/gif': [
    [0x47, 0x49, 0x46, 0x38],
  ],
  'image/webp': [
    [0x52, 0x49, 0x46, 0x46], // RIFF
  ],
  'application/pdf': [
    [0x25, 0x50, 0x44, 0x46], // %PDF
  ],
  'application/zip': [
    [0x50, 0x4b, 0x03, 0x04], // PK
    [0x50, 0x4b, 0x05, 0x06], // PK (empty archive)
    [0x50, 0x4b, 0x07, 0x08], // PK (spanned archive)
  ],
  'application/gzip': [
    [0x1f, 0x8b],
  ],
  'video/mp4': [
    [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70], // ftyp
  ],
};

/**
 * Validate file MIME type using magic bytes
 */
export function validateMimeType(buffer: Buffer, mimeType: string): boolean {
  const signatures = MAGIC_BYTES[mimeType];
  if (!signatures) {
    // For file types without magic bytes, trust the MIME type
    return ALL_ALLOWED_MIME_TYPES.includes(mimeType);
  }

  // Check if buffer matches any of the magic byte signatures
  return signatures.some((signature) => {
    if (buffer.length < signature.length) return false;
    return signature.every((byte, index) => buffer[index] === byte);
  });
}

/**
 * Get file category based on MIME type
 */
export function getFileCategory(
  mimeType: string
): keyof typeof FILE_SIZE_LIMITS | null {
  if (ALLOWED_MIME_TYPES.IMAGES.includes(mimeType)) return 'IMAGE';
  if (ALLOWED_MIME_TYPES.DOCUMENTS.includes(mimeType)) return 'DOCUMENT';
  if (ALLOWED_MIME_TYPES.CODE.includes(mimeType)) return 'CODE';
  if (ALLOWED_MIME_TYPES.ARCHIVES.includes(mimeType)) return 'ARCHIVE';
  if (ALLOWED_MIME_TYPES.VIDEOS.includes(mimeType)) return 'VIDEO';
  return null;
}

/**
 * Validate file size based on category
 */
export function validateFileSize(size: number, mimeType: string): boolean {
  const category = getFileCategory(mimeType);
  if (!category) return false;

  const maxSize = FILE_SIZE_LIMITS[category];
  return size <= maxSize;
}

/**
 * Sanitize filename to prevent security issues
 */
export function sanitizeFilename(filename: string): string {
  // Remove path separators and null bytes
  let sanitized = filename.replace(/[/\\:\0]/g, '_');

  // Remove leading dots (hidden files)
  sanitized = sanitized.replace(/^\.+/, '');

  // Limit length
  const ext = sanitized.substring(sanitized.lastIndexOf('.'));
  const name = sanitized.substring(0, sanitized.lastIndexOf('.'));
  const maxNameLength = 100;

  if (name.length > maxNameLength) {
    sanitized = name.substring(0, maxNameLength) + ext;
  }

  // Replace multiple spaces with single space
  sanitized = sanitized.replace(/\s+/g, ' ');

  return sanitized;
}

/**
 * Generate unique filename
 */
export function generateUniqueFilename(originalFilename: string): string {
  const sanitized = sanitizeFilename(originalFilename);
  const ext = sanitized.substring(sanitized.lastIndexOf('.'));
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);

  return `${timestamp}-${random}${ext}`;
}

/**
 * Validate file extension
 */
export function validateExtension(filename: string): boolean {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return ALLOWED_EXTENSIONS.includes(ext);
}

/**
 * Check for malicious file patterns
 */
export function checkMaliciousPatterns(filename: string, buffer: Buffer): {
  isSafe: boolean;
  reason?: string;
} {
  // Check for double extensions (e.g., file.pdf.exe)
  const parts = filename.split('.');
  if (parts.length > 2) {
    const executableExtensions = ['.exe', '.bat', '.cmd', '.sh', '.app'];
    for (const ext of executableExtensions) {
      if (filename.toLowerCase().endsWith(ext)) {
        return {
          isSafe: false,
          reason: 'Executable file detected',
        };
      }
    }
  }

  // Check for embedded scripts in SVG
  if (filename.toLowerCase().endsWith('.svg')) {
    const content = buffer.toString('utf8', 0, Math.min(buffer.length, 10000));
    if (/<script/i.test(content) || /on\w+\s*=/i.test(content)) {
      return {
        isSafe: false,
        reason: 'SVG contains potentially malicious scripts',
      };
    }
  }

  // Check for ZIP bombs (very high compression ratio)
  if (filename.toLowerCase().endsWith('.zip')) {
    // This is a basic check - in production, use a proper ZIP bomb detector
    if (buffer.length < 1000 && buffer.length > 0) {
      return {
        isSafe: false,
        reason: 'Suspicious compression ratio detected',
      };
    }
  }

  return { isSafe: true };
}

/**
 * Comprehensive file validation
 */
export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  metadata?: {
    category: string;
    maxSize: number;
  };
}

export async function validateFile(
  file: {
    name: string;
    size: number;
    type: string;
  },
  buffer: Buffer
): Promise<FileValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate extension
  if (!validateExtension(file.name)) {
    errors.push(
      `File extension not allowed. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`
    );
  }

  // Validate MIME type
  if (!ALL_ALLOWED_MIME_TYPES.includes(file.type)) {
    errors.push(
      `File type '${file.type}' not allowed. Allowed types: ${ALL_ALLOWED_MIME_TYPES.join(', ')}`
    );
  }

  // Validate magic bytes
  if (!validateMimeType(buffer, file.type)) {
    errors.push(
      'File content does not match declared MIME type (possible spoofing)'
    );
  }

  // Validate file size
  if (!validateFileSize(file.size, file.type)) {
    const category = getFileCategory(file.type);
    const maxSize = category ? FILE_SIZE_LIMITS[category] : 0;
    errors.push(
      `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum allowed ${(maxSize / 1024 / 1024).toFixed(2)}MB for ${category} files`
    );
  }

  // Check for malicious patterns
  const securityCheck = checkMaliciousPatterns(file.name, buffer);
  if (!securityCheck.isSafe) {
    errors.push(`Security issue: ${securityCheck.reason}`);
  }

  // Get metadata
  const category = getFileCategory(file.type);
  const metadata = category
    ? {
        category,
        maxSize: FILE_SIZE_LIMITS[category],
      }
    : undefined;

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metadata,
  };
}

/**
 * Zod schema for file upload validation
 */
export const fileUploadSchema = z.object({
  productId: z.string().optional(),
  files: z
    .array(
      z.object({
        name: z.string().min(1).max(255),
        size: z.number().positive(),
        type: z.string().min(1),
      })
    )
    .min(1)
    .max(10),
});

export type FileUploadInput = z.infer<typeof fileUploadSchema>;
