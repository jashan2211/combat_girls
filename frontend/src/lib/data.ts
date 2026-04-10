/**
 * Central video & athlete data for Combat Girls.
 * Single source of truth — all pages import from here.
 * When backend is connected, replace these with API calls.
 */

// ============================================================================
// VIDEOS — from youtube.com/@combat_girls
// ============================================================================

export interface VideoItem {
  id: string; // YouTube video ID
  title: string;
  description: string;
  duration: number; // seconds
  views: number;
  sport: string;
  category: 'fight' | 'highlight' | 'training' | 'behind-scenes' | 'interview' | 'shorts';
  format: 'horizontal' | 'vertical' | 'shorts';
  fighters?: { name: string; slug: string; image?: string }[];
  createdAt: string;
  thumbnail: string;
}

function yt(id: string) {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

export const VIDEOS: VideoItem[] = [
  // --- Most Popular ---
  {
    id: 'lPQCizd2meU',
    title: 'Andrea Lee Inverted Triangle Choke Submission | Best Of Female Jiu Jitsu',
    description: 'Andrea Lee showcases an incredible inverted triangle choke submission. One of the best female jiu jitsu submissions ever caught on camera.',
    duration: 312, views: 154000, sport: 'BJJ', category: 'highlight', format: 'horizontal',
    fighters: [{ name: 'Andrea Lee', slug: 'andrea-lee' }],
    createdAt: '2026-02-10T12:00:00Z', thumbnail: yt('lPQCizd2meU'),
  },
  {
    id: '63p0NRkbT5U',
    title: 'Female MMA Fighter VS A Robber',
    description: 'What happens when a robber picks the wrong target? This female MMA fighter shows exactly why you should never underestimate a trained fighter.',
    duration: 480, views: 127000, sport: 'MMA', category: 'highlight', format: 'horizontal',
    createdAt: '2025-10-10T12:00:00Z', thumbnail: yt('63p0NRkbT5U'),
  },
  {
    id: 'Ljt_wonnsyA',
    title: 'WOMEN\'S BEACH GRAPPLING MATCH | Beach Jiu Jitsu',
    description: 'Women\'s beach grappling match showcasing amazing jiu jitsu technique on the sand.',
    duration: 420, views: 94000, sport: 'BJJ', category: 'fight', format: 'horizontal',
    createdAt: '2026-03-10T12:00:00Z', thumbnail: yt('Ljt_wonnsyA'),
  },
  {
    id: '9vk_y0cXUlk',
    title: 'CRAIG JONES vs A GIRL (Teshya Alo) | BJJ Sparring Session',
    description: 'Craig Jones takes on Teshya Alo in this incredible BJJ sparring session. Watch how technique can overcome size.',
    duration: 540, views: 78000, sport: 'BJJ', category: 'training', format: 'horizontal',
    fighters: [{ name: 'Teshya Alo', slug: 'teshya-alo' }, { name: 'Craig Jones', slug: 'craig-jones' }],
    createdAt: '2025-12-15T12:00:00Z', thumbnail: yt('9vk_y0cXUlk'),
  },
  {
    id: '7ZyVxOi7CUo',
    title: 'Ayane Jasinski PINS Noah Jung | Girl vs Boy Wrestling - 113 lbs',
    description: 'Ayane Jasinski shows incredible wrestling skills as she pins Noah Jung in this girl vs boy wrestling match at 113 lbs.',
    duration: 275, views: 72000, sport: 'Wrestling', category: 'fight', format: 'horizontal',
    fighters: [{ name: 'Ayane Jasinski', slug: 'ayane-jasinski' }, { name: 'Noah Jung', slug: 'noah-jung' }],
    createdAt: '2025-11-20T12:00:00Z', thumbnail: yt('7ZyVxOi7CUo'),
  },
  {
    id: '4vAYlTUUqOY',
    title: 'Jiu Jitsu Sparring With Mary Barron | WMMA',
    description: 'Mary Barron shows her incredible jiu jitsu skills in this sparring session.',
    duration: 600, views: 65000, sport: 'BJJ', category: 'training', format: 'horizontal',
    fighters: [{ name: 'Mary Barron', slug: 'mary-barron' }],
    createdAt: '2025-09-05T12:00:00Z', thumbnail: yt('4vAYlTUUqOY'),
  },
  // --- Latest ---
  {
    id: 'pZm4Wg5qFT0',
    title: 'MOUNTED ARM TRIANGLE CHOKE | Female Jiu Jitsu Match',
    description: 'Watch this incredible mounted arm triangle choke finish from a female jiu jitsu match.',
    duration: 83, views: 627, sport: 'BJJ', category: 'fight', format: 'horizontal',
    createdAt: '2026-04-09T14:30:00Z', thumbnail: yt('pZm4Wg5qFT0'),
  },
  {
    id: 'JJL_wGBME48',
    title: '51 KG GIRL VS 78 KG BOY JIU JITSU | Blue Belt Vs White Belt',
    description: 'Can a 51 kg blue belt girl beat a 78 kg white belt boy in jiu jitsu? Watch to find out!',
    duration: 300, views: 2400, sport: 'BJJ', category: 'fight', format: 'horizontal',
    createdAt: '2026-04-09T09:00:00Z', thumbnail: yt('JJL_wGBME48'),
  },
  {
    id: 'EbS-fzLprBU',
    title: 'Tactical BJJ Match! Megan O\'Neal vs. Charlize Balser | JWI Special Rules',
    description: 'An incredibly tactical BJJ match between Megan O\'Neal and Charlize Balser under JWI special rules.',
    duration: 357, views: 16000, sport: 'BJJ', category: 'fight', format: 'horizontal',
    fighters: [{ name: 'Megan O\'Neal', slug: 'megan-oneal' }, { name: 'Charlize Balser', slug: 'charlize-balser' }],
    createdAt: '2026-04-02T16:00:00Z', thumbnail: yt('EbS-fzLprBU'),
  },
  {
    id: 'g5wZd8KADKY',
    title: 'EPIC ENDING! Megan O\'Neal vs. Charlize Balser | JWI 5 Special Rules',
    description: 'What an epic ending! Megan O\'Neal vs. Charlize Balser at JWI 5.',
    duration: 354, views: 11000, sport: 'BJJ', category: 'fight', format: 'horizontal',
    fighters: [{ name: 'Megan O\'Neal', slug: 'megan-oneal' }, { name: 'Charlize Balser', slug: 'charlize-balser' }],
    createdAt: '2026-04-01T20:00:00Z', thumbnail: yt('g5wZd8KADKY'),
  },
  {
    id: 'otsBRV53TvQ',
    title: 'Yurivia Jimenez vs Veronica Vargas | Best Women\'s MMA Fights',
    description: 'One of the best women\'s MMA fights! Yurivia Jimenez takes on Veronica Vargas.',
    duration: 720, views: 89200, sport: 'MMA', category: 'fight', format: 'horizontal',
    fighters: [{ name: 'Yurivia Jimenez', slug: 'yurivia-jimenez' }, { name: 'Veronica Vargas', slug: 'veronica-vargas' }],
    createdAt: '2026-03-28T02:00:00Z', thumbnail: yt('otsBRV53TvQ'),
  },
];

// Shorts — from youtube.com/@combat_girls/shorts
export const SHORTS: VideoItem[] = [
  { id: '--TM7wCQFqQ', title: 'Jiu Jitsu In a Dress!', description: 'Jiu Jitsu In a Dress! #grappling #bjj #combatgirls', duration: 45, views: 42300, sport: 'BJJ', category: 'shorts', format: 'shorts', createdAt: '2026-04-05T08:00:00Z', thumbnail: '' },
  { id: '7p0WwzlsFwM', title: '2 vs 2 Women\'s MMA', description: '2 vs 2 Women\'s MMA #martialarts #mma #viralshorts', duration: 30, views: 31500, sport: 'MMA', category: 'shorts', format: 'shorts', createdAt: '2026-04-03T12:00:00Z', thumbnail: '' },
  { id: 'lwJNZPFTy1Q', title: 'Reverse Triangle Choke Armbar', description: 'Reverse Triangle Choke Armbar #bjj #jiujitsu', duration: 35, views: 67800, sport: 'BJJ', category: 'shorts', format: 'shorts', createdAt: '2026-03-30T10:00:00Z', thumbnail: '' },
  { id: 'w_GcUJj5u78', title: 'JIU JITSU GIRL SUBMITS A MAN', description: 'JIU JITSU GIRL SUBMITS A MAN #bjj #combatsport #jiujitsu', duration: 40, views: 28900, sport: 'BJJ', category: 'shorts', format: 'shorts', createdAt: '2026-03-25T14:00:00Z', thumbnail: '' },
  { id: 'QdlpCMcO3Xo', title: 'SLICK ARMBAR', description: 'SLICK ARMBAR #bjj #jiujitsu #grappling', duration: 25, views: 54200, sport: 'BJJ', category: 'shorts', format: 'shorts', createdAt: '2026-03-20T16:00:00Z', thumbnail: '' },
  { id: 'ejLhewvzQww', title: 'JIU JITSU GANG WARS', description: 'JIU JITSU GANG WARS #bjj #jiujitsu #martialarts', duration: 50, views: 38700, sport: 'MMA', category: 'shorts', format: 'shorts', createdAt: '2026-03-15T09:00:00Z', thumbnail: '' },
  { id: 'mOH29aDO4CM', title: 'Leg Cradle! Makynlee Cova', description: 'Leg Cradle! Makynlee Cova Wrestling #CombatGirls', duration: 28, views: 22100, sport: 'Wrestling', category: 'shorts', format: 'shorts', createdAt: '2026-03-10T11:00:00Z', thumbnail: '' },
  { id: 'KVB4L9gZ3CI', title: 'LEG CRADLE! Kaylee Thompson', description: 'LEG CRADLE! Kaylee Thompson #wrestling #legcradle', duration: 32, views: 19400, sport: 'Wrestling', category: 'shorts', format: 'shorts', createdAt: '2026-03-05T08:00:00Z', thumbnail: '' },
];

// Video lookup map for watch page
export const VIDEOS_MAP: Record<string, VideoItem> = {};
for (const v of [...VIDEOS, ...SHORTS]) {
  VIDEOS_MAP[v.id] = v;
}

// ============================================================================
// ATHLETES — Featured athletes with real photos
// ============================================================================

export interface AthleteItem {
  name: string;
  slug: string;
  image: string;
  discipline: string;
  followers: number;
  verified: boolean;
  nickname?: string;
  record?: { wins: number; losses: number; draws: number; ko: number; sub: number };
  weightClass?: string;
  gym?: string;
  location?: string;
}

export const FEATURED_ATHLETES: AthleteItem[] = [
  { name: 'Amanda Nunes', slug: 'amanda-nunes', image: '/fighters/amanda-nunes.png', discipline: 'MMA', followers: 2100000, verified: true, nickname: 'The Lioness', record: { wins: 23, losses: 5, draws: 0, ko: 13, sub: 4 }, weightClass: 'Bantamweight (135)', gym: 'American Top Team', location: 'Coconut Creek, FL' },
  { name: 'Valentina Shevchenko', slug: 'valentina-shevchenko', image: '/fighters/valentina-shevchenko.png', discipline: 'MMA', followers: 1500000, verified: true, nickname: 'Bullet', record: { wins: 24, losses: 4, draws: 0, ko: 8, sub: 7 }, weightClass: 'Flyweight (125)', gym: 'Tiger Muay Thai', location: 'Las Vegas, NV' },
  { name: 'Zhang Weili', slug: 'zhang-weili', image: '/fighters/zhang-weili.png', discipline: 'MMA', followers: 980000, verified: true, record: { wins: 25, losses: 3, draws: 0, ko: 10, sub: 8 }, weightClass: 'Strawweight (115)' },
  { name: 'Rose Namajunas', slug: 'rose-namajunas', image: '/fighters/rose-namajunas.png', discipline: 'MMA', followers: 1200000, verified: true, nickname: 'Thug', record: { wins: 12, losses: 6, draws: 0, ko: 3, sub: 5 }, weightClass: 'Strawweight (115)' },
  { name: 'Alexa Grasso', slug: 'alexa-grasso', image: '/fighters/alexa-grasso.png', discipline: 'MMA', followers: 890000, verified: true, record: { wins: 16, losses: 3, draws: 1, ko: 3, sub: 3 }, weightClass: 'Flyweight (125)' },
  { name: 'Holly Holm', slug: 'holly-holm', image: '/fighters/holly-holm.png', discipline: 'Boxing', followers: 1100000, verified: true, nickname: 'The Preacher\'s Daughter', record: { wins: 15, losses: 7, draws: 0, ko: 3, sub: 0 }, weightClass: 'Bantamweight (135)' },
  { name: 'Kayla Harrison', slug: 'kayla-harrison', image: '/fighters/kayla-harrison.png', discipline: 'Judo', followers: 750000, verified: true, record: { wins: 17, losses: 1, draws: 0, ko: 2, sub: 8 }, weightClass: 'Lightweight (155)' },
  { name: 'Mackenzie Dern', slug: 'mackenzie-dern', image: '/fighters/mackenzie-dern.png', discipline: 'BJJ', followers: 650000, verified: true, record: { wins: 14, losses: 5, draws: 0, ko: 0, sub: 8 }, weightClass: 'Strawweight (115)' },
  { name: 'Ronda Rousey', slug: 'ronda-rousey', image: '/fighters/ronda-rousey.png', discipline: 'Judo', followers: 3200000, verified: true, nickname: 'Rowdy', record: { wins: 12, losses: 2, draws: 0, ko: 0, sub: 9 }, weightClass: 'Bantamweight (135)' },
  { name: 'Joanna Jedrzejczyk', slug: 'joanna-jedrzejczyk', image: '/fighters/joanna-jedrzejczyk.png', discipline: 'Muay Thai', followers: 920000, verified: true, nickname: 'Joanna Champion', record: { wins: 16, losses: 5, draws: 0, ko: 7, sub: 1 }, weightClass: 'Strawweight (115)' },
  { name: 'Jessica Andrade', slug: 'jessica-andrade', image: '/fighters/jessica-andrade.png', discipline: 'MMA', followers: 780000, verified: true, nickname: 'Bate Estaca', record: { wins: 24, losses: 11, draws: 0, ko: 10, sub: 2 }, weightClass: 'Flyweight (125)' },
];
