import { redirect } from 'react-router';
import type { Route } from './+types/admin.logout';
import { clearSessionCookie } from '~/lib/auth.server';

export async function action({}: Route.ActionArgs) {
  return redirect('/admin/login', {
    headers: {
      'Set-Cookie': clearSessionCookie(),
    },
  });
}

export async function loader() {
  return redirect('/admin/login');
}
