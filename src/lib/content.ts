import { getCollection, getEntry } from 'astro:content';
import type { Lang } from '../i18n/utils';

/** Site-wide settings (email, phone, social links...) from src/content/settings/site.json. */
export async function getSettings() {
  const entry = await getEntry('settings', 'site');
  if (!entry) throw new Error('Missing src/content/settings/site.json');
  return entry.data;
}

const forLang = (lang: Lang) => (entry: { data: { lang: string } }) => entry.data.lang === lang || entry.data.lang === 'all';

/** Highlights for a language, newest first. On Dutch pages the optional `nl` title/speaker replace the English ones. */
export async function getHighlights(lang: Lang) {
  const all = await getCollection('highlights', forLang(lang));
  return all
    .map((entry) => {
      const nl = lang === 'nl' ? entry.data.nl : undefined;
      if (!nl) return entry;
      return { ...entry, data: { ...entry.data, title: nl.title ?? entry.data.title, speaker: nl.speaker ?? entry.data.speaker } };
    })
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** Meetings for a language, soonest first. */
export async function getMeetings(lang: Lang) {
  const all = await getCollection('meetings', forLang(lang));
  return all.sort((a, b) => a.data.date.getTime() - b.data.date.getTime());
}

export async function getPastors() {
  const all = await getCollection('pastors');
  return all.sort((a, b) => a.data.order - b.data.order);
}
