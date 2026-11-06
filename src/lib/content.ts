import { getCollection, getEntry } from 'astro:content';
import type { Lang } from '../i18n/utils';
import { dutchTimezone, listMeetings, listVideos, type StoredImage } from './admin-data';

/** Site-wide settings (email, phone, social links...) from src/content/settings/site.json. */
export async function getSettings() {
  const entry = await getEntry('settings', 'site');
  if (!entry) throw new Error('Missing src/content/settings/site.json');
  return entry.data;
}

/** A Community Life video as the pages use it (one language). */
export interface HighlightView {
  id: string;
  data: { title: string; speaker: string; date: Date; youtubeId: string; thumbnail: StoredImage };
}

/** A meeting as the Meetings page uses it (one language). */
export interface MeetingView {
  id: string;
  data: {
    title: string;
    date: Date;
    time: string;
    timezone: 'CET' | 'CEST';
    zoomLink: string;
    meetingId?: string;
    description: string;
    flyer?: StoredImage;
  };
}

/** Videos from the admin, newest first. Dutch pages use the Dutch title/speaker when filled in. */
export async function getHighlights(lang: Lang): Promise<HighlightView[]> {
  const videos = await listVideos();
  return videos.map((v) => ({
    id: v.id,
    data: {
      title: (lang === 'nl' && v.titleNl) || v.title,
      speaker: (lang === 'nl' && v.speakerNl) || v.speaker,
      date: new Date(`${v.date}T00:00:00Z`),
      youtubeId: v.youtubeId,
      thumbnail: v.photo,
    },
  }));
}

/** Today's date in the Netherlands as YYYY-MM-DD. */
const todayInNL = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Amsterdam' }).format(new Date());

/** Upcoming meetings from the admin (today and later), soonest first. The time zone follows from the date. */
export async function getMeetings(lang: Lang): Promise<MeetingView[]> {
  const today = todayInNL();
  const meetings = (await listMeetings()).filter((m) => m.date >= today);
  return meetings.map((m) => ({
    id: m.id,
    data: {
      title: lang === 'nl' ? m.titleNl : m.titleEn,
      date: new Date(`${m.date}T00:00:00Z`),
      time: m.time,
      timezone: dutchTimezone(m.date),
      zoomLink: m.zoomLink,
      meetingId: m.meetingId,
      description: (lang === 'nl' ? m.descriptionNl : m.descriptionEn) ?? '',
      flyer: m.poster,
    },
  }));
}

export async function getPastors() {
  const all = await getCollection('pastors');
  return all.sort((a, b) => a.data.order - b.data.order);
}
