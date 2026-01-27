import { Link } from 'react-router';
import { Book, BookMarked, Newspaper, Upload, TrendingUp, Plus } from 'lucide-react';
import type { Route } from './+types/admin._index';
import { contentService } from '~/lib/api/content.server';
import { StatCard } from '~/components/admin/stat-card';
import { Button } from '~/components/ui/button';
import { formatDate } from '~/lib/utils';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Dashboard - AI Books Admin' },
  ];
}

export async function loader({}: Route.LoaderArgs) {
  const [stats, recent] = await Promise.all([
    contentService.getStats(),
    contentService.getRecent(5),
  ]);
  return { stats, recent };
}

export default function AdminDashboard({ loaderData }: Route.ComponentProps) {
  const { stats, recent } = loaderData;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
          <p className="text-zinc-500">Overview of your digital library</p>
        </div>
        <Link to="/admin/upload">
          <Button>
            <Plus className="w-4 h-4" />
            Upload Content
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="Total Items"
          value={stats.total}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          label="Books"
          value={stats.books}
          icon={Book}
          color="blue"
        />
        <StatCard
          label="Magazines"
          value={stats.magazines}
          icon={BookMarked}
          color="purple"
        />
        <StatCard
          label="Newspapers"
          value={stats.newspapers}
          icon={Newspaper}
          color="amber"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-zinc-900">Recent Uploads</h2>
            <Link
              to="/admin/manage"
              className="text-sm font-medium text-zinc-500 hover:text-zinc-900"
            >
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {recent.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-zinc-50 transition-colors"
              >
                <img
                  src={item.coverUrl}
                  alt={item.title}
                  className="w-12 h-16 object-cover rounded-lg bg-zinc-100"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-zinc-900 truncate">{item.title}</p>
                  <p className="text-sm text-zinc-500">
                    {item.type} • {formatDate(item.createdAt)}
                  </p>
                </div>
                <Link
                  to={`/admin/edit/${item.id}`}
                  className="text-sm font-medium text-zinc-500 hover:text-zinc-900"
                >
                  Edit
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <h2 className="font-semibold text-zinc-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/admin/upload"
              className="flex flex-col items-center justify-center p-6 rounded-xl border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-all"
            >
              <Upload className="w-8 h-8 text-zinc-400 mb-2" />
              <span className="font-medium text-zinc-900">Upload New</span>
            </Link>
            <Link
              to="/admin/manage"
              className="flex flex-col items-center justify-center p-6 rounded-xl border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-all"
            >
              <Book className="w-8 h-8 text-zinc-400 mb-2" />
              <span className="font-medium text-zinc-900">Manage Library</span>
            </Link>
            <Link
              to="/library"
              className="flex flex-col items-center justify-center p-6 rounded-xl border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-all"
            >
              <BookMarked className="w-8 h-8 text-zinc-400 mb-2" />
              <span className="font-medium text-zinc-900">View Library</span>
            </Link>
            <Link
              to="/"
              className="flex flex-col items-center justify-center p-6 rounded-xl border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-all"
            >
              <Newspaper className="w-8 h-8 text-zinc-400 mb-2" />
              <span className="font-medium text-zinc-900">View Site</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
