import { Link } from 'react-router';
import { ArrowUpRight } from 'lucide-react';
import { cn, formatDate, getContentTypeLabel } from '~/lib/utils';
import type { ContentItem } from '~/lib/api/types';

interface ContentCardProps {
  content: ContentItem;
  className?: string;
}

export function ContentCard({ content, className }: ContentCardProps) {
  return (
    <Link
      to={`/content/${content.id}`}
      className={cn(
        'group block bg-white overflow-hidden border border-stone-200',
        'hover:border-amber-700/30 hover:shadow-xl hover:shadow-stone-200/50',
        'transition-all duration-500',
        className
      )}
    >
      <div className="aspect-[3/4] relative overflow-hidden bg-stone-100">
        <img
          src={content.coverUrl}
          alt={content.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
          <span className="inline-flex items-center gap-2 text-white text-sm font-medium">
            View Details
            <ArrowUpRight className="w-4 h-4" />
          </span>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs font-medium tracking-widest uppercase text-amber-700">
            {getContentTypeLabel(content.type)}
          </span>
          {content.pageCount && (
            <span className="text-xs text-stone-400">
              {content.pageCount} pages
            </span>
          )}
        </div>
        <h3 className="font-serif text-xl text-stone-900 mb-2 line-clamp-2 group-hover:text-amber-800 transition-colors duration-300">
          {content.title}
        </h3>
        {content.author && (
          <p className="text-sm text-stone-500 mb-2">by {content.author}</p>
        )}
        <p className="text-sm text-stone-400 line-clamp-2 leading-relaxed">{content.description}</p>
        <p className="text-xs text-stone-300 mt-4 pt-4 border-t border-stone-100">
          {formatDate(content.publishedDate || content.createdAt)}
        </p>
      </div>
    </Link>
  );
}
