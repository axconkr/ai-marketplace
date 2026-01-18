'use client';

/**
 * File List Component
 * Display list of uploaded files with download and delete actions
 */

import { useState } from 'react';
import { Download, Trash2, FileIcon } from 'lucide-react';

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

interface FileListProps {
  files: FileItem[];
  onDelete?: (fileId: string) => void;
  canDelete?: boolean;
}

export default function FileList({
  files,
  onDelete,
  canDelete = false,
}: FileListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDownload = async (file: FileItem) => {
    try {
      const token = localStorage.getItem('accessToken');
      const headers: HeadersInit = {};

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/files/${file.id}/download`, {
        headers,
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.originalName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download file');
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) {
      return;
    }

    setDeletingId(fileId);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`/api/upload/${fileId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      onDelete?.(fileId);
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete file');
    } finally {
      setDeletingId(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (files.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <FileIcon className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-4 text-sm text-gray-600">No files uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {files.map((file) => (
        <div
          key={file.id}
          className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
        >
          {/* File Icon */}
          <FileIcon className="h-10 w-10 text-gray-400 flex-shrink-0" />

          {/* File Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {file.originalName}
            </p>
            <p className="text-xs text-gray-500">
              {formatFileSize(file.size)} • {formatDate(file.createdAt)}
              {file.downloadCount > 0 && ` • ${file.downloadCount} downloads`}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDownload(file)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Download"
            >
              <Download className="h-5 w-5" />
            </button>

            {canDelete && (
              <button
                onClick={() => handleDelete(file.id)}
                disabled={deletingId === file.id}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                title="Delete"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
