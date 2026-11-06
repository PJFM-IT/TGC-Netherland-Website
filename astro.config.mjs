// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import node from '@astrojs/node';

const site = 'https://gloriouschurch.nl';

// Pages that are rendered on each visit (they show what the admin saved). The sitemap only lists
// pre-built pages by itself, so these are added explicitly.
const livePages = ['/meetings/', '/community-life/', '/community-life/all/'].flatMap((path) => [
  `${site}${path}`,
  `${site}/nl${path}`,
]);

// https://astro.build/config
export default defineConfig({
  site,
  // Most pages are pre-built HTML. Meetings, Community Life and /admin opt out with `prerender = false`.
  output: 'static',
  // Vercel (preview) when built on Vercel; a plain Node.js server everywhere else (local, main server).
  adapter: process.env.VERCEL ? vercel() : node({ mode: 'standalone' }),
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'nl'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [
    sitemap({
      customPages: livePages,
      filter: (page) => !page.includes('/admin'),
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', nl: 'nl-NL' },
      },
    }),
  ],
  // Poppins is downloaded at build time and served from this site (no request to Google at runtime).
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Poppins',
      cssVariable: '--font-poppins',
      weights: [300, 400, 500, 600, 700],
      styles: ['normal', 'italic'],
      subsets: ['latin'],
      fallbacks: ['system-ui', 'Segoe UI', 'Helvetica', 'Arial', 'sans-serif'],
    },
  ],
});
