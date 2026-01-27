import { useCallback, useState } from 'react';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';
import { cn } from '~/lib/utils';

interface FileUploadProps {
  label?: string;
  accept?: string;
  onChange: (file: File | null) => void;
  value?: File | null;
  preview?: string;
  error?: string;
  className?: string;
  type?: 'file' | 'image';
}

export function FileUpload({
  label,
  accept,
  onChange,
  value,
  preview,
  error,
  className,
  type = 'file',
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(preview || null);

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
      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [onChange, type]
  );

  const handleFile = (file: File) => {
    onChange(file);
    if (type === 'image' && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleClear = () => {
    onChange(null);
    setPreviewUrl(null);
  };

  const Icon = type === 'image' ? ImageIcon : FileText;

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
          {label}
        </label>
      )}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative border-2 border-dashed rounded-xl transition-all duration-200',
          isDragging
            ? 'border-zinc-900 bg-zinc-50'
            : 'border-zinc-200 hover:border-zinc-300',
          error && 'border-red-500',
          (value || previewUrl) && 'border-solid'
        )}
      >
        {value || previewUrl ? (
          <div className="p-4">
            {type === 'image' && previewUrl ? (
              <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-100">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                >
                  <X className="w-4 h-4 text-zinc-600" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-2">
                <div className="w-12 h-12 bg-zinc-100 rounded-lg flex items-center justify-center">
                  <Icon className="w-6 h-6 text-zinc-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 truncate">
                    {value?.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {value && formatFileSize(value.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClear}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-zinc-100 transition-colors"
                >
                  <X className="w-4 h-4 text-zinc-400" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center p-8 cursor-pointer">
            <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mb-3">
              <Upload className="w-6 h-6 text-zinc-400" />
            </div>
            <p className="text-sm font-medium text-zinc-700 mb-1">
              Drop your file here, or{' '}
              <span className="text-zinc-900 underline">browse</span>
            </p>
            <p className="text-xs text-zinc-400">
              {type === 'image'
                ? 'PNG, JPG, GIF up to 10MB'
                : 'PDF, EPUB up to 100MB'}
            </p>
            <input
              type="file"
              accept={accept}
              onChange={handleChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </label>
        )}
      </div>
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
