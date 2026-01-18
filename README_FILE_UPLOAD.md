# File Upload System

Secure, production-ready file upload system for AI Marketplace.

## Features

- ✅ Multi-file upload with drag & drop
- ✅ Real-time progress tracking
- ✅ File type validation (MIME + magic bytes)
- ✅ Size limits by file category
- ✅ Security: filename sanitization, malicious pattern detection
- ✅ Authentication & authorization (JWT-based)
- ✅ Storage abstraction (Local + Supabase)
- ✅ Soft delete with 30-day retention
- ✅ Download tracking
- ✅ Responsive UI components

## Quick Start

```bash
# 1. Run database migration
npx prisma generate
npx prisma migrate dev --name add_file_upload_system

# 2. Create uploads directory
mkdir -p public/uploads

# 3. Configure environment
cp .env.example .env
# Set STORAGE_PROVIDER=local

# 4. Start development server
npm run dev
```

## Usage

### Upload Component

```tsx
import { FileUpload } from '@/components/upload';

<FileUpload
  productId="clx123..."
  maxFiles={10}
  onUploadComplete={(files) => console.log('Done!', files)}
  onUploadError={(error) => console.error(error)}
/>
```

### File List Component

```tsx
import { FileList } from '@/components/upload';

<FileList
  files={uploadedFiles}
  canDelete={true}
  onDelete={(fileId) => handleDelete(fileId)}
/>
```

## API Endpoints

### Upload Single File
```http
POST /api/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <File>
productId: <string> (optional)
```

### Upload Multiple Files
```http
POST /api/upload/batch
Authorization: Bearer <token>
Content-Type: multipart/form-data

file0: <File>
file1: <File>
...
productId: <string> (optional)
```

### Download File
```http
GET /api/files/[fileId]/download
Authorization: Bearer <token>
```

### Delete File
```http
DELETE /api/upload/[fileId]
Authorization: Bearer <token>
```

## Supported File Types

- **Images**: `.jpg`, `.png`, `.gif`, `.webp`, `.svg`
- **Documents**: `.pdf`, `.md`, `.txt`, `.doc`, `.docx`
- **Code**: `.js`, `.ts`, `.jsx`, `.tsx`, `.py`, `.json`
- **Archives**: `.zip`, `.tar`, `.gz`, `.tar.gz`
- **Videos**: `.mp4`, `.webm`, `.mov`

## File Size Limits

- Images: 5MB
- Documents: 10MB
- Code/Archives: 100MB
- Videos: 50MB

## Security Features

- ✅ JWT authentication required
- ✅ Role-based authorization (seller/admin)
- ✅ MIME type validation
- ✅ Magic byte verification
- ✅ Filename sanitization
- ✅ Malicious pattern detection
- ✅ SVG script injection prevention
- ✅ ZIP bomb detection
- ✅ Double extension check

## Storage Options

### Local Storage (Development)

Files stored in: `public/uploads/`

Configuration:
```env
STORAGE_PROVIDER=local
UPLOAD_DIR=/uploads
```

### Supabase Storage (Production)

Files stored in: Supabase Cloud Storage

Configuration:
```env
STORAGE_PROVIDER=supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_STORAGE_BUCKET=products
```

## Project Structure

```
app/api/
  upload/                 # Upload endpoints
  files/                  # Download endpoints
lib/
  storage/               # Storage abstraction layer
  validations/           # File validation utilities
  services/              # Business logic
  auth/                  # Authentication utilities
components/
  upload/                # React components
docs/
  FILE_UPLOAD_SYSTEM.md  # Complete documentation
  SETUP_GUIDE.md         # Quick setup guide
prisma/
  schema.prisma          # Database schema
```

## Documentation

- **Complete Guide**: [docs/FILE_UPLOAD_SYSTEM.md](docs/FILE_UPLOAD_SYSTEM.md)
- **Quick Setup**: [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md)

## Database Schema

```prisma
model File {
  id             String     @id @default(cuid())
  product_id     String?
  user_id        String
  filename       String
  original_name  String
  mime_type      String
  size           Int
  path           String
  url            String
  download_count Int        @default(0)
  status         FileStatus @default(ACTIVE)
  created_at     DateTime   @default(now())
  updated_at     DateTime   @updatedAt
  deleted_at     DateTime?

  product Product? @relation(fields: [product_id], references: [id])
  user    User     @relation(fields: [user_id], references: [id])
}

enum FileStatus {
  ACTIVE
  DELETED
  SCANNING
  QUARANTINED
}
```

## Example Integration

```tsx
'use client';

import { useState, useEffect } from 'react';
import { FileUpload, FileList } from '@/components/upload';

export default function ProductFilesPage({ productId }) {
  const [files, setFiles] = useState([]);

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
      <section>
        <h2 className="text-xl font-bold mb-4">Upload Files</h2>
        <FileUpload
          productId={productId}
          maxFiles={10}
          onUploadComplete={() => fetchFiles()}
        />
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Uploaded Files</h2>
        <FileList
          files={files}
          canDelete={true}
          onDelete={(fileId) => {
            setFiles(files.filter(f => f.id !== fileId));
          }}
        />
      </section>
    </div>
  );
}
```

## Maintenance

### Cleanup Deleted Files

```typescript
import { cleanupDeletedFiles } from '@/lib/services/file';

// Remove files deleted > 30 days ago
const count = await cleanupDeletedFiles(30);
console.log(`Cleaned up ${count} files`);
```

### Monitor Storage Usage

```sql
-- Total storage
SELECT SUM(size) / 1024 / 1024 / 1024 as total_gb
FROM "File"
WHERE status = 'ACTIVE';

-- By product
SELECT product_id, SUM(size) / 1024 / 1024 as total_mb
FROM "File"
WHERE status = 'ACTIVE'
GROUP BY product_id;
```

## Future Enhancements

- [ ] Virus scanning integration (ClamAV/VirusTotal)
- [ ] Chunked upload for files >100MB
- [ ] Resume/pause upload
- [ ] Image optimization (resize/compress)
- [ ] CDN integration
- [ ] Rate limiting
- [ ] Purchase verification for downloads
- [ ] File versioning
- [ ] Automatic cleanup cron job
- [ ] Download analytics

## License

MIT

## Support

For issues or questions:
1. Check [docs/FILE_UPLOAD_SYSTEM.md](docs/FILE_UPLOAD_SYSTEM.md)
2. Review [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md)
3. Contact development team
