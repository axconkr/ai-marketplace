# File Upload System Documentation

Complete documentation for the AI Marketplace file upload system.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Setup Instructions](#setup-instructions)
4. [API Reference](#api-reference)
5. [Component Usage](#component-usage)
6. [Security Features](#security-features)
7. [Deployment Guide](#deployment-guide)

---

## Overview

The file upload system provides secure file management for AI Marketplace products with the following features:

- **Multiple File Types**: ZIP, JSON, code files, images, PDFs, videos
- **Storage Abstraction**: Local (development) + Supabase (production)
- **Security**: MIME type validation, magic byte checking, virus scanning placeholder
- **User Experience**: Drag & drop, progress tracking, error handling
- **Access Control**: Authentication required, role-based permissions

### Key Specifications

- Max file size: 100MB per file
- Max files per product: 10
- Supported formats: `.zip`, `.json`, `.js`, `.ts`, `.py`, `.pdf`, `.jpg`, `.png`, `.mp4`, etc.
- Storage: Local filesystem (dev) / Supabase Storage (prod)

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                    Client (Browser)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ FileUpload   │  │  FileList    │  │   Product    │  │
│  │  Component   │  │  Component   │  │    Form      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                     API Routes                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ POST /upload │  │ POST /batch  │  │ GET /download│  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   Service Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ File Service │  │  Validation  │  │     Auth     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
┌──────────────────────┐   ┌──────────────────────┐
│   Storage Provider   │   │      Database        │
│  ┌────────────────┐  │   │  ┌────────────────┐  │
│  │ Local Storage  │  │   │  │ Prisma Client  │  │
│  │ (Development)  │  │   │  │  (PostgreSQL)  │  │
│  └────────────────┘  │   │  └────────────────┘  │
│  ┌────────────────┐  │   └──────────────────────┘
│  │    Supabase    │  │
│  │  (Production)  │  │
│  └────────────────┘  │
└──────────────────────┘
```

### File Structure

```
app/api/
  upload/
    route.ts                 # Single file upload
    batch/route.ts          # Multiple files upload
    [fileId]/route.ts       # Delete file
  files/
    [fileId]/
      download/route.ts     # Download file

lib/
  storage/
    interface.ts            # Storage provider interface
    local.ts               # Local filesystem storage
    supabase.ts            # Supabase storage (placeholder)
    index.ts               # Provider factory
  validations/
    file.ts                # File validation utilities
  services/
    file.ts                # File business logic
  auth/
    verify-token.ts        # JWT verification

components/
  upload/
    FileUpload.tsx         # Upload component
    FileList.tsx           # File list component
    index.ts               # Exports

prisma/
  schema.prisma            # Database schema
```

---

## Setup Instructions

### 1. Database Migration

Run Prisma migration to create the File table:

```bash
# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name add_file_upload_system

# Apply migration
npx prisma migrate deploy
```

### 2. Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Storage Provider (local or supabase)
STORAGE_PROVIDER=local

# File Upload Limits
FILE_UPLOAD_MAX_SIZE=104857600  # 100MB
FILE_UPLOAD_ALLOWED_TYPES="image/*,application/pdf,application/zip,text/*,application/json"
UPLOAD_DIR=/uploads

# Supabase (for production)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_STORAGE_BUCKET=products
```

### 3. Create Upload Directory

For local development, create the uploads directory:

```bash
mkdir -p public/uploads
```

### 4. Install Dependencies (if needed)

For production with Supabase:

```bash
npm install @supabase/supabase-js
```

---

## API Reference

### Upload Single File

**Endpoint**: `POST /api/upload`

**Authentication**: Required (Bearer token)

**Authorization**: Seller or Admin role

**Request**:
```http
POST /api/upload
Content-Type: multipart/form-data
Authorization: Bearer <token>

file: <File>
productId: <string> (optional)
```

**Response**:
```json
{
  "message": "File uploaded successfully",
  "file": {
    "id": "clx123...",
    "filename": "1703123456-abc123.pdf",
    "originalName": "document.pdf",
    "url": "/uploads/products/clx456/1703123456-abc123.pdf",
    "size": 1048576,
    "mimeType": "application/pdf"
  }
}
```

**Error Responses**:
- `401`: Unauthorized (no token or invalid token)
- `403`: Forbidden (not a seller or admin)
- `400`: Bad request (validation error, file too large, invalid type)
- `500`: Internal server error

---

### Upload Multiple Files

**Endpoint**: `POST /api/upload/batch`

**Authentication**: Required (Bearer token)

**Authorization**: Seller or Admin role

**Request**:
```http
POST /api/upload/batch
Content-Type: multipart/form-data
Authorization: Bearer <token>

file0: <File>
file1: <File>
...
productId: <string> (optional)
```

**Response**:
```json
{
  "message": "Successfully uploaded 3 of 3 files",
  "files": [
    {
      "id": "clx123...",
      "filename": "1703123456-abc123.pdf",
      "originalName": "document.pdf",
      "url": "/uploads/products/clx456/1703123456-abc123.pdf",
      "size": 1048576,
      "mimeType": "application/pdf"
    }
  ],
  "totalUploaded": 3,
  "totalRequested": 3
}
```

---

### Delete File

**Endpoint**: `DELETE /api/upload/[fileId]`

**Authentication**: Required (Bearer token)

**Authorization**: File owner or Admin

**Request**:
```http
DELETE /api/upload/clx123...
Authorization: Bearer <token>
```

**Response**:
```json
{
  "message": "File deleted successfully",
  "fileId": "clx123..."
}
```

---

### Download File

**Endpoint**: `GET /api/files/[fileId]/download`

**Authentication**: Required for private files

**Authorization**: File owner, purchaser, or public access

**Request**:
```http
GET /api/files/clx123.../download
Authorization: Bearer <token>
```

**Response**: File stream with headers:
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="document.pdf"
Content-Length: 1048576
```

---

### Get File Metadata

**Endpoint**: `GET /api/upload/[fileId]`

**Authentication**: Not required

**Request**:
```http
GET /api/upload/clx123...
```

**Response**:
```json
{
  "id": "clx123...",
  "filename": "1703123456-abc123.pdf",
  "originalName": "document.pdf",
  "mimeType": "application/pdf",
  "size": 1048576,
  "url": "/uploads/products/clx456/1703123456-abc123.pdf",
  "downloadCount": 42,
  "createdAt": "2024-12-28T10:00:00Z",
  "product": {
    "id": "clx456...",
    "name": "My Product"
  }
}
```

---

## Component Usage

### FileUpload Component

Basic usage:

```tsx
import { FileUpload } from '@/components/upload';

export default function ProductForm() {
  const handleUploadComplete = (files) => {
    console.log('Uploaded files:', files);
  };

  const handleUploadError = (error) => {
    console.error('Upload error:', error);
  };

  return (
    <FileUpload
      productId="clx456..."
      maxFiles={10}
      onUploadComplete={handleUploadComplete}
      onUploadError={handleUploadError}
    />
  );
}
```

**Props**:
- `productId` (optional): Product ID to associate files with
- `maxFiles` (optional): Maximum number of files (default: 10)
- `onUploadComplete` (optional): Callback when all uploads succeed
- `onUploadError` (optional): Callback when upload fails

---

### FileList Component

Display uploaded files:

```tsx
import { FileList } from '@/components/upload';

export default function ProductFiles({ productId }) {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    // Fetch files for product
    fetch(`/api/products/${productId}/files`)
      .then(res => res.json())
      .then(data => setFiles(data.files));
  }, [productId]);

  const handleDelete = (fileId) => {
    setFiles(files.filter(f => f.id !== fileId));
  };

  return (
    <FileList
      files={files}
      onDelete={handleDelete}
      canDelete={true}
    />
  );
}
```

**Props**:
- `files`: Array of file objects
- `onDelete` (optional): Callback when file is deleted
- `canDelete` (optional): Show delete button (default: false)

---

## Security Features

### 1. File Type Validation

**Extension Check**:
```typescript
const ALLOWED_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg',
  '.pdf', '.md', '.txt', '.doc', '.docx',
  '.js', '.ts', '.jsx', '.tsx', '.py', '.json',
  '.zip', '.tar', '.gz', '.tar.gz',
  '.mp4', '.webm', '.mov'
];
```

**MIME Type Validation**:
- Validates declared MIME type against allowed list
- Checks magic bytes to prevent spoofing

**Magic Bytes Check**:
```typescript
const MAGIC_BYTES = {
  'image/jpeg': [[0xff, 0xd8, 0xff]],
  'image/png': [[0x89, 0x50, 0x4e, 0x47]],
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]],
  // ...
};
```

### 2. File Size Limits

Category-based limits:
- Images: 5MB
- Documents: 10MB
- Code/Archives: 100MB
- Videos: 50MB

### 3. Filename Sanitization

- Removes path separators (`/`, `\`, `:`)
- Removes null bytes (`\0`)
- Removes leading dots (hidden files)
- Limits filename length to 100 characters
- Replaces multiple spaces with single space

### 4. Security Checks

**Malicious Pattern Detection**:
- Double extension check (e.g., `file.pdf.exe`)
- Executable file detection
- SVG script injection detection
- ZIP bomb detection (basic)

### 5. Authentication & Authorization

- JWT token verification required for uploads
- Role-based access control (seller/admin only)
- File ownership verification for deletions
- Purchase verification for downloads (TODO)

### 6. Rate Limiting (TODO)

Recommended implementation:
- 10 files per minute per user
- 100MB total per 5 minutes per user

---

## Deployment Guide

### Local Development

1. Set `STORAGE_PROVIDER=local` in `.env`
2. Create `public/uploads` directory
3. Files stored in: `public/uploads/products/{productId}/`
4. Files accessible at: `http://localhost:3000/uploads/...`

### Production with Supabase

#### 1. Create Supabase Storage Bucket

```sql
-- In Supabase SQL Editor
insert into storage.buckets (id, name, public)
values ('products', 'products', false);
```

#### 2. Set Bucket Policies

```sql
-- Allow authenticated users to upload
create policy "Authenticated users can upload"
on storage.objects for insert
to authenticated
with check (bucket_id = 'products');

-- Allow file owners to delete
create policy "Users can delete own files"
on storage.objects for delete
to authenticated
using (auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read for published products
create policy "Public read for published products"
on storage.objects for select
to public
using (bucket_id = 'products');
```

#### 3. Install Supabase SDK

```bash
npm install @supabase/supabase-js
```

#### 4. Implement Supabase Storage Methods

Update `/lib/storage/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class SupabaseStorage implements StorageProvider {
  async upload(file: Buffer, filename: string, subPath?: string) {
    const filePath = subPath ? `${subPath}/${filename}` : filename;

    const { data, error } = await supabase.storage
      .from('products')
      .upload(filePath, file, {
        contentType: 'auto-detect',
        upsert: false,
      });

    if (error) throw new Error(error.message);

    const { data: urlData } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);

    return {
      path: filePath,
      url: urlData.publicUrl,
      filename,
    };
  }

  // Implement other methods...
}
```

#### 5. Update Environment Variables

```env
STORAGE_PROVIDER=supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_STORAGE_BUCKET=products
```

#### 6. Deploy

```bash
# Build application
npm run build

# Deploy to Vercel/Netlify/etc.
vercel deploy --prod
```

---

## Usage Examples

### Example 1: Product File Upload

```tsx
'use client';

import { useState } from 'react';
import { FileUpload, FileList } from '@/components/upload';

export default function ProductFilesPage({ productId }) {
  const [files, setFiles] = useState([]);

  const handleUploadComplete = (uploadedFiles) => {
    // Refresh file list
    fetchFiles();
  };

  const fetchFiles = async () => {
    const res = await fetch(`/api/products/${productId}/files`);
    const data = await res.json();
    setFiles(data.files);
  };

  useEffect(() => {
    fetchFiles();
  }, [productId]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-4">Upload Files</h2>
        <FileUpload
          productId={productId}
          maxFiles={10}
          onUploadComplete={handleUploadComplete}
        />
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Uploaded Files</h2>
        <FileList
          files={files}
          canDelete={true}
          onDelete={(fileId) => {
            setFiles(files.filter(f => f.id !== fileId));
          }}
        />
      </div>
    </div>
  );
}
```

### Example 2: Direct API Upload

```typescript
async function uploadFile(file: File, productId: string) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('productId', productId);

  const token = localStorage.getItem('accessToken');

  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  const data = await response.json();
  return data.file;
}
```

### Example 3: Batch Upload

```typescript
async function uploadMultipleFiles(files: File[], productId: string) {
  const formData = new FormData();

  files.forEach((file, index) => {
    formData.append(`file${index}`, file);
  });

  formData.append('productId', productId);

  const token = localStorage.getItem('accessToken');

  const response = await fetch('/api/upload/batch', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();
  return data.files;
}
```

---

## Maintenance

### Cleanup Deleted Files

Run periodic cleanup to remove soft-deleted files older than 30 days:

```typescript
// Can be run as a cron job or scheduled task
import { cleanupDeletedFiles } from '@/lib/services/file';

async function runCleanup() {
  const deletedCount = await cleanupDeletedFiles(30);
  console.log(`Cleaned up ${deletedCount} files`);
}
```

### Monitor Storage Usage

Track storage usage in database:

```sql
-- Total storage used
SELECT SUM(size) / 1024 / 1024 / 1024 as total_gb
FROM "File"
WHERE status = 'ACTIVE';

-- Storage by product
SELECT product_id, SUM(size) / 1024 / 1024 as total_mb
FROM "File"
WHERE status = 'ACTIVE'
GROUP BY product_id
ORDER BY total_mb DESC;
```

---

## Troubleshooting

### Issue: "File too large" error

**Solution**: Check `FILE_UPLOAD_MAX_SIZE` environment variable and increase if needed.

### Issue: "Unauthorized" error

**Solution**: Ensure JWT token is included in Authorization header and user has seller/admin role.

### Issue: Files not appearing in storage

**Solution**:
- Check `public/uploads` directory exists (local)
- Verify Supabase bucket permissions (production)
- Check file service logs for upload errors

### Issue: Download returns 404

**Solution**:
- Verify file exists in database
- Check file status is ACTIVE
- Ensure file path matches storage location

---

## Future Enhancements

1. **Virus Scanning**: Integrate ClamAV or VirusTotal API
2. **Chunked Upload**: Support large file uploads >100MB
3. **Resume Upload**: Allow pausing and resuming uploads
4. **Image Optimization**: Auto-resize/compress images
5. **CDN Integration**: CloudFront or Cloudflare for faster delivery
6. **Rate Limiting**: Implement per-user upload rate limits
7. **Purchase Verification**: Check if user purchased product before download
8. **File Versioning**: Support multiple versions of same file
9. **Automatic Cleanup**: Scheduled job to remove old deleted files
10. **Analytics**: Track download patterns and popular files

---

## Support

For issues or questions, please contact the development team or create an issue in the project repository.
