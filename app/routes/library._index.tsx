import type { Route } from './+types/library._index';
import { contentService } from '~/lib/api/content.server';
import { ContentGrid } from '~/components/content/content-grid';

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const search = url.searchParams.get('q') || undefined;
  
  const content = await contentService.getAll({
    search,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  
  return { content, search };
}

export default function LibraryIndex({ loaderData }: Route.ComponentProps) {
  const { content, search } = loaderData;

  return (
    <ContentGrid 
      items={content} 
      emptyMessage={
        search 
          ? `No results found for "${search}"` 
          : 'No content available'
      } 
    />
  );
}
