import type { APIRoute } from 'astro';
import { readLocalUpload } from '../../lib/store';

/**
 * Serves images uploaded in /admin when they are stored on disk (local dev and the church's own
 * server). On Vercel, uploads live in Vercel Blob and have their own public URLs instead.
 */
export const prerender = false;

const types: Record<string, string> = { webp: 'image/webp', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png' };

export const GET: APIRoute = async ({ params }) => {
  const name = params.file ?? '';
  const type = types[name.split('.').pop()?.toLowerCase() ?? ''];
  const data = type ? await readLocalUpload(name) : null;
  if (!data) return new Response('Not found', { status: 404 });
  return new Response(new Uint8Array(data), {
    headers: {
      'Content-Type': type!,
      // File names are unique per upload, so they can be cached for a long time.
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  });
};
