import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://combatgirls.tv';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/shorts`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/explore`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/events`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/login`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/register`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // TODO: Dynamically add athlete profile URLs and video URLs
  // by fetching from the database when the backend is connected.
  // Example:
  // const athletes = await fetch(`${API_URL}/users/athletes?limit=1000`);
  // const athletePages = athletes.map(a => ({
  //   url: `${SITE_URL}/profile/${a.slug || a._id}`,
  //   lastModified: a.updatedAt,
  //   changeFrequency: 'weekly',
  //   priority: 0.7,
  // }));

  return staticPages;
}
