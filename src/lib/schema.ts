import type { getSettings } from './content';

type Settings = Awaited<ReturnType<typeof getSettings>>;

/** schema.org Church + Organization description built from the settings collection. */
export function churchJsonLd(settings: Settings, site: URL, description: string, logoUrl: string) {
  const url = site.href;
  return {
    '@context': 'https://schema.org',
    '@type': ['Church', 'Organization'],
    '@id': `${url}#church`,
    name: settings.siteName,
    alternateName: 'TGC Netherlands',
    url,
    description,
    logo: new URL(logoUrl, site).href,
    image: new URL('/og-image.jpg', site).href,
    email: settings.email,
    telephone: settings.phone,
    address: { '@type': 'PostalAddress', addressCountry: 'NL' },
    contactPoint: [
      { '@type': 'ContactPoint', contactType: 'customer support', email: settings.email, telephone: settings.phone, availableLanguage: ['en', 'nl'] },
      { '@type': 'ContactPoint', contactType: 'Faithline', telephone: settings.faithline },
    ],
    // The social accounts in settings are Prophet Jerome Fernando's official pages, so they belong to the ministry.
    parentOrganization: {
      '@type': 'Organization',
      name: 'Prophet Jerome Fernando Ministries',
      url: settings.ministryUrl,
      sameAs: Object.values(settings.social).filter(Boolean),
    },
  };
}
