export function WebsiteJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'COMBAT GIRLS',
    alternateName: 'Combat Girls TV',
    url: 'https://combatgirls.tv',
    description: 'The premier streaming platform for women\'s combat sports',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://combatgirls.tv/explore?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function OrganizationJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'COMBAT GIRLS',
    url: 'https://combatgirls.tv',
    logo: 'https://combatgirls.tv/logo.png',
    sameAs: [
      'https://www.youtube.com/@combat_girls',
      'https://www.instagram.com/combat_girls',
    ],
    description: 'Women\'s combat sports streaming platform featuring MMA, boxing, BJJ, Muay Thai and more.',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function AthleteJsonLd({
  name,
  nickname,
  image,
  sport,
  weightClass,
  gym,
  location,
  url,
}: {
  name: string;
  nickname?: string;
  image?: string;
  sport?: string;
  weightClass?: string;
  gym?: string;
  location?: string;
  url: string;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    alternateName: nickname || undefined,
    image: image || undefined,
    url,
    jobTitle: 'Professional Fighter',
    sport: sport || 'Combat Sports',
    memberOf: gym ? { '@type': 'SportsTeam', name: gym } : undefined,
    homeLocation: location ? { '@type': 'Place', name: location } : undefined,
    description: `${name}${nickname ? ` "${nickname}"` : ''} - Professional ${sport || 'combat sports'} athlete${weightClass ? `, ${weightClass}` : ''}`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function VideoJsonLd({
  title,
  description,
  thumbnailUrl,
  uploadDate,
  duration,
  embedUrl,
  url,
}: {
  title: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  duration?: string;
  embedUrl: string;
  url: string;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: title,
    description,
    thumbnailUrl,
    uploadDate,
    duration: duration || undefined,
    contentUrl: embedUrl,
    url,
    publisher: {
      '@type': 'Organization',
      name: 'COMBAT GIRLS',
      logo: { '@type': 'ImageObject', url: 'https://combatgirls.tv/logo.png' },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function SportsEventJsonLd({
  name,
  date,
  venue,
  location,
  description,
  url,
}: {
  name: string;
  date: string;
  venue: string;
  location: string;
  description: string;
  url: string;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name,
    startDate: date,
    location: {
      '@type': 'Place',
      name: venue,
      address: { '@type': 'PostalAddress', addressLocality: location },
    },
    description,
    url,
    organizer: { '@type': 'Organization', name: 'COMBAT GIRLS' },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
