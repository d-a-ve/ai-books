import { Link, useSearchParams } from 'react-router';
import { Plus, Search } from 'lucide-react';
import type { Route } from './+types/admin.manage';
import { contentService } from '~/lib/api/content.server';
import { DataTable } from '~/components/admin/data-table';
import { Button } from '~/components/ui/button';
import type { ContentType } from '~/lib/api/types';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Manage Content - AI Books Admin' },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const search = url.searchParams.get('q') || undefined;
  const type = url.searchParams.get('type') as ContentType | undefined;

  const content = await contentService.getAll({
    search,
    type: type || undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  return { content, search, type };
}

const filterOptions = [
  { value: '', label: 'All Types' },
  { value: 'book', label: 'Books' },
  { value: 'magazine', label: 'Magazines' },
  { value: 'newspaper', label: 'Newspapers' },
];

export default function AdminManage({ loaderData }: Route.ComponentProps) {
  const { content, search, type } = loaderData;
  const [searchParams, setSearchParams] = useSearchParams();

  function handleSearch(value: string) {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('q', value);
    } else {
      params.delete('q');
    }
    setSearchParams(params);
  }

  function handleTypeFilter(value: string) {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('type', value);
    } else {
      params.delete('type');
    }
    setSearchParams(params);
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Manage Content</h1>
          <p className="text-zinc-500">View and manage all library content</p>
        </div>
        <Link to="/admin/upload">
          <Button>
            <Plus className="w-4 h-4" />
            Upload New
          </Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            value={search || ''}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search content..."
            className="w-full pl-12 pr-4 py-2.5 rounded-lg border border-zinc-200 bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition-all"
          />
        </div>
        <select
          value={type || ''}
          onChange={(e) => handleTypeFilter(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition-all"
        >
          {filterOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <DataTable items={content} />

      <div className="mt-6 text-sm text-zinc-500">
        Showing {content.length} items
      </div>
    </div>
  );
}
