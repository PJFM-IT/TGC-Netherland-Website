import type { InfoSection } from '../components/pages/InfoPage.astro';
import type { UIKey } from '../i18n/utils';

/**
 * Structure of the simple text pages. The words themselves live in src/i18n/{en,nl}.json;
 * the English route (src/pages/x.astro) and Dutch route (src/pages/nl/x.astro) both use these.
 */
export interface InfoPageConfig {
  titleKey: UIKey;
  subtitleKey: UIKey;
  introKey: UIKey;
  sections?: InfoSection[];
}

export const infoPages = {
  jesus: {
    titleKey: 'page.jesus.title',
    subtitleKey: 'page.jesus.subtitle',
    introKey: 'page.jesus.intro',
    sections: [
      { id: 'who-is-jesus', titleKey: 'page.jesus.who', textKeys: ['page.jesus.who.text1', 'page.jesus.who.text2'] },
      {
        id: 'receive-salvation',
        titleKey: 'page.jesus.salvation',
        textKeys: ['page.jesus.salvation.text1', 'page.jesus.salvation.text2', 'page.jesus.salvation.text3'],
        link: { href: '/contact', labelKey: 'page.jesus.salvation.link' },
      },
    ],
  },
  about: {
    titleKey: 'page.about.title',
    subtitleKey: 'page.about.subtitle',
    introKey: 'page.about.intro',
    sections: [{ textKeys: ['page.about.text1', 'page.about.text2'], link: { href: '/meetings', labelKey: 'page.about.link' } }],
  },
  'what-we-believe': {
    titleKey: 'page.believe.title',
    subtitleKey: 'page.believe.subtitle',
    introKey: 'page.believe.intro',
    sections: (['bible', 'god', 'jesus', 'spirit', 'salvation', 'church'] as const).map((topic) => ({
      id: topic,
      titleKey: `page.believe.${topic}.title` as UIKey,
      textKeys: [`page.believe.${topic}.text` as UIKey],
    })),
  },
  'prophet-jerome': {
    titleKey: 'page.prophet.title',
    subtitleKey: 'page.prophet.subtitle',
    introKey: 'page.prophet.intro',
    sections: [
      {
        textKeys: ['page.prophet.text1', 'page.prophet.text2'],
        link: { href: 'settings:ministryUrl', labelKey: 'page.prophet.link' },
      },
    ],
  },
  faq: {
    titleKey: 'page.faq.title',
    subtitleKey: 'page.faq.subtitle',
    introKey: 'page.faq.intro',
    sections: [
      ...([1, 2, 3, 4, 5] as const).map((n) => ({
        id: `q${n}`,
        titleKey: `page.faq.q${n}` as UIKey,
        textKeys: [`page.faq.a${n}` as UIKey],
      })),
      { textKeys: [], link: { href: '/contact', labelKey: 'page.faq.link' } },
    ],
  },
  testimonies: {
    titleKey: 'page.testimonies.title',
    subtitleKey: 'page.testimonies.subtitle',
    introKey: 'page.testimonies.intro',
    sections: [
      {
        textKeys: ['page.testimonies.text1', 'page.testimonies.text2'],
        link: { href: '/contact', labelKey: 'page.testimonies.link' },
      },
    ],
  },
  serve: {
    titleKey: 'page.serve.title',
    subtitleKey: 'page.serve.subtitle',
    introKey: 'page.serve.intro',
    sections: [{ textKeys: ['page.serve.text1', 'page.serve.text2'], link: { href: '/contact', labelKey: 'page.serve.link' } }],
  },
  'find-a-church': {
    titleKey: 'page.find.title',
    subtitleKey: 'page.find.subtitle',
    introKey: 'page.find.intro',
    sections: [
      { id: 'local', titleKey: 'page.find.local', textKeys: ['page.find.local.text'], link: { href: '/contact', labelKey: 'page.find.local.link' } },
      {
        id: 'global',
        titleKey: 'page.find.global',
        textKeys: ['page.find.global.text'],
        link: { href: 'settings:globalChurchUrl', labelKey: 'page.find.global.link' },
      },
      { id: 'online', titleKey: 'page.find.online', textKeys: ['page.find.online.text'], link: { href: '/meetings', labelKey: 'page.find.online.link' } },
    ],
  },
} satisfies Record<string, InfoPageConfig>;
