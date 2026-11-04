# TGC Netherlands – Glorious Church Nederland

Static website for **Glorious Church Nederland** (https://gloriouschurch.nl), built with Astro 7.
Plain CSS, TypeScript client scripts, no UI framework. English is the default language; Dutch lives under `/nl/`.

## Requirements

- Node.js **22.12 or newer**
- npm

## Run it

```bash
npm install
npm run dev       # dev server on http://localhost:4321
npm run build     # static site in dist/
npm run preview   # serve dist/ locally
npm run check     # TypeScript + Astro diagnostics
```

## Project layout

```
src/
  components/         Reusable pieces (Header, Footer, SEO, carousels, cards, ContactForm…)
    pages/            One view per page, shared by the English and Dutch routes
  content/            Editable content (JSON, one file per entry)
    highlights/  meetings/  pastors/  settings/
  content.config.ts   Zod schemas for the content above
  i18n/               en.json, nl.json and helpers (t(), getLangFromUrl(), localizePath())
  layouts/            BaseLayout.astro (head, SEO, header, footer)
  pages/              Routes. pages/nl/ mirrors pages/ and renders the same views with lang="nl"
  scripts/            Client TypeScript: carousels.ts (Swiper), menu.ts, contact-form.ts, videos.ts
  styles/global.css   Design tokens (CSS custom properties) and shared styles
  assets/images/      Local images, optimised to WebP at build time
public/               robots.txt, favicon.png, apple-touch-icon.png, og-image.jpg, _headers
```

## Editing content

All content is plain JSON in `src/content/`. Each entry is its own file, so a headless CMS
(Decap, Sanity, …) can be connected later without restructuring. The build fails with a clear
message if a field is missing or invalid.

### Add a Community Life highlight

1. Put the thumbnail in `src/assets/images/`. Use a **portrait** photo (about 5:8, e.g. 720×1152): it fills the phone mockup on the Community Life page. Keep faces in the middle third, since the top of the card carries the title.
2. Create `src/content/highlights/<any-name>.json`:

```json
{
  "title": "The Power of Faith",
  "speaker": "Prophet Jerome Fernando",
  "date": "2026-07-10",
  "youtubeId": "dQw4w9WgXcQ",
  "thumbnail": "../../assets/images/my-thumbnail.jpg",
  "lang": "all"
}
```

- `youtubeId` is the 11 characters after `watch?v=` in the YouTube URL.
- `lang`: `"all"` (both languages), `"en"` or `"nl"`.
- Highlights are shown newest first. The carousel opens on the middle one, so 5 or more highlights keep two cards on each side of the phone. The video only loads from YouTube when someone clicks play.

### Add a meeting

Create `src/content/meetings/<any-name>.json`. Meetings are language-specific, so add one file for
English and one for Dutch:

```json
{
  "title": "Monthly ZOOM Meet Up – February",
  "date": "2027-02-12",
  "time": "19:30",
  "timezone": "CET",
  "zoomLink": "https://zoom.us/j/1234567890",
  "meetingId": "123 456 7890",
  "description": "Short description (used when there is no poster).",
  "flyer": "../../assets/images/flyer-february.png",
  "lang": "en"
}
```

`timezone` is `CET` (winter) or `CEST` (summer, last Sunday of March to last Sunday of October).
- `flyer` (optional): the meeting poster, saved in `src/assets/images/`. Portrait posters around 4:5 work best, ideally 1000px wide or more. Clicking the poster opens the Zoom link. Meetings without a flyer show a text card with a "Join on ZOOM" button.
- `meetingId` (optional) and the date/time are read out to screen readers in place of the poster, so keep them in sync with what the poster says.

Meetings are listed soonest first. Delete old meeting files when they have passed.

### Pastors

`src/content/pastors/*.json`: `name`, `role`, `photo` (path to an image in `src/assets/images/`)
and `order` (lower numbers are shown first).

### Site settings

`src/content/settings/site.json` holds the email, phone, Faithline number, the map `address` shown on the Contact page, social links,
`globalChurchUrl` and `ministryUrl`. These feed the Contact page, footer and structured data (JSON-LD).

### Contact page photo

The pastors photo on the Contact page is `src/assets/images/pastors-nl.png` (a cut-out on white works best, at least 900px wide). Its alt text is built from the names in `src/content/pastors/`.

### Text pages (Jesus, About, What We Believe, FAQ, …)

The words are in `src/i18n/en.json` / `nl.json` under `page.*` keys. Which sections and buttons a page has is set in `src/lib/info-pages.ts` (one place for both languages). To add an FAQ question, add `page.faq.q6` / `page.faq.a6` to both JSON files and change `[1, 2, 3, 4, 5]` to `[1, 2, 3, 4, 5, 6]` there.

### Text and translations

All interface text (navigation, headings, buttons, footer) is in `src/i18n/en.json` and
`src/i18n/nl.json`. The Dutch text uses informal **"je"**. Any key missing from `nl.json` falls back to English.

Content entries are translated in the entry itself:
- **Highlights** (`lang: "all"`): add an optional `"nl": { "title": "…", "speaker": "…" }` block; Dutch pages use it, English pages ignore it.
- **Meetings**: one file per language (`"lang": "en"` / `"lang": "nl"`).

### Images

Images in `src/assets/images/` are placeholders. Replace a file with one of the same name
(any size) and it is resized and converted to WebP at build time. Replace `public/og-image.jpg`
(1200×630) for social sharing previews and `public/favicon.png` (64×64) / `public/apple-touch-icon.png` (180×180) for the browser tab and phone home-screen icons. The site logo is `src/assets/images/logo-glorious-church.png` (square, at least 256×256, transparent outside the circle).

## Environment variables

Copy `.env.example` to `.env` for local use, and set the same variables in your hosting dashboard.

| Variable              | Required | Purpose |
| --------------------- | -------- | ------- |
| `PUBLIC_FORMSPREE_ID` | No       | Formspree form ID (the part after `https://formspree.io/f/`). Used by `src/components/ContactForm.astro` (not on any page right now; the Contact page design has no form). When set, the form posts to Formspree. When empty, submitting opens the visitor's email app addressed to the email in `site.json`. |

The value is baked in at build time, so redeploy after changing it.

## Deploy

The site is fully static (`dist/`).

**Netlify:** connect the repository. `netlify.toml` already sets the build command
(`npm run build`), the publish directory (`dist`) and Node 22. Add `PUBLIC_FORMSPREE_ID` under
*Site configuration → Environment variables* if you use Formspree.

**Cloudflare Pages:** connect the repository and use
- Build command: `npm run build`
- Build output directory: `dist`
- Environment variables: `NODE_VERSION=22.12.0` and optionally `PUBLIC_FORMSPREE_ID`

Both hosts read `public/_headers` (long-lived caching for hashed assets in `/_astro/`).
After the first deploy, submit `https://gloriouschurch.nl/sitemap-index.xml` in Google Search Console.

## Notes

- Fonts: Poppins is downloaded at build time by Astro's Fonts API and served from this site, so there are no runtime requests to Google.
- Carousels use Swiper (vanilla). Autoplay and 3D tilt are turned off for visitors who prefer reduced motion.
- SEO: every page gets a title, description, canonical URL, Open Graph/Twitter tags and `hreflang` alternates (en, nl-NL, x-default). The Home and Contact pages also include Church/Organization JSON-LD.
