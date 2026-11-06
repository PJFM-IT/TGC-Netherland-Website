/**
 * Where the admin's meetings, videos and uploaded images are kept.
 *
 * - On Vercel (BLOB_READ_WRITE_TOKEN is set): Vercel Blob, a *public* Blob store.
 * - Everywhere else (local dev, the church's own Node server): files in DATA_DIR (default ./data),
 *   with uploads served by src/pages/uploads/[...file].ts.
 *
 * Only this file knows the difference; everything else calls readJson / writeJson / saveFile / deleteFile.
 */
import { del, get, put } from '@vercel/blob';
import fs from 'node:fs/promises';
import path from 'node:path';

const useBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const dataDir = path.resolve(process.env.DATA_DIR || 'data');
const uploadsDir = path.join(dataDir, 'uploads');

/** Public URL prefix for uploads stored on disk. */
export const LOCAL_UPLOADS_PREFIX = '/uploads/';

/** Reads a JSON document, or returns null if it was never saved. */
export async function readJson<T>(name: string): Promise<T | null> {
  if (useBlob) {
    // useCache: false so a save is visible on the very next page load.
    const result = await get(`data/${name}.json`, { access: 'public', useCache: false });
    if (!result) return null;
    return JSON.parse(await new Response(result.stream).text()) as T;
  }
  try {
    return JSON.parse(await fs.readFile(path.join(dataDir, `${name}.json`), 'utf8')) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw error;
  }
}

/** Saves a JSON document, replacing the previous version. */
export async function writeJson(name: string, value: unknown): Promise<void> {
  const body = JSON.stringify(value, null, 2);
  if (useBlob) {
    await put(`data/${name}.json`, body, {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 60,
    });
    return;
  }
  await fs.mkdir(dataDir, { recursive: true });
  // Write to a temporary file first so a crash never leaves half a file behind.
  const file = path.join(dataDir, `${name}.json`);
  await fs.writeFile(`${file}.tmp`, body);
  await fs.rename(`${file}.tmp`, file);
}

/** Stores an uploaded file and returns its public URL. */
export async function saveFile(filename: string, data: Buffer, contentType: string): Promise<string> {
  if (useBlob) {
    const blob = await put(`uploads/${filename}`, data, { access: 'public', contentType, addRandomSuffix: true });
    return blob.url;
  }
  await fs.mkdir(uploadsDir, { recursive: true });
  await fs.writeFile(path.join(uploadsDir, filename), data);
  return `${LOCAL_UPLOADS_PREFIX}${filename}`;
}

/** Deletes a file previously returned by saveFile. Other URLs (built-in images) are left alone. */
export async function deleteFile(url: string | undefined): Promise<void> {
  if (!url) return;
  if (useBlob) {
    if (url.includes('.blob.vercel-storage.com/')) await del(url);
    return;
  }
  if (url.startsWith(LOCAL_UPLOADS_PREFIX)) {
    await fs.rm(path.join(uploadsDir, path.basename(url)), { force: true });
  }
}

/** Reads an uploaded file from disk (only used when not on Vercel). */
export async function readLocalUpload(filename: string): Promise<Buffer | null> {
  const safe = path.basename(filename); // never allow ../ to escape the uploads folder
  try {
    return await fs.readFile(path.join(uploadsDir, safe));
  } catch {
    return null;
  }
}
