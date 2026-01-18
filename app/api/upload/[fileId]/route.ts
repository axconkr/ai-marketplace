/**
 * File Management API - Delete File
 * DELETE /api/upload/[fileId]
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, hasRole } from '@/lib/auth/verify-token';
import { deleteFile, getFileById } from '@/lib/services/file';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    // Verify authentication
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }

    const { fileId } = params;

    // Check if file exists
    const file = await getFileById(fileId);
    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Check if user is admin
    const isAdmin = hasRole(user, ['admin']);

    // Delete file (soft delete)
    await deleteFile(fileId, user.userId, isAdmin);

    return NextResponse.json(
      {
        message: 'File deleted successfully',
        fileId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete error:', error);

    if (error instanceof Error) {
      if (error.message.includes('Unauthorized')) {
        return NextResponse.json(
          { error: error.message },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get file metadata
 * GET /api/upload/[fileId]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const { fileId } = params;

    const file = await getFileById(fileId);
    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Return file metadata (without sensitive info)
    return NextResponse.json(
      {
        id: file.id,
        filename: file.filename,
        originalName: file.original_name,
        mimeType: file.mime_type,
        size: file.size,
        url: file.url,
        downloadCount: file.download_count,
        createdAt: file.created_at,
        product: file.product
          ? {
              id: file.product.id,
              name: file.product.name,
            }
          : null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get file error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
