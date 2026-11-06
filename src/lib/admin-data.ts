/**
 * Meetings and Community Life videos managed in /admin.
 *
 * Until the admin saves something for the first time, the entries come from the JSON files in
 * src/content/meetings and src/content/highlights (the starting content). The first save copies
 * them into the store; from then on the store is the only source.
 */
import { getCollection } from 'astro:content';
import sharp from 'sharp';
import { randomUUID } from 'node:crypto';
import { deleteFile, readJson, saveFile, writeJson } from './store';

export interface StoredImage {
  url: string;
  width: number;
  height: number;
}

export interface Meeting {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  /** HH:MM, Dutch time */
  time: string;
  zoomLink: string;
  meetingId?: string;
  titleEn: string;
  titleNl: string;
  descriptionEn?: string;
  descriptionNl?: string;
  poster?: StoredImage;
}

export interface Video {
  id: string;
  youtubeId: string;
  /** YYYY-MM-DD */
  date: string;
  title: string;
  titleNl?: string;
  speaker: string;
  speakerNl?: string;
  photo: StoredImage;
}

// ───────────────────────── helpers ─────────────────────────

/** Dutch time zone on a date: CEST from the last Sunday of March to the last Sunday of October. */
export function dutchTimezone(isoDate: string): 'CET' | 'CEST' {
  const date = new Date(`${isoDate}T12:00:00Z`);
  const year = date.getUTCFullYear();
  const lastSunday = (month: number) => {
    const d = new Date(Date.UTC(year, month + 1, 0));
    d.setUTCDate(d.getUTCDate() - d.getUTCDay());
    return d;
  };
  return date >= lastSunday(2) && date < lastSunday(9) ? 'CEST' : 'CET';
}

/** The 11-character video ID from any normal YouTube link (watch, youtu.be, shorts, live, embed). */
export function youtubeIdFrom(url: string): string | undefined {
  return url.match(/(?:youtu\.be\/|[?&]v=|\/(?:embed|shorts|live)\/)([\w-]{11})/)?.[1];
}

const imageFromAsset = (asset: ImageMetadata): StoredImage => ({ url: asset.src, width: asset.width, height: asset.height });

// ───────────────────────── starting content ─────────────────────────

async function seedMeetings(): Promise<Meeting[]> {
  const entries = await getCollection('meetings');
  const byDate = new Map<string, Meeting>();
  for (const { data } of entries) {
    const date = data.date.toISOString().slice(0, 10);
    const meeting = byDate.get(date) ?? {
      id: `seed-${date}`,
      date,
      time: data.time,
      zoomLink: data.zoomLink,
      meetingId: data.meetingId,
      titleEn: data.title,
      titleNl: data.title,
      poster: data.flyer ? imageFromAsset(data.flyer) : undefined,
    };
    if (data.lang === 'nl') {
      meeting.titleNl = data.title;
      meeting.descriptionNl = data.description;
    } else {
      meeting.titleEn = data.title;
      meeting.descriptionEn = data.description;
    }
    byDate.set(date, meeting);
  }
  return [...byDate.values()];
}

async function seedVideos(): Promise<Video[]> {
  const entries = await getCollection('highlights');
  return entries.map(({ id, data }) => ({
    id: `seed-${id}`,
    youtubeId: data.youtubeId,
    date: data.date.toISOString().slice(0, 10),
    title: data.title,
    titleNl: data.nl?.title,
    speaker: data.speaker,
    speakerNl: data.nl?.speaker,
    photo: imageFromAsset(data.thumbnail),
  }));
}

// ───────────────────────── read / write ─────────────────────────

export async function listMeetings(): Promise<Meeting[]> {
  const stored = await readJson<Meeting[]>('meetings');
  const all = stored ?? (await seedMeetings());
  return all.sort((a, b) => a.date.localeCompare(b.date));
}

export async function listVideos(): Promise<Video[]> {
  const stored = await readJson<Video[]>('videos');
  const all = stored ?? (await seedVideos());
  return all.sort((a, b) => b.date.localeCompare(a.date));
}

export async function saveMeeting(meeting: Meeting): Promise<void> {
  const all = await listMeetings();
  const index = all.findIndex((m) => m.id === meeting.id);
  if (index >= 0) all[index] = meeting;
  else all.push(meeting);
  await writeJson('meetings', all);
}

export async function deleteMeeting(id: string): Promise<void> {
  const all = await listMeetings();
  const meeting = all.find((m) => m.id === id);
  await writeJson('meetings', all.filter((m) => m.id !== id));
  await deleteFile(meeting?.poster?.url);
}

export async function saveVideo(video: Video): Promise<void> {
  const all = await listVideos();
  const index = all.findIndex((v) => v.id === video.id);
  if (index >= 0) all[index] = video;
  else all.push(video);
  await writeJson('videos', all);
}

export async function deleteVideo(id: string): Promise<void> {
  const all = await listVideos();
  const video = all.find((v) => v.id === id);
  await writeJson('videos', all.filter((v) => v.id !== id));
  await deleteFile(video?.photo.url);
}

export const newId = () => randomUUID();

// ───────────────────────── image uploads ─────────────────────────

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // Vercel functions accept request bodies up to 4.5 MB.
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Checks an uploaded image, resizes it (max width) and stores it as WebP.
 * Returns null if no file was chosen; throws a readable message if the file is not acceptable.
 */
export async function storeUploadedImage(file: FormDataEntryValue | null, maxWidth: number): Promise<StoredImage | null> {
  if (!(file instanceof File) || file.size === 0) return null;
  if (!ALLOWED_TYPES.includes(file.type)) throw new Error('Please choose a JPG, PNG or WebP image.');
  if (file.size > MAX_UPLOAD_BYTES) throw new Error('This image is too large (max 4 MB).');

  // sharp re-encodes the image, which also strips anything that is not a picture.
  const { data, info } = await sharp(Buffer.from(await file.arrayBuffer()))
    .rotate()
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });

  const url = await saveFile(`${newId()}.webp`, data, 'image/webp');
  return { url, width: info.width, height: info.height };
}

export { deleteFile as deleteStoredImage };
