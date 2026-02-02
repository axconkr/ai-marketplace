'use client';

/**
 * File Upload Component
 * Drag & drop file upload with progress tracking
 */

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, X, FileIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ALLOWED_EXTENSIONS, FILE_SIZE_LIMITS } from '@/lib/validations/file';
import { validateN8nWorkflowString } from '@/lib/utils/n8n-validator';

interface UploadedFile {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  url?: string;
}

interface FileUploadProps {
  productId?: string;
  maxFiles?: number;
  onUploadComplete?: (files: Array<{ id: string; url: string }>) => void;
  onUploadError?: (error: string) => void;
}

export default function FileUpload({
  productId,
  maxFiles = 10,
  onUploadComplete,
  onUploadError,
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    handleFiles(selectedFiles);
  };

  const handleFiles = (newFiles: File[]) => {
    // Check max files limit
    if (files.length + newFiles.length > maxFiles) {
      onUploadError?.(
        `최대 ${maxFiles}개 파일만 허용됩니다. ${maxFiles - files.length}개 더 업로드할 수 있습니다.`
      );
      return;
    }

    // Validate and add files
    const validatedFiles: UploadedFile[] = [];

    for (const file of newFiles) {
      // Validate file extension
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        onUploadError?.(
          `파일 "${file.name}"의 확장자가 유효하지 않습니다. 허용된 확장자: ${ALLOWED_EXTENSIONS.join(', ')}`
        );
        continue;
      }

      // Validate file size (100MB max for now)
      const maxSize = 100 * 1024 * 1024;
      if (file.size > maxSize) {
        onUploadError?.(
          `파일 "${file.name}"의 크기가 너무 큽니다. 최대 크기: ${(maxSize / 1024 / 1024).toFixed(0)}MB`
        );
        continue;
      }

      validatedFiles.push({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        status: 'pending',
        progress: 0,
      });
    }

    setFiles((prev) => [...prev, ...validatedFiles]);

    // Auto-upload after adding files
    validatedFiles.forEach(async (uploadFile) => {
      // n8n Workflow Validation for .json files
      if (uploadFile.file.name.endsWith('.json')) {
        try {
          const content = await uploadFile.file.text();
          const validation = validateN8nWorkflowString(content);

          if (!validation.isValid) {
            setFiles((prev) =>
              prev.map((f) =>
                f.id === uploadFile.id
                  ? {
                    ...f,
                    status: 'error',
                    error: `n8n Workflow 유효성 검사 실패: ${validation.errors[0]}`,
                  }
                  : f
              )
            );
            return;
          }
        } catch (err) {
          console.error('Failed to read file for validation:', err);
        }
      }

      uploadSingleFile(uploadFile);
    });
  };

  const uploadSingleFile = async (uploadFile: UploadedFile) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === uploadFile.id ? { ...f, status: 'uploading', progress: 0 } : f
      )
    );

    try {
      const formData = new FormData();
      formData.append('file', uploadFile.file);
      if (productId) {
        formData.append('productId', productId);
      }

      // Get token from localStorage or cookie
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('인증이 필요합니다. 로그인해 주세요.');
      }

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id ? { ...f, progress } : f
            )
          );
        }
      });

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status === 201) {
          const response = JSON.parse(xhr.responseText);
          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id
                ? {
                  ...f,
                  status: 'success',
                  progress: 100,
                  url: response.file.url,
                }
                : f
            )
          );

          // Check if all uploads complete
          setFiles((currentFiles) => {
            const allComplete = currentFiles.every(
              (f) => f.status === 'success' || f.status === 'error'
            );
            if (allComplete) {
              const successfulFiles = currentFiles
                .filter((f) => f.status === 'success' && f.url)
                .map((f) => ({ id: f.id, url: f.url! }));
              onUploadComplete?.(successfulFiles);
            }
            return currentFiles;
          });
        } else {
          const error = JSON.parse(xhr.responseText);
          throw new Error(error.error || '업로드에 실패했습니다');
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        throw new Error('네트워크 오류가 발생했습니다');
      });

      xhr.open('POST', '/api/upload');
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '업로드에 실패했습니다';

      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id
            ? {
              ...f,
              status: 'error',
              progress: 0,
              error: errorMessage,
            }
            : f
        )
      );

      onUploadError?.(
        `"${uploadFile.file.name}" 업로드 실패: ${errorMessage}`
      );
    }
  };

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const retryUpload = (fileId: string) => {
    const file = files.find((f) => f.id === fileId);
    if (file) {
      uploadSingleFile(file);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      {/* Drop Zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center
          transition-colors cursor-pointer
          ${isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
          }
        `}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ALLOWED_EXTENSIONS.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />

        <Upload className="mx-auto h-12 w-12 text-gray-400" />

        <p className="mt-4 text-sm text-gray-600">
          <span className="font-semibold text-blue-600">클릭하여 업로드</span>{' '}
          또는 드래그 앤 드롭
        </p>

        <p className="mt-2 text-xs text-gray-500">
          최대 {maxFiles}개 파일, 파일당 100MB
        </p>

        <p className="mt-1 text-xs text-gray-400">
          지원 형식: {ALLOWED_EXTENSIONS.slice(0, 10).join(', ')}...
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-6 space-y-3">
          <h3 className="text-sm font-medium text-gray-700">
            파일 ({files.length}/{maxFiles})
          </h3>

          {files.map((uploadFile) => (
            <div
              key={uploadFile.id}
              className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg"
            >
              {/* File Icon */}
              <FileIcon className="h-8 w-8 text-gray-400 flex-shrink-0" />

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {uploadFile.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(uploadFile.file.size)}
                </p>

                {/* Progress Bar */}
                {uploadFile.status === 'uploading' && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadFile.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {uploadFile.progress}%
                    </p>
                  </div>
                )}

                {/* Error Message */}
                {uploadFile.status === 'error' && (
                  <div className="mt-2 flex items-center gap-1 text-red-600">
                    <AlertCircle className="h-3 w-3" />
                    <p className="text-xs">{uploadFile.error}</p>
                  </div>
                )}

                {/* Success */}
                {uploadFile.status === 'success' && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ 업로드 완료
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {uploadFile.status === 'error' && (
                  <button
                    onClick={() => retryUpload(uploadFile.id)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    재시도
                  </button>
                )}

                {uploadFile.status !== 'uploading' && (
                  <button
                    onClick={() => removeFile(uploadFile.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
