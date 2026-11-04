import en from './en.json';
// Dutch UI strings (informal "je"). Missing keys fall back to English.
import nl from './nl.json';

export const languages = { en: 'English', nl: 'Nederlands' } as const;
export type Lang = keyof typeof languages;
export const defaultLang: Lang = 'en';

/** BCP 47 tags used for <html lang>, hreflang and date formatting. */
export const localeTags: Record<Lang, string> = { en: 'en', nl: 'nl-NL' };

export type UIKey = keyof typeof en;

const dictionaries: Record<Lang, Partial<Record<UIKey, string>>> = { en, nl };

export function isLang(value: string | undefined): value is Lang {
  return value !== undefined && value in languages;
}

/** Reads the language from the first URL segment ("/nl/contact/" → "nl"). */
export function getLangFromUrl(url: URL): Lang {
  const [, first] = url.pathname.split('/');
  return isLang(first) ? first : defaultLang;
}

/** Returns a translator for one language: t('nav.about'), t('home.heroAlt', { n: 2 }). */
export function useTranslations(lang: Lang) {
  return function t(key: UIKey, vars?: Record<string, string | number>): string {
    let text = dictionaries[lang][key] ?? en[key];
    if (vars) {
      for (const [name, value] of Object.entries(vars)) text = text.replaceAll(`{${name}}`, String(value));
    }
    return text;
  };
}

/** Removes a language prefix: "/nl/contact/" → "/contact/". */
export function stripLang(pathname: string): string {
  const [, first, ...rest] = pathname.split('/');
  if (!isLang(first) || first === defaultLang) return pathname || '/';
  return `/${rest.join('/')}`;
}

/**
 * Builds a localised internal link with a trailing slash.
 * localizePath('/contact', 'nl') → "/nl/contact/", localizePath('/jesus#receive-salvation', 'en') → "/jesus/#receive-salvation"
 */
export function localizePath(path: string, lang: Lang): string {
  const [rawPath = '/', hash] = path.split('#');
  let clean = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
  if (!clean.endsWith('/')) clean += '/';
  const prefixed = lang === defaultLang ? clean : `/${lang}${clean === '/' ? '/' : clean}`;
  return hash ? `${prefixed}#${hash}` : prefixed;
}

/** "10th July 2026" in English, "10 juli 2026" in Dutch. */
export function formatLongDate(date: Date, lang: Lang): string {
  if (lang === 'en') {
    const day = date.getUTCDate();
    const suffix = day % 10 === 1 && day !== 11 ? 'st' : day % 10 === 2 && day !== 12 ? 'nd' : day % 10 === 3 && day !== 13 ? 'rd' : 'th';
    const monthYear = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);
    return `${day}${suffix} ${monthYear}`;
  }
  return new Intl.DateTimeFormat(localeTags[lang], { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);
}

/** "Friday 11 December 2026" style date for meeting listings. */
export function formatWeekdayDate(date: Date, lang: Lang): string {
  return new Intl.DateTimeFormat(localeTags[lang], {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
