'use client';

import { useState, useCallback } from 'react';
import { Upload, X, File, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

/**
 * FileUpload component
 * Drag-and-drop file upload with preview
 */

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove?: () => void;
  accept?: string;
  maxSize?: number; // in bytes
  currentFile?: File | null;
  uploadProgress?: number;
  error?: string | null;
}

export function FileUpload({
  onFileSelect,
  onFileRemove,
  accept = '.zip,.json,.yaml,.yml',
  maxSize = 50 * 1024 * 1024, // 50MB default
  currentFile,
  uploadProgress,
  error,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateFile = useCallback(
    (file: File): boolean => {
      setValidationError(null);

      // Check file size
      if (file.size > maxSize) {
        setValidationError(
          `File size must be less than ${formatFileSize(maxSize)}`
        );
        return false;
      }

      // Check file type if accept is specified
      if (accept) {
        const acceptedTypes = accept.split(',').map((t) => t.trim());
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        const isAccepted = acceptedTypes.some(
          (type) =>
            type === fileExtension || file.type.startsWith(type.replace('*', ''))
        );

        if (!isAccepted) {
          setValidationError(`File type not accepted. Allowed: ${accept}`);
          return false;
        }
      }

      return true;
    },
    [accept, maxSize]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0 && validateFile(files[0])) {
        onFileSelect(files[0]);
      }
    },
    [onFileSelect, validateFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0 && validateFile(files[0])) {
        onFileSelect(files[0]);
      }
    },
    [onFileSelect, validateFile]
  );

  const handleRemove = useCallback(() => {
    setValidationError(null);
    onFileRemove?.();
  }, [onFileRemove]);

  const displayError = error || validationError;

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {!currentFile && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50',
            displayError && 'border-destructive bg-destructive/5'
          )}
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept={accept}
            onChange={handleFileInput}
          />

          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center gap-4"
          >
            <div
              className={cn(
                'w-16 h-16 rounded-full flex items-center justify-center',
                displayError
                  ? 'bg-destructive/10 text-destructive'
                  : 'bg-primary/10 text-primary'
              )}
            >
              {displayError ? (
                <AlertCircle className="w-8 h-8" />
              ) : (
                <Upload className="w-8 h-8" />
              )}
            </div>

            <div className="space-y-2">
              <p className="font-medium">
                {displayError
                  ? 'Upload failed'
                  : 'Drag & drop your file here, or click to browse'}
              </p>
              <p className="text-sm text-muted-foreground">
                Accepted formats: {accept}
              </p>
              <p className="text-xs text-muted-foreground">
                Maximum file size: {formatFileSize(maxSize)}
              </p>
            </div>

            {!displayError && (
              <Button type="button" variant="outline" size="sm">
                Browse Files
              </Button>
            )}
          </label>
        </div>
      )}

      {/* Error Message */}
      {displayError && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{displayError}</span>
        </div>
      )}

      {/* File Preview */}
      {currentFile && (
        <div className="border rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
              {uploadProgress === 100 ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <File className="w-5 h-5 text-primary" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{currentFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(currentFile.size)}
              </p>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={uploadProgress !== undefined && uploadProgress < 100}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Upload Progress */}
          {uploadProgress !== undefined && uploadProgress < 100 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Helper function
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
