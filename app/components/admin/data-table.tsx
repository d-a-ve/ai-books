import { Link } from 'react-router';
import { Edit, Trash2, Eye, MoreVertical } from 'lucide-react';
import { cn, formatDate, getContentTypeLabel, getContentTypeColor } from '~/lib/utils';
import type { ContentItem } from '~/lib/api/types';

interface DataTableProps {
  items: ContentItem[];
  onDelete?: (id: string) => void;
}

export function DataTable({ items, onDelete }: DataTableProps) {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center">
        <p className="text-zinc-500">No content found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-100">
              <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Content
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={item.coverUrl}
                      alt={item.title}
                      className="w-12 h-16 object-cover rounded-lg bg-zinc-100"
                    />
                    <div>
                      <p className="font-medium text-zinc-900">{item.title}</p>
                      <p className="text-sm text-zinc-500 line-clamp-1">
                        {item.author || item.publisher}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={cn(
                      'inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border',
                      getContentTypeColor(item.type)
                    )}
                  >
                    {getContentTypeLabel(item.type)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-zinc-500">
                  {formatDate(item.createdAt)}
                </td>
                <td className="px-6 py-4">
                  {item.featured ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-green-500/10 text-green-600 border border-green-500/20">
                      Featured
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-100 text-zinc-600">
                      Active
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      to={`/content/${item.id}`}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 transition-colors"
                      title="View"
                    >
                      <Eye className="w-4 h-4 text-zinc-500" />
                    </Link>
                    <Link
                      to={`/admin/edit/${item.id}`}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4 text-zinc-500" />
                    </Link>
                    <form
                      action={`/admin/delete/${item.id}`}
                      method="post"
                      onSubmit={(e) => {
                        if (!confirm('Are you sure you want to delete this item?')) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <button
                        type="submit"
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
