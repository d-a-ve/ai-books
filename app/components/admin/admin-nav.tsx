import { Link, useLocation } from 'react-router';
import { LayoutDashboard, Upload, Library, LogOut, BookOpen, ExternalLink } from 'lucide-react';
import { cn } from '~/lib/utils';

const navItems = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Upload', path: '/admin/upload', icon: Upload },
  { label: 'Manage', path: '/admin/manage', icon: Library },
];

export function AdminNav() {
  const location = useLocation();

  return (
    <aside className="w-64 h-screen fixed top-0 left-0 bg-zinc-900 text-white flex flex-col">
      <div className="p-6 border-b border-zinc-800">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-zinc-900" />
          </div>
          <div>
            <span className="font-semibold text-lg">AI Books</span>
            <span className="block text-xs text-zinc-400">Admin Panel</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.path === '/admin'
                ? location.pathname === '/admin'
                : location.pathname.startsWith(item.path);
            const Icon = item.icon;

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200',
                    isActive
                      ? 'bg-white text-zinc-900'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-zinc-800 space-y-1">
        <Link
          to="/"
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg font-medium text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all duration-200"
        >
          <ExternalLink className="w-5 h-5" />
          View Site
        </Link>
        <form action="/admin/logout" method="post">
          <button
            type="submit"
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg font-medium text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </form>
      </div>
    </aside>
  );
}
