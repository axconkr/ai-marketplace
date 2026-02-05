/**
 * File Upload API - Multiple Files
 * POST /api/upload/batch
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, hasRole } from '@/lib/auth/verify-token';
import { uploadFiles } from '@/lib/services/file';

const MAX_FILES_PER_REQUEST = 10;

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is a seller or admin
    if (!hasRole(user, ['admin', 'service_provider'])) {
      return NextResponse.json(
        { error: 'Forbidden - Seller role required' },
        { status: 403 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const productId = formData.get('productId') as string | null;

    // Get all files
    const files: Array<{
      name: string;
      size: number;
      type: string;
      buffer: Buffer;
    }> = [];

    for (const [key, value] of formData.entries()) {
      if (key.startsWith('file') && value instanceof File) {
        const arrayBuffer = await value.arrayBuffer();
        files.push({
          name: value.name,
          size: value.size,
          type: value.type,
          buffer: Buffer.from(arrayBuffer),
        });
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    if (files.length > MAX_FILES_PER_REQUEST) {
      return NextResponse.json(
        {
          error: `Too many files. Maximum ${MAX_FILES_PER_REQUEST} files allowed per request`,
        },
        { status: 400 }
      );
    }

    // Upload files
    const results = await uploadFiles(
      user.userId,
      productId || undefined,
      files
    );

    return NextResponse.json(
      {
        message: `Successfully uploaded ${results.length} of ${files.length} files`,
        files: results,
        totalUploaded: results.length,
        totalRequested: files.length,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Batch upload error:', error);

    if (error instanceof Error) {
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
