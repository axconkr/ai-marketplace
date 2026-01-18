/**
 * Local File System Storage Provider
 * For development environment only
 */

import fs from 'fs/promises';
import path from 'path';
import { StorageProvider, UploadResult } from './interface';

export class LocalStorage implements StorageProvider {
  private uploadDir: string;
  private publicPath: string;

  constructor() {
    // Store files in public/uploads directory
    this.uploadDir = path.join(process.cwd(), 'public', 'uploads');
    this.publicPath = '/uploads';
    this.ensureUploadDir();
  }

  private async ensureUploadDir(): Promise<void> {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create upload directory:', error);
    }
  }

  async upload(
    file: Buffer,
    filename: string,
    subPath?: string
  ): Promise<UploadResult> {
    try {
      // Create subdirectory if specified
      const targetDir = subPath
        ? path.join(this.uploadDir, subPath)
        : this.uploadDir;

      await fs.mkdir(targetDir, { recursive: true });

      // Full path to save file
      const filePath = path.join(targetDir, filename);

      // Write file to disk
      await fs.writeFile(filePath, file);

      // Generate public URL
      const urlPath = subPath
        ? `${this.publicPath}/${subPath}/${filename}`
        : `${this.publicPath}/${filename}`;

      const storagePath = subPath ? `${subPath}/${filename}` : filename;

      return {
        path: storagePath,
        url: urlPath,
        filename,
      };
    } catch (error) {
      console.error('Upload failed:', error);
      throw new Error('Failed to upload file to local storage');
    }
  }

  async delete(filePath: string): Promise<void> {
    try {
      const fullPath = path.join(this.uploadDir, filePath);
      await fs.unlink(fullPath);
    } catch (error) {
      console.error('Delete failed:', error);
      throw new Error('Failed to delete file from local storage');
    }
  }

  getUrl(filePath: string): string {
    return `${this.publicPath}/${filePath}`;
  }

  async exists(filePath: string): Promise<boolean> {
    try {
      const fullPath = path.join(this.uploadDir, filePath);
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  async getMetadata(filePath: string): Promise<{
    size: number;
    mimeType: string;
    lastModified: Date;
  } | null> {
    try {
      const fullPath = path.join(this.uploadDir, filePath);
      const stats = await fs.stat(fullPath);

      // Basic MIME type detection from extension
      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes: Record<string, string> = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.pdf': 'application/pdf',
        '.zip': 'application/zip',
        '.json': 'application/json',
        '.js': 'text/javascript',
        '.ts': 'text/typescript',
        '.py': 'text/x-python',
        '.md': 'text/markdown',
        '.txt': 'text/plain',
      };

      return {
        size: stats.size,
        mimeType: mimeTypes[ext] || 'application/octet-stream',
        lastModified: stats.mtime,
      };
    } catch {
      return null;
    }
  }
}
