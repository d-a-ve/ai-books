import { useEffect, useCallback } from 'react';
import { X, Download, ArrowRight } from 'lucide-react';
import { cn } from '~/lib/utils';
import type { ContentItem } from '~/lib/api/types';

interface PreviewModalProps {
  content: ContentItem;
  isOpen: boolean;
  onClose: () => void;
}

export function PreviewModal({ content, isOpen, onClose }: PreviewModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-stone-900/90 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-5xl max-h-[90vh] m-4 bg-white overflow-hidden shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-stone-100">
          <div>
            <h2 className="font-serif text-2xl text-stone-900">{content.title}</h2>
            <p className="text-sm text-stone-500 mt-1">
              {content.author && `by ${content.author} · `}
              {content.pageCount} pages
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={content.fileUrl}
              download
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-medium transition-colors duration-300"
            >
              <Download className="w-4 h-4" />
              Download
            </a>
            <button
              onClick={onClose}
              className="w-12 h-12 flex items-center justify-center border border-stone-200 hover:border-stone-300 hover:bg-stone-50 transition-all duration-300"
            >
              <X className="w-5 h-5 text-stone-600" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto bg-stone-100 p-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white shadow-xl overflow-hidden">
              <img
                src={content.coverUrl}
                alt={content.title}
                className="w-full h-auto"
              />
            </div>
            <div className="mt-8 bg-white p-8 shadow-lg">
              <h3 className="font-serif text-xl text-stone-900 mb-4">About this {content.type}</h3>
              <p className="text-stone-600 leading-relaxed">{content.description}</p>
              {content.tags && content.tags.length > 0 && (
                <div className="mt-6 pt-6 border-t border-stone-100 flex flex-wrap gap-2">
                  {content.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 bg-stone-100 text-stone-600 text-xs font-medium tracking-wide uppercase"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <p className="text-center text-sm text-stone-400 mt-8">
              Full preview not available. Download the file to view the complete content.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
