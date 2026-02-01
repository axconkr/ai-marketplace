/**
 * Supabase Storage Provider
 * For production environment
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { StorageProvider, UploadResult } from './interface';

export class SupabaseStorage implements StorageProvider {
  private supabase: SupabaseClient;
  private bucketName: string;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    this.bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'products';

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'Supabase credentials not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async upload(
    file: Buffer,
    filename: string,
    subPath?: string
  ): Promise<UploadResult> {
    const filePath = subPath ? `${subPath}/${filename}` : filename;

    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .upload(filePath, file, {
        contentType: this.detectContentType(filename),
        upsert: false,
      });

    if (error) {
      throw new Error(`Supabase upload failed: ${error.message}`);
    }

    const { data: urlData } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filePath);

    return {
      path: data.path,
      url: urlData.publicUrl,
      filename,
    };
  }

  async delete(path: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(this.bucketName)
      .remove([path]);

    if (error) {
      throw new Error(`Supabase delete failed: ${error.message}`);
    }
  }

  getUrl(path: string): string {
    const { data } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  async exists(path: string): Promise<boolean> {
    const parts = path.split('/');
    const fileName = parts.pop() || '';
    const dirPath = parts.join('/') || '';

    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .list(dirPath, {
        search: fileName,
        limit: 1,
      });

    if (error) {
      return false;
    }

    return data.some((file) => file.name === fileName);
  }

  async getMetadata(path: string): Promise<{
    size: number;
    mimeType: string;
    lastModified: Date;
  } | null> {
    const parts = path.split('/');
    const fileName = parts.pop() || '';
    const dirPath = parts.join('/') || '';

    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .list(dirPath, {
        search: fileName,
        limit: 1,
      });

    if (error || !data || data.length === 0) {
      return null;
    }

    const file = data.find((f) => f.name === fileName);
    if (!file) {
      return null;
    }

    return {
      size: file.metadata?.size || 0,
      mimeType: file.metadata?.mimetype || 'application/octet-stream',
      lastModified: new Date(file.updated_at || file.created_at || Date.now()),
    };
  }

  /**
   * Generate a signed URL for private file download
   * @param path - Full path to the file
   * @param expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
   * @returns Signed URL for temporary access
   */
  async getSignedUrl(path: string, expiresIn: number = 3600): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .createSignedUrl(path, expiresIn);

    if (error) {
      throw new Error(`Failed to create signed URL: ${error.message}`);
    }

    return data.signedUrl;
  }

  /**
   * Detect content type from filename extension
   */
  private detectContentType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      // Documents
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ppt: 'application/vnd.ms-powerpoint',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      txt: 'text/plain',
      // Images
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      svg: 'image/svg+xml',
      // Archives
      zip: 'application/zip',
      rar: 'application/vnd.rar',
      '7z': 'application/x-7z-compressed',
      tar: 'application/x-tar',
      gz: 'application/gzip',
      // Code/Data
      json: 'application/json',
      xml: 'application/xml',
      yaml: 'application/x-yaml',
      yml: 'application/x-yaml',
      csv: 'text/csv',
      // Media
      mp3: 'audio/mpeg',
      mp4: 'video/mp4',
      webm: 'video/webm',
      // n8n specific
      n8n: 'application/json',
    };

    return mimeTypes[ext || ''] || 'application/octet-stream';
  }
}
