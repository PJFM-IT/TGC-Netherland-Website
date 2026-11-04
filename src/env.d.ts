interface ImportMetaEnv {
  /** Formspree form ID. When empty, the contact form falls back to a mailto: link. */
  readonly PUBLIC_FORMSPREE_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** lite-youtube-embed ships no types; it only registers the <lite-youtube> custom element. */
declare module 'lite-youtube-embed';
