import { Link, Outlet, useLocation } from 'react-router';
import type { Route } from './+types/library';
import { SearchBar } from '~/components/content/search-bar';
import { FilterTabs } from '~/components/content/filter-tabs';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Library - AI Books' },
    { name: 'description', content: 'Browse our collection of books, magazines, and newspapers' },
  ];
}

const navItems = ['Library', 'Books', 'Magazines', 'Newspapers'];

export default function LibraryLayout() {
  const location = useLocation();

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
              {navItems.map((item) => {
                const path = item === 'Library' ? '/library' : `/library/${item.toLowerCase()}`;
                const isActive = location.pathname === path || 
                  (item === 'Library' && location.pathname === '/library');
                
                return (
                  <Link
                    key={item}
                    to={path}
                    className={`relative text-sm font-medium tracking-wide py-2 group transition-colors duration-300 ${
                      isActive ? 'text-stone-900' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {item}
                    <span className={`absolute bottom-0 left-0 h-px bg-amber-700 transition-all duration-300 ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`} />
                  </Link>
                );
              })}
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

      <div className="relative max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <span className="text-xs font-medium tracking-[0.3em] uppercase text-amber-700 mb-3 block">
            Browse Collection
          </span>
          <h1 className="font-serif text-4xl md:text-5xl text-stone-900 mb-4">Library</h1>
          <p className="text-stone-500 text-lg max-w-2xl">
            Discover our curated collection of books, magazines, and newspapers
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-12 pb-12 border-b border-stone-200">
          <SearchBar className="flex-1 max-w-lg" />
          <FilterTabs />
        </div>

        <Outlet />
      </div>

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
