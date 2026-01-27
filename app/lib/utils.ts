import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getContentTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    book: 'Book',
    magazine: 'Magazine',
    newspaper: 'Newspaper',
  };
  return labels[type] || type;
}

export function getContentTypeColor(type: string): string {
  const colors: Record<string, string> = {
    book: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    magazine: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    newspaper: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  };
  return colors[type] || 'bg-gray-500/10 text-gray-600 border-gray-500/20';
}
