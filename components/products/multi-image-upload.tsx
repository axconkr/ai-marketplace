'use client';

import { useState, useCallback } from 'react';
import { Upload, X, GripVertical, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

/**
 * MultiImageUpload component
 * Upload multiple images with drag-to-reorder functionality
 */

interface ImageFile {
  id: string;
  file?: File;
  url: string;
  preview: string;
}

interface MultiImageUploadProps {
  onImagesChange: (files: File[]) => void;
  currentImages?: string[];
  maxImages?: number;
  maxSize?: number; // in bytes
  error?: string | null;
}

export function MultiImageUpload({
  onImagesChange,
  currentImages = [],
  maxImages = 5,
  maxSize = 5 * 1024 * 1024, // 5MB default
  error,
}: MultiImageUploadProps) {
  const [images, setImages] = useState<ImageFile[]>(() =>
    currentImages.map((url, index) => ({
      id: `existing-${index}`,
      url,
      preview: url,
    }))
  );
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const validateImage = useCallback(
    (file: File): boolean => {
      // Check file type
      if (!file.type.startsWith('image/')) {
        return false;
      }

      // Check allowed formats
      const allowedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedFormats.includes(file.type)) {
        return false;
      }

      // Check file size
      if (file.size > maxSize) {
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
      setValidationError(null);

      const files = Array.from(e.dataTransfer.files);
      const validFiles = files.filter(validateImage);

      if (validFiles.length === 0) {
        setValidationError('유효한 이미지 파일이 없습니다');
        return;
      }

      if (images.length + validFiles.length > maxImages) {
        setValidationError(`최대 ${maxImages}개의 이미지만 업로드 가능합니다`);
        return;
      }

      // Create new image entries
      const newImages: ImageFile[] = validFiles.map((file, index) => {
        const preview = URL.createObjectURL(file);
        return {
          id: `new-${Date.now()}-${index}`,
          file,
          url: preview,
          preview,
        };
      });

      const updatedImages = [...images, ...newImages];
      setImages(updatedImages);

      // Notify parent
      const allFiles = updatedImages.map((img) => img.file).filter((f): f is File => !!f);
      onImagesChange(allFiles);
    },
    [images, maxImages, onImagesChange, validateImage]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValidationError(null);
      const files = e.target.files;
      if (!files) return;

      const filesArray = Array.from(files);
      const validFiles = filesArray.filter(validateImage);

      if (validFiles.length === 0) {
        setValidationError('유효한 이미지 파일이 없습니다');
        return;
      }

      if (images.length + validFiles.length > maxImages) {
        setValidationError(`최대 ${maxImages}개의 이미지만 업로드 가능합니다`);
        return;
      }

      // Create new image entries
      const newImages: ImageFile[] = validFiles.map((file, index) => {
        const preview = URL.createObjectURL(file);
        return {
          id: `new-${Date.now()}-${index}`,
          file,
          url: preview,
          preview,
        };
      });

      const updatedImages = [...images, ...newImages];
      setImages(updatedImages);

      // Notify parent
      const allFiles = updatedImages.map((img) => img.file).filter((f): f is File => !!f);
      onImagesChange(allFiles);
    },
    [images, maxImages, onImagesChange, validateImage]
  );

  const handleRemove = useCallback(
    (id: string) => {
      const updatedImages = images.filter((img) => img.id !== id);
      setImages(updatedImages);

      // Revoke object URL to free memory
      const imageToRemove = images.find((img) => img.id === id);
      if (imageToRemove?.file) {
        URL.revokeObjectURL(imageToRemove.preview);
      }

      // Notify parent
      const allFiles = updatedImages.map((img) => img.file).filter((f): f is File => !!f);
      onImagesChange(allFiles);
    },
    [images, onImagesChange]
  );

  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
  }, []);

  const handleDragOverImage = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      if (draggedIndex === null || draggedIndex === index) return;

      const newImages = [...images];
      const [draggedImage] = newImages.splice(draggedIndex, 1);
      newImages.splice(index, 0, draggedImage);

      setImages(newImages);
      setDraggedIndex(index);

      // Notify parent
      const allFiles = newImages.map((img) => img.file).filter((f): f is File => !!f);
      onImagesChange(allFiles);
    },
    [draggedIndex, images, onImagesChange]
  );

  const displayError = error || validationError;
  const canAddMore = images.length < maxImages;

  return (
    <div className="space-y-4">
      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOverImage(e, index)}
              className={cn(
                'relative aspect-square rounded-lg overflow-hidden border-2 border-border bg-muted cursor-move transition-opacity',
                draggedIndex === index && 'opacity-50'
              )}
            >
              <Image
                src={image.preview}
                alt={`Upload ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 20vw"
              />

              {/* Drag Handle */}
              <div className="absolute top-2 left-2 bg-black/50 rounded p-1 cursor-move">
                <GripVertical className="w-4 h-4 text-white" />
              </div>

              {/* Remove Button */}
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => handleRemove(image.id)}
              >
                <X className="w-3 h-3" />
              </Button>

              {/* Index Badge */}
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {canAddMore && (
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
            id="multi-image-upload"
            className="hidden"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={handleFileInput}
          />

          <label
            htmlFor="multi-image-upload"
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
                <Upload className="w-6 h-6" />
              )}
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium">
                추가 이미지 업로드 ({images.length}/{maxImages})
              </p>
              <p className="text-xs text-muted-foreground">
                드래그하여 순서 변경 가능 • JPG, PNG, WEBP (최대 5MB)
              </p>
            </div>

            <Button type="button" variant="outline" size="sm">
              파일 선택
            </Button>
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
    </div>
  );
}
