import { redirect } from 'react-router';
import type { Route } from './+types/library.$type';
import { contentService } from '~/lib/api/content.server';
import { ContentGrid } from '~/components/content/content-grid';
import type { ContentType } from '~/lib/api/types';

const validTypes = ['books', 'magazines', 'newspapers'];

const typeMap: Record<string, ContentType> = {
  books: 'book',
  magazines: 'magazine',
  newspapers: 'newspaper',
};

const typeLabels: Record<string, string> = {
  books: 'Books',
  magazines: 'Magazines',
  newspapers: 'Newspapers',
};

export function meta({ params }: Route.MetaArgs) {
  const label = typeLabels[params.type] || 'Library';
  return [
    { title: `${label} - AI Books` },
    { name: 'description', content: `Browse our collection of ${label.toLowerCase()}` },
  ];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const { type } = params;
  
  if (!validTypes.includes(type)) {
    throw redirect('/library');
  }

  const url = new URL(request.url);
  const search = url.searchParams.get('q') || undefined;
  const contentType = typeMap[type];

  const content = await contentService.getByType(contentType, {
    search,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  return { content, type, search };
}

export default function LibraryByType({ loaderData }: Route.ComponentProps) {
  const { content, type, search } = loaderData;
  const label = typeLabels[type] || type;

  return (
    <ContentGrid 
      items={content} 
      emptyMessage={
        search 
          ? `No ${label.toLowerCase()} found for "${search}"` 
          : `No ${label.toLowerCase()} available`
      } 
    />
  );
}
