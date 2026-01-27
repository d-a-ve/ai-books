import { Link } from 'react-router';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import type { Route } from './+types/home';
import { contentService } from '~/lib/api/content.server';
import type { ContentItem } from '~/lib/api/types';
import { cn, formatDate, getContentTypeLabel } from '~/lib/utils';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'AI Books - Digital Library' },
    { name: 'description', content: 'Preview and download books, magazines, and newspapers' },
  ];
}

export async function loader({}: Route.LoaderArgs) {
  const [featured, recent] = await Promise.all([
    contentService.getFeatured(),
    contentService.getRecent(6),
  ]);
  return { featured, recent };
}

function FeaturedCard({ content, index }: { content: ContentItem; index: number }) {
  const isLarge = index === 0;
  
  return (
    <Link
      to={`/content/${content.id}`}
      className={cn(
        'group relative block overflow-hidden',
        isLarge ? 'md:col-span-2 md:row-span-2' : ''
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className={cn(
        'relative overflow-hidden bg-stone-200',
        isLarge ? 'aspect-[4/5]' : 'aspect-[3/4]'
      )}>
        <img
          src={content.coverUrl}
          alt={content.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-amber-900/20 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
        <span className="inline-block px-3 py-1 mb-3 text-xs font-medium tracking-widest uppercase text-amber-200 border border-amber-200/30 rounded-full">
          {getContentTypeLabel(content.type)}
        </span>
        <h3 className={cn(
          'font-serif text-white mb-2 leading-tight',
          isLarge ? 'text-2xl md:text-4xl' : 'text-xl md:text-2xl'
        )}>
          {content.title}
        </h3>
        {content.author && (
          <p className="text-stone-300 text-sm">by {content.author}</p>
        )}
        <div className="mt-4 flex items-center gap-2 text-amber-200 text-sm font-medium opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <span>Read More</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </Link>
  );
}

function RecentItem({ content, index }: { content: ContentItem; index: number }) {
  return (
    <Link
      to={`/content/${content.id}`}
      className="group flex gap-6 py-6 border-b border-stone-200 last:border-0 hover:bg-stone-50/50 -mx-4 px-4 transition-colors duration-300"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="w-20 h-28 flex-shrink-0 overflow-hidden bg-stone-200">
        <img
          src={content.coverUrl}
          alt={content.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-xs font-medium tracking-widest uppercase text-stone-400 mb-1 block">
          {getContentTypeLabel(content.type)}
        </span>
        <h3 className="font-serif text-xl text-stone-900 mb-1 group-hover:text-amber-800 transition-colors duration-300 line-clamp-2">
          {content.title}
        </h3>
        {content.author && (
          <p className="text-stone-500 text-sm mb-2">by {content.author}</p>
        )}
        <p className="text-stone-400 text-sm line-clamp-2">{content.description}</p>
      </div>
      <div className="flex-shrink-0 self-center">
        <div className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center group-hover:border-amber-700 group-hover:bg-amber-700 transition-all duration-300">
          <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-white transition-colors duration-300" />
        </div>
      </div>
    </Link>
  );
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { featured, recent } = loaderData;

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
              to="/admin"
              className="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors duration-300"
            >
              Admin
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-stone-900 text-white">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-900/30 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
          </div>
          
          <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32 lg:py-40">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div>
                <div className="inline-flex items-center gap-3 mb-8">
                  <span className="w-12 h-px bg-amber-500" />
                  <span className="text-xs font-medium tracking-[0.3em] uppercase text-amber-400">
                    Digital Archive
                  </span>
                </div>
                
                <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl leading-[1.1] mb-8 tracking-tight">
                  Where Stories
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200">
                    Come Alive
                  </span>
                </h1>
                
                <p className="text-lg md:text-xl text-stone-400 leading-relaxed mb-10 max-w-lg">
                  Curated collection of books, magazines, and newspapers. 
                  Preview any title before you download.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Link
                    to="/library"
                    className="group inline-flex items-center gap-3 px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white font-medium transition-all duration-300"
                  >
                    <span>Explore Collection</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                  <Link
                    to="/library/books"
                    className="inline-flex items-center gap-3 px-8 py-4 border border-stone-700 hover:border-stone-500 text-stone-300 hover:text-white font-medium transition-all duration-300"
                  >
                    Browse Books
                  </Link>
                </div>
              </div>
              
              <div className="hidden lg:block relative">
                <div className="absolute -inset-10 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full blur-3xl" />
                <div className="relative grid grid-cols-3 gap-4">
                  {featured.slice(0, 3).map((item, i) => (
                    <Link
                      key={item.id}
                      to={`/content/${item.id}`}
                      className={cn(
                        'relative overflow-hidden shadow-2xl shadow-black/50 hover:scale-105 transition-transform duration-500',
                        i === 1 && '-mt-8',
                        i === 2 && 'mt-4'
                      )}
                      style={{ animationDelay: `${i * 150}ms` }}
                    >
                      <div className="aspect-[3/4]">
                        <img
                          src={item.coverUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-32 border-b border-stone-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <span className="text-xs font-medium tracking-[0.3em] uppercase text-amber-700 mb-3 block">
                  Categories
                </span>
                <h2 className="font-serif text-3xl md:text-4xl text-stone-900">
                  Browse by Type
                </h2>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { type: 'books', label: 'Books', count: '500+', desc: 'Educational & entertainment titles' },
                { type: 'magazines', label: 'Magazines', count: '200+', desc: 'Latest publications & archives' },
                { type: 'newspapers', label: 'Newspapers', count: '100+', desc: 'Daily news & analysis' },
              ].map((cat, i) => (
                <Link
                  key={cat.type}
                  to={`/library/${cat.type}`}
                  className="group relative p-8 md:p-10 bg-white border border-stone-200 hover:border-amber-700/50 transition-all duration-500 overflow-hidden"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-600 to-amber-400 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                  
                  <span className="font-serif text-6xl md:text-7xl text-stone-100 absolute -top-4 -right-2 group-hover:text-amber-100 transition-colors duration-500">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  
                  <div className="relative">
                    <h3 className="font-serif text-2xl md:text-3xl text-stone-900 mb-2 group-hover:text-amber-800 transition-colors duration-300">
                      {cat.label}
                    </h3>
                    <p className="text-stone-500 mb-6">{cat.desc}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium tracking-widest uppercase text-stone-400">
                        {cat.count} titles
                      </span>
                      <div className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center group-hover:border-amber-700 group-hover:bg-amber-700 transition-all duration-300">
                        <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-white transition-colors duration-300" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {featured.length > 0 && (
          <section className="py-20 md:py-32 bg-stone-100">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                  <span className="text-xs font-medium tracking-[0.3em] uppercase text-amber-700 mb-3 block">
                    Curated Selection
                  </span>
                  <h2 className="font-serif text-3xl md:text-4xl text-stone-900">
                    Featured This Week
                  </h2>
                </div>
                <Link
                  to="/library"
                  className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-amber-700 transition-colors duration-300"
                >
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                {featured.map((item, i) => (
                  <FeaturedCard key={item.id} content={item} index={i} />
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-5 gap-12 lg:gap-20">
              <div className="lg:col-span-2">
                <span className="text-xs font-medium tracking-[0.3em] uppercase text-amber-700 mb-3 block">
                  Latest Additions
                </span>
                <h2 className="font-serif text-3xl md:text-4xl text-stone-900 mb-6">
                  Recently Added
                </h2>
                <p className="text-stone-500 leading-relaxed mb-8">
                  Fresh content added to our collection. Discover new reads across all categories.
                </p>
                <Link
                  to="/library"
                  className="group inline-flex items-center gap-3 px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white font-medium transition-all duration-300"
                >
                  <span>View Library</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </div>
              
              <div className="lg:col-span-3">
                {recent.map((item, i) => (
                  <RecentItem key={item.id} content={item} index={i} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="relative py-24 md:py-32 bg-stone-900 text-white overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-transparent to-transparent" />
          </div>
          
          <div className="relative max-w-4xl mx-auto px-6 text-center">
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-6">
              Start Your Reading
              <br />
              <span className="text-amber-400">Journey Today</span>
            </h2>
            <p className="text-lg text-stone-400 mb-10 max-w-2xl mx-auto">
              Access our entire collection of books, magazines, and newspapers. Preview any title before you download.
            </p>
            <Link
              to="/library"
              className="group inline-flex items-center gap-3 px-10 py-5 bg-amber-600 hover:bg-amber-500 text-white font-medium text-lg transition-all duration-300"
            >
              <span>Explore the Collection</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-stone-900 text-white py-16 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <Link to="/" className="inline-block mb-6">
                <span className="font-serif text-3xl text-white tracking-tight">
                  AI<span className="text-amber-500">Books</span>
                </span>
              </Link>
              <p className="text-stone-400 leading-relaxed max-w-md">
                Your curated digital library. Discover, preview, and download quality content across books, magazines, and newspapers.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-white mb-4">Browse</h4>
              <ul className="space-y-3">
                {['Library', 'Books', 'Magazines', 'Newspapers'].map((item) => (
                  <li key={item}>
                    <Link
                      to={item === 'Library' ? '/library' : `/library/${item.toLowerCase()}`}
                      className="text-stone-400 hover:text-amber-400 transition-colors duration-300"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-white mb-4">Admin</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/admin" className="text-stone-400 hover:text-amber-400 transition-colors duration-300">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/admin/upload" className="text-stone-400 hover:text-amber-400 transition-colors duration-300">
                    Upload Content
                  </Link>
                </li>
                <li>
                  <Link to="/admin/manage" className="text-stone-400 hover:text-amber-400 transition-colors duration-300">
                    Manage Library
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-stone-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-stone-500 text-sm">
              &copy; {new Date().getFullYear()} AI Books. All rights reserved.
            </p>
            <p className="text-stone-600 text-sm">
              Crafted with care for book lovers
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
