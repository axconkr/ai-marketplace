/**
 * File Download API
 * GET /api/files/[fileId]/download
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/verify-token';
import {
  getFileById,
  canAccessFile,
  incrementDownloadCount,
} from '@/lib/services/file';
import { SupabaseStorage } from '@/lib/storage/supabase';
import fs from 'fs/promises';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const { fileId } = params;

    // Get file metadata
    const file = await getFileById(fileId);
    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Check if file is deleted
    if (file.status === 'DELETED') {
      return NextResponse.json(
        { error: 'File has been deleted' },
        { status: 410 }
      );
    }

    // Verify authentication for private files
    const user = await verifyToken(request);
    const userId = user?.userId || null;

    // Check access permissions
    const hasAccess = await canAccessFile(fileId, userId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Unauthorized - Purchase required or insufficient permissions' },
        { status: 403 }
      );
    }

    // Get file from storage
    let fileBuffer: Buffer;

    // For local storage, read file directly
    if (process.env.STORAGE_PROVIDER !== 'supabase') {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      const filePath = path.join(uploadDir, file.path);

      try {
        fileBuffer = await fs.readFile(filePath);
      } catch (error) {
        console.error('File read error:', error);
        return NextResponse.json(
          { error: 'File not found in storage' },
          { status: 404 }
        );
      }
    } else {
      // For Supabase, redirect to signed URL
      try {
        const supabaseStorage = new SupabaseStorage();
        const signedUrl = await supabaseStorage.getSignedUrl(file.path, 3600);
        
        // Increment download count before redirect
        await incrementDownloadCount(fileId);
        
        // Redirect to signed URL
        return NextResponse.redirect(signedUrl, {
          headers: {
            'Cache-Control': 'private, max-age=60',
          },
        });
      } catch (error) {
        console.error('Supabase signed URL error:', error);
        return NextResponse.json(
          { error: 'Failed to generate download URL' },
          { status: 500 }
        );
      }
    }

    // Increment download count
    await incrementDownloadCount(fileId);

    // Set response headers for file download
    const headers = new Headers();
    headers.set('Content-Type', file.mime_type);
    headers.set(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(file.original_name)}"`
    );
    headers.set('Content-Length', file.size.toString());
    headers.set('Cache-Control', 'private, max-age=3600');

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Download error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
