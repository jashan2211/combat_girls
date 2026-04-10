import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://combatgirls.tv';

// Import athlete and video data for sitemap generation
const athleteSlugs = [
  'amanda-nunes', 'valentina-shevchenko', 'zhang-weili', 'rose-namajunas',
  'alexa-grasso', 'holly-holm', 'kayla-harrison', 'mackenzie-dern',
  'ronda-rousey', 'joanna-jedrzejczyk', 'jessica-andrade',
  'carla-esparza', 'jessica-eye', 'miesha-tate', 'cat-zingano',
  'julianna-pena', 'amanda-ribas', 'marina-rodriguez', 'yan-xiaonan',
  'tracy-cortez', 'maycee-barber', 'andrea-lee', 'rachael-ostovich',
  'manon-fiorot', 'erin-blanchfield', 'raquel-pennington', 'irene-aldana',
  'ketlen-vieira', 'norma-dumont', 'viviane-araujo', 'taila-santos',
  'germaine-de-randamie', 'claudia-gadelha',
];

const videoIds = [
  'lPQCizd2meU', '63p0NRkbT5U', 'Ljt_wonnsyA', '9vk_y0cXUlk',
  '7ZyVxOi7CUo', '4vAYlTUUqOY', 'pZm4Wg5qFT0', 'JJL_wGBME48',
  'EbS-fzLprBU', 'g5wZd8KADKY', 'otsBRV53TvQ',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'hourly', priority: 1.0 },
    { url: `${SITE_URL}/shorts`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${SITE_URL}/explore`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/rankings`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/predict`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/community`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/events`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/login`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/register`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
  ];

  // Athlete profile pages
  const athletePages: MetadataRoute.Sitemap = athleteSlugs.map((slug) => ({
    url: `${SITE_URL}/profile/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Video watch pages
  const videoPages: MetadataRoute.Sitemap = videoIds.map((id) => ({
    url: `${SITE_URL}/watch/${id}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...athletePages, ...videoPages];
}
