import { redirect } from 'react-router';
import type { Route } from './+types/admin.delete.$id';
import { contentService } from '~/lib/api/content.server';

export async function action({ params }: Route.ActionArgs) {
  try {
    await contentService.delete(params.id);
  } catch (error) {
    console.error('Failed to delete content:', error);
  }
  
  return redirect('/admin/manage');
}

export async function loader() {
  return redirect('/admin/manage');
}
