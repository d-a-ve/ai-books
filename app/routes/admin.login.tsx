import { redirect, data } from 'react-router';
import { Book, Lock } from 'lucide-react';
import type { Route } from './+types/admin.login';
import { validatePassword, createSessionCookie, isAuthenticated } from '~/lib/auth.server';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Admin Login - AI Books' },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  if (isAuthenticated(request)) {
    throw redirect('/admin');
  }
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const password = formData.get('password') as string;

  if (!password || !validatePassword(password)) {
    return data({ error: 'Invalid password' }, { status: 401 });
  }

  const sessionCookie = createSessionCookie();
  
  return redirect('/admin', {
    headers: {
      'Set-Cookie': sessionCookie,
    },
  });
}

export default function AdminLogin({ actionData }: Route.ComponentProps) {
  const error = actionData?.error;

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-zinc-900 rounded-2xl mb-4">
            <Book className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">Admin Login</h1>
          <p className="text-zinc-500 mt-2">Enter your password to access the admin panel</p>
        </div>

        <form method="post" className="bg-white rounded-2xl border border-zinc-200 p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="mb-6">
            <Input
              type="password"
              name="password"
              label="Password"
              placeholder="Enter admin password"
              autoFocus
              required
            />
          </div>

          <Button type="submit" size="lg" className="w-full">
            <Lock className="w-4 h-4" />
            Login
          </Button>
        </form>

        <p className="text-center text-sm text-zinc-400 mt-6">
          Default password: <code className="bg-zinc-100 px-2 py-0.5 rounded">admin123</code>
        </p>
      </div>
    </div>
  );
}
