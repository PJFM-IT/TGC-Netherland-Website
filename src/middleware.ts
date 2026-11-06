import { defineMiddleware } from 'astro:middleware';
import { hasSession } from './lib/auth';

/** Every /admin page except the login page needs a valid admin session. */
export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/');
  const isLogin = pathname.replace(/\/$/, '') === '/admin/login';

  if (isAdmin && !context.isPrerendered && !isLogin && !hasSession(context.cookies)) {
    return context.redirect('/admin/login/');
  }

  const response = await next();
  if (isAdmin) {
    // Admin pages are never cached and never indexed.
    response.headers.set('Cache-Control', 'no-store');
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }
  return response;
});
