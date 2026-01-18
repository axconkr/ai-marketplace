# File Upload System - Quick Setup Guide

Quick start guide to get the file upload system running in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- Next.js 14 project initialized

## Step 1: Database Setup (2 minutes)

### Generate Prisma Client

```bash
npx prisma generate
```

### Create Migration

```bash
npx prisma migrate dev --name add_file_upload_system
```

This creates the following tables:
- `File` - File metadata and references
- `Product` - Product information (if not exists)
- `FileStatus` enum - File status tracking

### Apply Migration

```bash
npx prisma migrate deploy
```

## Step 2: Environment Configuration (1 minute)

Create or update `.env` file:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ai_marketplace"

# JWT (should already exist)
JWT_SECRET="your-jwt-secret-key"

# File Upload Settings
STORAGE_PROVIDER="local"
FILE_UPLOAD_MAX_SIZE=104857600
UPLOAD_DIR="/uploads"
```

## Step 3: Create Upload Directory (30 seconds)

```bash
mkdir -p public/uploads
```

## Step 4: Test the System (1 minute)

### Start Development Server

```bash
npm run dev
```

### Test Upload Component

Create a test page: `app/test-upload/page.tsx`

```tsx
'use client';

import { FileUpload } from '@/components/upload';

export default function TestUploadPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Test File Upload</h1>
      <FileUpload
        maxFiles={5}
        onUploadComplete={(files) => {
          console.log('Success!', files);
          alert(`Uploaded ${files.length} files successfully!`);
        }}
        onUploadError={(error) => {
          console.error('Error:', error);
          alert(`Error: ${error}`);
        }}
      />
    </div>
  );
}
```

### Visit Test Page

Navigate to: `http://localhost:3000/test-upload`

### Upload a Test File

1. Click or drag & drop a file
2. Watch progress bar
3. See success message

## Step 5: Integration (30 seconds)

### Add to Product Form

```tsx
import { FileUpload } from '@/components/upload';

export default function ProductForm() {
  return (
    <form>
      {/* Other form fields */}

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Product Files
        </label>
        <FileUpload
          productId={productId}
          maxFiles={10}
          onUploadComplete={(files) => {
            console.log('Files uploaded:', files);
          }}
        />
      </div>
    </form>
  );
}
```

## Verification Checklist

- [ ] Database migration completed
- [ ] Environment variables set
- [ ] Upload directory created
- [ ] Test upload succeeds
- [ ] File appears in database
- [ ] File saved to `public/uploads/`

## Common Issues

### Issue: "Prisma Client not generated"

```bash
npx prisma generate
```

### Issue: "Permission denied" on uploads directory

```bash
chmod 755 public/uploads
```

### Issue: "Unauthorized" error

Make sure you have a valid JWT token. For testing, you can temporarily disable auth in the API route.

### Issue: Upload hangs at 100%

Check server logs for errors. Likely database connection issue.

## Next Steps

1. **Production Setup**: Configure Supabase storage (see main documentation)
2. **Security**: Enable virus scanning for production
3. **Optimization**: Add image compression and CDN integration
4. **Monitoring**: Set up storage usage alerts

## Support

See full documentation: `docs/FILE_UPLOAD_SYSTEM.md`

For detailed API reference, component props, and advanced usage, refer to the complete documentation.
