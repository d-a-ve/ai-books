import { useSearchParams } from 'react-router';
import { Search, X } from 'lucide-react';
import { cn } from '~/lib/utils';

interface SearchBarProps {
  className?: string;
  placeholder?: string;
}

export function SearchBar({ className, placeholder = 'Search the collection...' }: SearchBarProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentSearch = searchParams.get('q') || '';

  function handleSearch(value: string) {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('q', value);
    } else {
      params.delete('q');
    }
    setSearchParams(params);
  }

  function clearSearch() {
    const params = new URLSearchParams(searchParams);
    params.delete('q');
    setSearchParams(params);
  }

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
      <input
        type="text"
        value={currentSearch}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full pl-12 pr-10 py-3.5 border border-stone-200 bg-white text-stone-900 placeholder-stone-400',
          'focus:outline-none focus:border-amber-700/50 focus:ring-2 focus:ring-amber-700/10',
          'transition-all duration-300'
        )}
      />
      {currentSearch && (
        <button
          onClick={clearSearch}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 hover:text-stone-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
