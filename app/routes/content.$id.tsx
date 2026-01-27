import { useState } from 'react';
import { Link, redirect } from 'react-router';
import { 
  ArrowLeft, 
  Download, 
  Eye, 
  Calendar, 
  User, 
  Building2, 
  FileText,
  Share2,
  ArrowUpRight
} from 'lucide-react';
import type { Route } from './+types/content.$id';
import { contentService } from '~/lib/api/content.server';
import { PreviewModal } from '~/components/content/preview-modal';
import { ContentCard } from '~/components/content/content-card';
import { formatDate, getContentTypeLabel } from '~/lib/utils';

export function meta({ data }: Route.MetaArgs) {
  if (!data?.content) {
    return [{ title: 'Not Found - AI Books' }];
  }
  return [
    { title: `${data.content.title} - AI Books` },
    { name: 'description', content: data.content.description },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const content = await contentService.getById(params.id);
  
  if (!content) {
    throw redirect('/library');
  }

  const related = await contentService.getByType(content.type, { limit: 4 });
  const filteredRelated = related.filter((item) => item.id !== content.id).slice(0, 4);

  return { content, related: filteredRelated };
}

export default function ContentDetail({ loaderData }: Route.ComponentProps) {
  const { content, related } = loaderData;
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  return (
    <div className="min-h-screen bg-stone-50">
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <header className="border-b border-stone-200 bg-stone-50/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="group">
              <span className="font-serif text-2xl md:text-3xl text-stone-900 tracking-tight">
                AI<span className="text-amber-700">Books</span>
              </span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-10">
              {['Library', 'Books', 'Magazines', 'Newspapers'].map((item) => (
                <Link
                  key={item}
                  to={item === 'Library' ? '/library' : `/library/${item.toLowerCase()}`}
                  className="relative text-sm font-medium tracking-wide text-stone-600 hover:text-stone-900 transition-colors duration-300 py-2 group"
                >
                  {item}
                  <span className="absolute bottom-0 left-0 w-0 h-px bg-amber-700 group-hover:w-full transition-all duration-300" />
                </Link>
              ))}
            </nav>

            <Link
              to="/"
              className="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors duration-300"
            >
              Home
            </Link>
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-6 py-12">
        <Link
          to="/library"
          className="inline-flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-amber-700 transition-colors duration-300 mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Library
        </Link>

        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
          <div className="lg:col-span-2">
            <div className="sticky top-32">
              <div className="aspect-[3/4] overflow-hidden bg-stone-200 shadow-2xl shadow-stone-300/50">
                <img
                  src={content.coverUrl}
                  alt={content.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-8 flex gap-4">
                <button
                  onClick={() => setIsPreviewOpen(true)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 border border-stone-200 hover:border-stone-300 text-stone-700 hover:text-stone-900 font-medium transition-all duration-300"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </button>
                <a
                  href={content.fileUrl}
                  download
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-amber-600 hover:bg-amber-500 text-white font-medium transition-all duration-300"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-xs font-medium tracking-[0.2em] uppercase text-amber-700 px-3 py-1.5 border border-amber-700/30">
                {getContentTypeLabel(content.type)}
              </span>
              {content.featured && (
                <span className="text-xs font-medium tracking-[0.2em] uppercase text-stone-500 px-3 py-1.5 border border-stone-300">
                  Featured
                </span>
              )}
            </div>

            <h1 className="font-serif text-4xl md:text-5xl text-stone-900 mb-6 leading-tight">
              {content.title}
            </h1>

            <div className="flex flex-wrap gap-6 mb-8 text-sm text-stone-500">
              {content.author && (
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4 text-stone-400" />
                  {content.author}
                </span>
              )}
              {content.publisher && (
                <span className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-stone-400" />
                  {content.publisher}
                </span>
              )}
              {content.pageCount && (
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-stone-400" />
                  {content.pageCount} pages
                </span>
              )}
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-stone-400" />
                {formatDate(content.publishedDate || content.createdAt)}
              </span>
            </div>

            <div className="bg-white border border-stone-200 p-8 mb-8">
              <h2 className="text-xs font-medium tracking-[0.2em] uppercase text-stone-400 mb-4">About</h2>
              <p className="text-stone-600 leading-relaxed text-lg whitespace-pre-line">
                {content.description}
              </p>
            </div>

            {content.tags && content.tags.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xs font-medium tracking-[0.2em] uppercase text-stone-400 mb-4">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {content.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-4 py-2 bg-stone-100 text-stone-600 text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-6 pt-8 border-t border-stone-200">
              <button className="flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-amber-700 transition-colors duration-300">
                <Share2 className="w-4 h-4" />
                Share this {content.type}
              </button>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-24 pt-16 border-t border-stone-200">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="text-xs font-medium tracking-[0.3em] uppercase text-amber-700 mb-3 block">
                  You May Also Like
                </span>
                <h2 className="font-serif text-3xl text-stone-900">
                  More {getContentTypeLabel(content.type)}s
                </h2>
              </div>
              <Link
                to={`/library/${content.type}s`}
                className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-amber-700 transition-colors duration-300"
              >
                View All
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((item) => (
                <ContentCard key={item.id} content={item} />
              ))}
            </div>
          </section>
        )}
      </main>

      <PreviewModal
        content={content}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />

      <footer className="bg-stone-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Link to="/" className="font-serif text-2xl text-white tracking-tight">
              AI<span className="text-amber-500">Books</span>
            </Link>
            <p className="text-stone-400 text-sm">
              &copy; {new Date().getFullYear()} AI Books. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
