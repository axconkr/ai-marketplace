/**
 * Storage Provider Interface
 * Abstraction layer for file storage operations
 */

export interface UploadResult {
  path: string;
  url: string;
  filename: string;
}

export interface StorageProvider {
  /**
   * Upload a file to storage
   * @param file - File buffer to upload
   * @param filename - Destination filename
   * @param path - Optional subdirectory path
   * @returns Upload result with path and URL
   */
  upload(
    file: Buffer,
    filename: string,
    path?: string
  ): Promise<UploadResult>;

  /**
   * Delete a file from storage
   * @param path - Full path to the file
   */
  delete(path: string): Promise<void>;

  /**
   * Get public URL for a file
   * @param path - Full path to the file
   * @returns Public URL
   */
  getUrl(path: string): string;

  /**
   * Check if file exists
   * @param path - Full path to the file
   * @returns True if file exists
   */
  exists(path: string): Promise<boolean>;

  /**
   * Get file metadata
   * @param path - Full path to the file
   * @returns File metadata
   */
  getMetadata(path: string): Promise<{
    size: number;
    mimeType: string;
    lastModified: Date;
  } | null>;
}
