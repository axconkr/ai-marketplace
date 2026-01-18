/**
 * Storage Provider Factory
 * Automatically selects storage provider based on environment
 */

import { StorageProvider } from './interface';
import { LocalStorage } from './local';
import { SupabaseStorage } from './supabase';

// Export types and interfaces
export type { StorageProvider, UploadResult } from './interface';
export { LocalStorage } from './local';
export { SupabaseStorage } from './supabase';

/**
 * Get storage provider instance based on environment
 */
export function getStorageProvider(): StorageProvider {
  const storageType = process.env.STORAGE_PROVIDER || 'local';

  switch (storageType) {
    case 'supabase':
      return new SupabaseStorage();
    case 'local':
    default:
      return new LocalStorage();
  }
}

// Default storage instance
export const storage = getStorageProvider();
