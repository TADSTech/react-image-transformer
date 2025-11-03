import { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'motion/react';
import { ImageIcon } from 'lucide-react';

interface FileUploaderProps {
  onFileUpload: (file: File, fileType: string, previewUrl?: string) => void;
}

export function FileUploader({ onFileUpload }: FileUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const detectFileType = (file: File): string => {
    const mime = file.type;
    if (mime.startsWith('image/')) return 'Image';
    return 'Unknown';
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const fileType = detectFileType(file);

      // Create preview URL for images
      if (fileType === 'Image') {
        // Revoke previous URL if exists to avoid memory leak
        if (preview) {
          URL.revokeObjectURL(preview);
        }
        const url = URL.createObjectURL(file);
        setPreview(url);
        onFileUpload(file, fileType, url);
      } else {
        setPreview(null);
        onFileUpload(file, fileType);
      }
    }
  }, [onFileUpload, preview]);

  // Don't auto-revoke on unmount - let the consuming component manage it
  // The blob URL needs to persist when navigating to editor
  useEffect(() => {
    return () => {
      // Commented out to prevent premature revocation
      // if (preview) {
      //   URL.revokeObjectURL(preview);
      // }
    };
  }, [preview]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/heif': ['.heif', '.heic'],
      'image/webp': ['.webp'],
      'image/gif': ['.gif'],
    },
    multiple: false,
  });

  return (
    <motion.div
      {...(getRootProps() as any)}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragActive
            ? 'border-(--color-primary) bg-(--color-bg-secondary)'
            : 'border-(--color-border) hover:border-(--color-primary)'
        }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <input {...getInputProps()} />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
  <ImageIcon className="w-12 h-12 mx-auto mb-3 text-(--color-primary)" aria-hidden="true" />

        {preview ? (
          <div className="mb-3">
            <img src={preview} alt="preview" className="mx-auto max-h-48 rounded-md" />
          </div>
        ) : null}

        {isDragActive ? (
          <p className="text-lg text-(--color-primary) font-medium">
            Drop your image here...
          </p>
        ) : (
          <>
            <p className="text-lg font-medium text-(--color-text) mb-2">
              Drag & drop your image here
            </p>
            <p className="text-sm text-(--color-text-secondary) mb-4">
              or click to browse images
            </p>
            <p className="text-xs text-(--color-text-secondary)">
              Supported: PNG, JPG, JPEG, HEIF, HEIC, WEBP, GIF
            </p>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
