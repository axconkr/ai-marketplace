/**
 * File Upload API - Single File
 * POST /api/upload
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, hasRole } from '@/lib/auth/verify-token';
import { uploadFile } from '@/lib/services/file';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = verifyToken(request);
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
    const file = formData.get('file') as File;
    const productId = formData.get('productId') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload file
    const result = await uploadFile({
      userId: user.userId,
      productId: productId || undefined,
      file: {
        name: file.name,
        size: file.size,
        type: file.type,
      },
      buffer,
    });

    return NextResponse.json(
      {
        message: 'File uploaded successfully',
        file: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Upload error:', error);

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
