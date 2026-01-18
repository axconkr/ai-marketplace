'use client';

/**
 * File Upload System - Complete Demo Page
 * Demonstrates all features of the file upload system
 */

import { useState, useEffect } from 'react';
import { FileUpload, FileList } from '@/components/upload';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

interface FileItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  downloadCount: number;
  createdAt: string;
}

export default function FileUploadDemoPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Simulated product ID for demo
  const productId = 'demo-product-123';

  const fetchFiles = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // In real app, fetch from API
      // const res = await fetch(`/api/products/${productId}/files`);
      // const data = await res.json();
      // setFiles(data.files);

      // Demo data
      setFiles([
        {
          id: '1',
          filename: '1703123456-abc123.pdf',
          originalName: 'product-guide.pdf',
          mimeType: 'application/pdf',
          size: 2048576,
          url: '/uploads/demo/product-guide.pdf',
          downloadCount: 42,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          filename: '1703123457-def456.zip',
          originalName: 'source-code.zip',
          mimeType: 'application/zip',
          size: 10485760,
          url: '/uploads/demo/source-code.zip',
          downloadCount: 15,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      setError('Failed to load files');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUploadComplete = (uploadedFiles: Array<{ id: string; url: string }>) => {
    setSuccess(`Successfully uploaded ${uploadedFiles.length} file(s)!`);

    // Clear success message after 5 seconds
    setTimeout(() => setSuccess(null), 5000);

    // Refresh file list
    fetchFiles();
  };

  const handleUploadError = (errorMessage: string) => {
    setError(errorMessage);

    // Clear error message after 10 seconds
    setTimeout(() => setError(null), 10000);
  };

  const handleDelete = (fileId: string) => {
    // Remove from local state
    setFiles(files.filter(f => f.id !== fileId));

    setSuccess('File deleted successfully');
    setTimeout(() => setSuccess(null), 5000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            File Upload System Demo
          </h1>
          <p className="mt-2 text-gray-600">
            Complete demonstration of the AI Marketplace file upload system
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-green-800">Success</h3>
              <p className="mt-1 text-sm text-green-700">{success}</p>
            </div>
            <button
              onClick={() => setSuccess(null)}
              className="text-green-600 hover:text-green-700"
            >
              ✕
            </button>
          </div>
        )}

        {/* Info Box */}
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-800">
                System Information
              </h3>
              <ul className="mt-2 text-sm text-blue-700 space-y-1">
                <li>• Max 10 files per upload</li>
                <li>• Max 100MB per file</li>
                <li>• Supported: Images, PDFs, ZIP, Code files, Videos</li>
                <li>• Security: MIME type validation, magic byte checking</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <section className="mb-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Upload Files
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Drag and drop files or click to select
            </p>
          </div>

          <FileUpload
            productId={productId}
            maxFiles={10}
            onUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
          />
        </section>

        {/* File List Section */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Uploaded Files
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                {files.length} file(s) uploaded
              </p>
            </div>

            {files.length > 0 && (
              <div className="text-sm text-gray-600">
                Total size:{' '}
                {(
                  files.reduce((acc, f) => acc + f.size, 0) /
                  1024 /
                  1024
                ).toFixed(2)}{' '}
                MB
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600" />
              <p className="mt-2 text-sm text-gray-600">Loading files...</p>
            </div>
          ) : (
            <FileList
              files={files}
              canDelete={true}
              onDelete={handleDelete}
            />
          )}
        </section>

        {/* Features Section */}
        <section className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            System Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Upload</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>✓ Drag & drop interface</li>
                <li>✓ Multi-file selection</li>
                <li>✓ Real-time progress</li>
                <li>✓ Auto-upload on select</li>
                <li>✓ Retry failed uploads</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Security</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>✓ MIME type validation</li>
                <li>✓ Magic byte verification</li>
                <li>✓ Filename sanitization</li>
                <li>✓ Size limit enforcement</li>
                <li>✓ JWT authentication</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Management</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>✓ Download tracking</li>
                <li>✓ Soft delete (30-day retention)</li>
                <li>✓ File metadata storage</li>
                <li>✓ Product association</li>
                <li>✓ User ownership</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Storage</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>✓ Local filesystem (dev)</li>
                <li>✓ Supabase Storage (prod)</li>
                <li>✓ Path organization</li>
                <li>✓ URL generation</li>
                <li>✓ Metadata retrieval</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Code Example */}
        <section className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Usage Example
          </h2>

          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-gray-100">
              <code>{`import { FileUpload, FileList } from '@/components/upload';

export default function MyPage() {
  const [files, setFiles] = useState([]);

  return (
    <>
      <FileUpload
        productId="product-123"
        maxFiles={10}
        onUploadComplete={(files) => {
          console.log('Uploaded:', files);
          fetchFiles();
        }}
        onUploadError={(error) => {
          console.error('Error:', error);
        }}
      />

      <FileList
        files={files}
        canDelete={true}
        onDelete={(fileId) => {
          setFiles(files.filter(f => f.id !== fileId));
        }}
      />
    </>
  );
}`}</code>
            </pre>
          </div>
        </section>

        {/* Documentation Links */}
        <section className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Documentation</h3>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>
              <a
                href="/docs/FILE_UPLOAD_SYSTEM.md"
                className="text-blue-600 hover:underline"
              >
                Complete System Documentation
              </a>
            </li>
            <li>
              <a
                href="/docs/SETUP_GUIDE.md"
                className="text-blue-600 hover:underline"
              >
                Quick Setup Guide
              </a>
            </li>
            <li>
              <a
                href="/README_FILE_UPLOAD.md"
                className="text-blue-600 hover:underline"
              >
                README
              </a>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
