import { useState } from 'react';
import { Link, redirect, data } from 'react-router';
import { ArrowLeft, Save } from 'lucide-react';
import type { Route } from './+types/admin.edit.$id';
import { contentService } from '~/lib/api/content.server';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { Select } from '~/components/ui/select';
import { FileUpload } from '~/components/content/file-upload';
import type { ContentType } from '~/lib/api/types';

export function meta({ data }: Route.MetaArgs) {
  return [
    { title: data?.content ? `Edit ${data.content.title} - AI Books Admin` : 'Edit - AI Books Admin' },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const content = await contentService.getById(params.id);
  
  if (!content) {
    throw redirect('/admin/manage');
  }

  return { content };
}

export async function action({ params, request }: Route.ActionArgs) {
  const formData = await request.formData();
  
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const type = formData.get('type') as ContentType;
  const author = formData.get('author') as string;
  const publisher = formData.get('publisher') as string;
  const pageCount = formData.get('pageCount') as string;
  const coverUrl = formData.get('coverUrl') as string;
  const fileUrl = formData.get('fileUrl') as string;
  const featured = formData.get('featured') === 'on';
  const tags = (formData.get('tags') as string)?.split(',').map(t => t.trim()).filter(Boolean) || [];

  if (!title || !description || !type) {
    return data({ error: 'Title, description, and type are required' }, { status: 400 });
  }

  await contentService.update(params.id, {
    title,
    description,
    type,
    author: author || undefined,
    publisher: publisher || undefined,
    pageCount: pageCount ? parseInt(pageCount, 10) : undefined,
    coverUrl: coverUrl || undefined,
    fileUrl: fileUrl || undefined,
    featured,
    tags,
  });

  return redirect('/admin/manage');
}

const contentTypes = [
  { value: 'book', label: 'Book' },
  { value: 'magazine', label: 'Magazine' },
  { value: 'newspaper', label: 'Newspaper' },
];

export default function AdminEdit({ loaderData, actionData }: Route.ComponentProps) {
  const { content } = loaderData;
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [contentFile, setContentFile] = useState<File | null>(null);
  const error = actionData?.error;

  return (
    <div className="p-8 max-w-4xl">
      <Link
        to="/admin/manage"
        className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Manage
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Edit Content</h1>
        <p className="text-zinc-500">Update the details for "{content.title}"</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <form method="post" className="space-y-8">
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <h2 className="font-semibold text-zinc-900 mb-6">Basic Information</h2>
          <div className="grid gap-6">
            <Input
              name="title"
              label="Title"
              placeholder="Enter the title"
              defaultValue={content.title}
              required
            />
            <Textarea
              name="description"
              label="Description"
              placeholder="Write a brief description..."
              defaultValue={content.description}
              rows={4}
              required
            />
            <div className="grid md:grid-cols-2 gap-6">
              <Select
                name="type"
                label="Content Type"
                options={contentTypes}
                defaultValue={content.type}
                required
              />
              <Input
                name="pageCount"
                label="Page Count"
                type="number"
                placeholder="e.g., 250"
                defaultValue={content.pageCount?.toString() || ''}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Input
                name="author"
                label="Author"
                placeholder="Author name (for books)"
                defaultValue={content.author || ''}
              />
              <Input
                name="publisher"
                label="Publisher"
                placeholder="Publisher name"
                defaultValue={content.publisher || ''}
              />
            </div>
            <Input
              name="tags"
              label="Tags"
              placeholder="technology, programming, design (comma separated)"
              defaultValue={content.tags?.join(', ') || ''}
            />
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="featured"
                id="featured"
                defaultChecked={content.featured}
                className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500"
              />
              <label htmlFor="featured" className="text-sm font-medium text-zinc-700">
                Feature this content on the homepage
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <h2 className="font-semibold text-zinc-900 mb-6">Files</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <FileUpload
                label="Cover Image"
                accept="image/*"
                type="image"
                onChange={setCoverFile}
                value={coverFile}
                preview={content.coverUrl}
              />
              <input type="hidden" name="coverUrl" value={coverFile ? URL.createObjectURL(coverFile) : content.coverUrl} />
            </div>
            <div>
              <FileUpload
                label="Content File (PDF)"
                accept=".pdf,.epub"
                type="file"
                onChange={setContentFile}
                value={contentFile}
              />
              <input type="hidden" name="fileUrl" value={contentFile ? `/uploads/${contentFile.name}` : content.fileUrl} />
            </div>
          </div>
          <p className="text-sm text-zinc-400 mt-4">
            Note: File upload is mocked. In production, files would be uploaded to external storage.
          </p>
        </div>

        <div className="flex justify-end gap-4">
          <Link to="/admin/manage">
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Link>
          <Button type="submit">
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
