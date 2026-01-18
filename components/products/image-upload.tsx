'use client';

import { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

/**
 * ImageUpload component
 * Specialized component for image uploads with preview
 */

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  onImageRemove?: () => void;
  currentImage?: File | string | null;
  uploadProgress?: number;
  error?: string | null;
  label?: string;
  helperText?: string;
  maxSize?: number; // in bytes
  aspectRatio?: 'square' | 'video' | 'free';
}

export function ImageUpload({
  onImageSelect,
  onImageRemove,
  currentImage,
  uploadProgress,
  error,
  label = '이미지 업로드',
  helperText = 'JPG, PNG, WEBP 형식 (최대 5MB)',
  maxSize = 5 * 1024 * 1024, // 5MB default
  aspectRatio = 'free',
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const validateImage = useCallback(
    (file: File): boolean => {
      setValidationError(null);

      // Check file type
      if (!file.type.startsWith('image/')) {
        setValidationError('이미지 파일만 업로드 가능합니다');
        return false;
      }

      // Check allowed formats
      const allowedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedFormats.includes(file.type)) {
        setValidationError('JPG, PNG, WEBP, GIF 형식만 지원됩니다');
        return false;
      }

      // Check file size
      if (file.size > maxSize) {
        setValidationError(
          `파일 크기는 ${formatFileSize(maxSize)} 이하여야 합니다`
        );
        return false;
      }

      return true;
    },
    [maxSize]
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
      if (files.length > 0 && validateImage(files[0])) {
        const file = files[0];
        onImageSelect(file);

        // Generate preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    [onImageSelect, validateImage]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0 && validateImage(files[0])) {
        const file = files[0];
        onImageSelect(file);

        // Generate preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    [onImageSelect, validateImage]
  );

  const handleRemove = useCallback(() => {
    setValidationError(null);
    setPreview(null);
    onImageRemove?.();
  }, [onImageRemove]);

  const displayError = error || validationError;
  const imageUrl = preview || (typeof currentImage === 'string' ? currentImage : null);

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square';
      case 'video':
        return 'aspect-video';
      default:
        return 'aspect-auto';
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      )}

      {/* Upload Area or Preview */}
      {!imageUrl && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer',
            getAspectRatioClass(),
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50',
            displayError && 'border-destructive bg-destructive/5'
          )}
        >
          <input
            type="file"
            id={`image-upload-${label}`}
            className="hidden"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileInput}
          />

          <label
            htmlFor={`image-upload-${label}`}
            className="cursor-pointer flex flex-col items-center gap-3"
          >
            <div
              className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center',
                displayError
                  ? 'bg-destructive/10 text-destructive'
                  : 'bg-primary/10 text-primary'
              )}
            >
              {displayError ? (
                <AlertCircle className="w-6 h-6" />
              ) : (
                <ImageIcon className="w-6 h-6" />
              )}
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium">
                {displayError ? '업로드 실패' : '이미지를 드래그하거나 클릭하여 선택'}
              </p>
              <p className="text-xs text-muted-foreground">{helperText}</p>
            </div>
          </label>
        </div>
      )}

      {/* Image Preview */}
      {imageUrl && (
        <div className="relative border rounded-lg overflow-hidden bg-muted">
          <div className={cn('relative', getAspectRatioClass(), 'min-h-[200px]')}>
            <Image
              src={imageUrl}
              alt="Preview"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 400px"
            />

            {/* Upload Progress Overlay */}
            {uploadProgress !== undefined && uploadProgress < 100 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="text-sm mb-2">업로드 중...</div>
                  <div className="text-2xl font-bold">{uploadProgress}%</div>
                </div>
              </div>
            )}

            {/* Remove Button */}
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={handleRemove}
              disabled={uploadProgress !== undefined && uploadProgress < 100}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {displayError && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{displayError}</span>
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
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
