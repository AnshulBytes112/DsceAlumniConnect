

import { type ChangeEvent, forwardRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FileUploaderProps {
  label?: string;
  accept?: string;
  onChange?: (file: File | null) => void;
  error?: string;
  className?: string;
  maxSize?: number; // in MB
  required?: boolean;
}

const FileUploader = forwardRef<HTMLInputElement, FileUploaderProps>(
  ({ label, accept, onChange, error, className, maxSize = 5, required = false, ...props }, ref) => {
    const [fileName, setFileName] = useState<string | null>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      
      if (file) {
        // Check file size
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxSize) {
          setFileName(null);
          onChange?.(null);
          return;
        }
      }
      
      setFileName(file ? file.name : null);
      onChange?.(file);
    };

    const clearFile = () => {
      setFileName(null);
      onChange?.(null);
      // Reset input value
      const input = document.getElementById('file-upload') as HTMLInputElement;
      if (input) input.value = '';
    };

    return (
      <div className={cn('w-full space-y-2', className)}>
        {label && (
          <label className="text-sm font-medium text-brand-accent-light/80">
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {!fileName ? (
            <label
              htmlFor="file-upload"
              className={cn(
                'flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-white/20 bg-white/5 transition-colors hover:bg-white/10',
                error && 'border-red-500/50 bg-red-500/5'
              )}
            >
              <div className="flex flex-col items-center justify-center pb-6 pt-5">
                <Upload className="mb-3 h-8 w-8 text-brand-accent" />
                <p className="mb-2 text-sm text-brand-accent-light">
                  <span className="font-semibold text-brand-accent">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-brand-accent-light/60">
                  {accept === '.pdf' ? 'PDF only' : 'JPG, PNG, GIF'} (MAX. {maxSize}MB)
                </p>
              </div>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept={accept}
                onChange={handleFileChange}
                ref={ref}
                {...props}
              />
            </label>
          ) : (
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="flex items-center space-x-3">
                <div className="rounded-full bg-brand-accent/10 p-2">
                  <Upload className="h-5 w-5 text-brand-accent" />
                </div>
                <span className="text-sm font-medium text-white truncate max-w-[200px]">
                  {fileName}
                </span>
              </div>
              <button
                type="button"
                onClick={clearFile}
                className="rounded-full p-1 hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5 text-brand-accent-light" />
              </button>
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

FileUploader.displayName = 'FileUploader';

export { FileUploader };
