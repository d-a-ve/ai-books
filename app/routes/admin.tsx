import { Outlet, redirect } from 'react-router';
import type { Route } from './+types/admin';
import { isAuthenticated } from '~/lib/auth.server';
import { AdminNav } from '~/components/admin/admin-nav';
import { Toaster } from 'sonner';

export async function loader({ request }: Route.LoaderArgs) {
  if (!isAuthenticated(request)) {
    throw redirect('/admin/login');
  }
  return null;
}

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-zinc-100">
      <AdminNav />
      <main className="ml-64 min-h-screen">
        <Outlet />
      </main>
      <Toaster position="top-right" richColors />
    </div>
  );
}
