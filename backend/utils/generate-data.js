/**
 * Generate frontend data.ts from real UFC CSV data.
 * Reads CSV files and creates a TypeScript data file with real fighter info.
 * Run: node utils/generate-data.js
 */

const fs = require('fs');
const path = require('path');

const MMA_DIR = 'C:/Users/jasha/OneDrive/Documents/mma';
const SCRAPE_DIR = path.join(MMA_DIR, 'scrape');
const PHOTOS_DIR = path.join(MMA_DIR, 'uploads', 'fighters');
const OUTPUT = path.join(__dirname, '..', '..', 'frontend', 'src', 'lib', 'data.ts');

function parseCSV(filePath) {
  if (!fs.existsSync(filePath)) { console.log('File not found:', filePath); return []; }
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(l => l.trim());
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = []; let current = ''; let inQuotes = false;
    for (const char of line) {
      if (char === '"') inQuotes = !inQuotes;
      else if (char === ',' && !inQuotes) { values.push(current.trim()); current = ''; }
      else current += char;
    }
    values.push(current.trim());
    const obj = {};
    headers.forEach((h, i) => { obj[h] = values[i] || ''; });
    return obj;
  });
}

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Parse data
console.log('Parsing CSV files...');
const fightResults = parseCSV(path.join(SCRAPE_DIR, 'ufc_fight_results.csv'));
const fighterDetails = parseCSV(path.join(SCRAPE_DIR, 'ufc_fighter_details.csv'));
const fighterTott = parseCSV(path.join(SCRAPE_DIR, 'ufc_fighter_tott.csv'));

// Build female fighter set
const femaleFighters = new Set();
const fightRecords = {};

for (const fight of fightResults) {
  if (!fight.WEIGHTCLASS || !fight.WEIGHTCLASS.includes("Women's")) continue;
  const parts = (fight.BOUT || '').split(' vs. ');
  if (parts.length !== 2) continue;
  const [name1, name2] = parts.map(n => n.trim());
  femaleFighters.add(name1);
  femaleFighters.add(name2);
  const [o1, o2] = (fight.OUTCOME || '').split('/');
  const method = fight.METHOD || '';
  for (const [name, result] of [[name1, o1], [name2, o2]]) {
    if (!fightRecords[name]) fightRecords[name] = { wins: 0, losses: 0, draws: 0, ko: 0, sub: 0 };
    const r = fightRecords[name];
    if (result === 'W') { r.wins++; if (method.includes('KO/TKO')) r.ko++; if (method.includes('Submission')) r.sub++; }
    else if (result === 'L') r.losses++;
    else if (result === 'D') r.draws++;
  }
}

// Build detail maps
const detailsMap = {};
for (const f of fighterDetails) detailsMap[`${f.FIRST} ${f.LAST}`.trim()] = f;
const tottMap = {};
for (const f of fighterTott) tottMap[f.FIGHTER] = f;

// Copy photos and build athlete list
const PHOTOS_DEST = path.join(__dirname, '..', '..', 'frontend', 'public', 'fighters');
if (!fs.existsSync(PHOTOS_DEST)) fs.mkdirSync(PHOTOS_DEST, { recursive: true });

const athletes = [];
let photosCopied = 0;

// Sort by total fights (most active first)
const sorted = [...femaleFighters].sort((a, b) => {
  const ra = fightRecords[a] || { wins: 0, losses: 0 };
  const rb = fightRecords[b] || { wins: 0, losses: 0 };
  return (rb.wins + rb.losses) - (ra.wins + ra.losses);
});

for (const name of sorted) {
  const slug = slugify(name);
  const details = detailsMap[name] || {};
  const tott = tottMap[name] || {};
  const record = fightRecords[name] || { wins: 0, losses: 0, draws: 0, ko: 0, sub: 0 };

  // Check photo
  const photoSrc = path.join(PHOTOS_DIR, `${slug}.png`);
  let hasPhoto = false;
  if (fs.existsSync(photoSrc)) {
    const dest = path.join(PHOTOS_DEST, `${slug}.png`);
    if (!fs.existsSync(dest)) { fs.copyFileSync(photoSrc, dest); photosCopied++; }
    hasPhoto = true;
  }

  // Determine weight class from tott
  let weightClass = tott.WEIGHT || '';
  let discipline = 'MMA';

  athletes.push({
    name,
    slug,
    image: hasPhoto ? `/fighters/${slug}.png` : '',
    discipline,
    followers: Math.floor(Math.random() * 500000) + 10000, // placeholder
    verified: record.wins >= 5,
    nickname: details.NICKNAME || '',
    record,
    weightClass,
    height: tott.HEIGHT || '',
    reach: tott.REACH || '',
    stance: tott.STANCE || '',
    dateOfBirth: tott.DOB || '',
    gym: '',
    location: '',
  });
}

console.log(`Found ${athletes.length} female fighters, copied ${photosCopied} new photos`);

// Take top 50 most active for FEATURED_ATHLETES
const featured = athletes.slice(0, 50);

// Generate the TypeScript file
const output = `/**
 * AUTO-GENERATED from UFC CSV data.
 * Generated: ${new Date().toISOString()}
 * Total female fighters: ${athletes.length}
 * Run: cd backend && node utils/generate-data.js
 */

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  duration: number;
  views: number;
  sport: string;
  category: 'fight' | 'highlight' | 'training' | 'behind-scenes' | 'interview' | 'shorts';
  format: 'horizontal' | 'vertical' | 'shorts';
  fighters?: { name: string; slug: string; image?: string }[];
  createdAt: string;
  thumbnail: string;
}

function yt(id: string) {
  return \`https://img.youtube.com/vi/\${id}/hqdefault.jpg\`;
}

// Real videos from youtube.com/@combat_girls
export const VIDEOS: VideoItem[] = [
  { id: 'lPQCizd2meU', title: 'Andrea Lee Inverted Triangle Choke Submission | Best Of Female Jiu Jitsu', description: 'Andrea Lee showcases an incredible inverted triangle choke submission.', duration: 312, views: 154000, sport: 'BJJ', category: 'highlight', format: 'horizontal', fighters: [{ name: 'Andrea Lee', slug: 'andrea-lee', image: '/fighters/andrea-lee.png' }], createdAt: '2026-02-10T12:00:00Z', thumbnail: yt('lPQCizd2meU') },
  { id: '63p0NRkbT5U', title: 'Female MMA Fighter VS A Robber', description: 'What happens when a robber picks the wrong target?', duration: 480, views: 127000, sport: 'MMA', category: 'highlight', format: 'horizontal', createdAt: '2025-10-10T12:00:00Z', thumbnail: yt('63p0NRkbT5U') },
  { id: 'Ljt_wonnsyA', title: "WOMEN\\'S BEACH GRAPPLING MATCH | Beach Jiu Jitsu", description: "Women\\'s beach grappling match showcasing amazing jiu jitsu.", duration: 420, views: 94000, sport: 'BJJ', category: 'fight', format: 'horizontal', createdAt: '2026-03-10T12:00:00Z', thumbnail: yt('Ljt_wonnsyA') },
  { id: '9vk_y0cXUlk', title: 'CRAIG JONES vs A GIRL (Teshya Alo) | BJJ Sparring', description: 'Craig Jones takes on Teshya Alo in BJJ sparring.', duration: 540, views: 78000, sport: 'BJJ', category: 'training', format: 'horizontal', fighters: [{ name: 'Teshya Alo', slug: 'teshya-alo' }], createdAt: '2025-12-15T12:00:00Z', thumbnail: yt('9vk_y0cXUlk') },
  { id: '7ZyVxOi7CUo', title: 'Ayane Jasinski PINS Noah Jung | Girl vs Boy Wrestling', description: 'Ayane Jasinski shows incredible wrestling skills.', duration: 275, views: 72000, sport: 'Wrestling', category: 'fight', format: 'horizontal', fighters: [{ name: 'Ayane Jasinski', slug: 'ayane-jasinski' }], createdAt: '2025-11-20T12:00:00Z', thumbnail: yt('7ZyVxOi7CUo') },
  { id: '4vAYlTUUqOY', title: 'Jiu Jitsu Sparring With Mary Barron | WMMA', description: 'Mary Barron shows her jiu jitsu skills.', duration: 600, views: 65000, sport: 'BJJ', category: 'training', format: 'horizontal', fighters: [{ name: 'Mary Barron', slug: 'mary-barron' }], createdAt: '2025-09-05T12:00:00Z', thumbnail: yt('4vAYlTUUqOY') },
  { id: 'pZm4Wg5qFT0', title: 'MOUNTED ARM TRIANGLE CHOKE | Female Jiu Jitsu Match', description: 'Incredible mounted arm triangle choke finish.', duration: 83, views: 627, sport: 'BJJ', category: 'fight', format: 'horizontal', createdAt: '2026-04-09T14:30:00Z', thumbnail: yt('pZm4Wg5qFT0') },
  { id: 'JJL_wGBME48', title: '51 KG GIRL VS 78 KG BOY JIU JITSU | Blue Belt Vs White Belt', description: 'Can a 51 kg blue belt girl beat a 78 kg white belt boy?', duration: 300, views: 2400, sport: 'BJJ', category: 'fight', format: 'horizontal', createdAt: '2026-04-09T09:00:00Z', thumbnail: yt('JJL_wGBME48') },
  { id: 'EbS-fzLprBU', title: "Tactical BJJ Match! Megan O\\'Neal vs. Charlize Balser | JWI", description: "Tactical BJJ match under JWI special rules.", duration: 357, views: 16000, sport: 'BJJ', category: 'fight', format: 'horizontal', fighters: [{ name: "Megan O\\'Neal", slug: 'megan-oneal' }, { name: 'Charlize Balser', slug: 'charlize-balser' }], createdAt: '2026-04-02T16:00:00Z', thumbnail: yt('EbS-fzLprBU') },
  { id: 'g5wZd8KADKY', title: "EPIC ENDING! Megan O\\'Neal vs. Charlize Balser | JWI 5", description: "Epic ending at JWI 5.", duration: 354, views: 11000, sport: 'BJJ', category: 'fight', format: 'horizontal', fighters: [{ name: "Megan O\\'Neal", slug: 'megan-oneal' }, { name: 'Charlize Balser', slug: 'charlize-balser' }], createdAt: '2026-04-01T20:00:00Z', thumbnail: yt('g5wZd8KADKY') },
  { id: 'otsBRV53TvQ', title: "Yurivia Jimenez vs Veronica Vargas | Best Women\\'s MMA", description: "One of the best women\\'s MMA fights!", duration: 720, views: 89200, sport: 'MMA', category: 'fight', format: 'horizontal', fighters: [{ name: 'Yurivia Jimenez', slug: 'yurivia-jimenez' }, { name: 'Veronica Vargas', slug: 'veronica-vargas' }], createdAt: '2026-03-28T02:00:00Z', thumbnail: yt('otsBRV53TvQ') },
];

export const SHORTS: VideoItem[] = [
  { id: '--TM7wCQFqQ', title: 'Jiu Jitsu In a Dress!', description: '#grappling #bjj #combatgirls', duration: 45, views: 42300, sport: 'BJJ', category: 'shorts', format: 'shorts', createdAt: '2026-04-05T08:00:00Z', thumbnail: '' },
  { id: '7p0WwzlsFwM', title: "2 vs 2 Women\\'s MMA", description: '#martialarts #mma', duration: 30, views: 31500, sport: 'MMA', category: 'shorts', format: 'shorts', createdAt: '2026-04-03T12:00:00Z', thumbnail: '' },
  { id: 'lwJNZPFTy1Q', title: 'Reverse Triangle Choke Armbar', description: '#bjj #jiujitsu', duration: 35, views: 67800, sport: 'BJJ', category: 'shorts', format: 'shorts', createdAt: '2026-03-30T10:00:00Z', thumbnail: '' },
  { id: 'w_GcUJj5u78', title: 'JIU JITSU GIRL SUBMITS A MAN', description: '#bjj #combatsport', duration: 40, views: 28900, sport: 'BJJ', category: 'shorts', format: 'shorts', createdAt: '2026-03-25T14:00:00Z', thumbnail: '' },
  { id: 'QdlpCMcO3Xo', title: 'SLICK ARMBAR', description: '#bjj #jiujitsu #grappling', duration: 25, views: 54200, sport: 'BJJ', category: 'shorts', format: 'shorts', createdAt: '2026-03-20T16:00:00Z', thumbnail: '' },
  { id: 'ejLhewvzQww', title: 'JIU JITSU GANG WARS', description: '#bjj #jiujitsu #mma', duration: 50, views: 38700, sport: 'MMA', category: 'shorts', format: 'shorts', createdAt: '2026-03-15T09:00:00Z', thumbnail: '' },
  { id: 'mOH29aDO4CM', title: 'Leg Cradle! Makynlee Cova', description: '#CombatGirls #wrestling', duration: 28, views: 22100, sport: 'Wrestling', category: 'shorts', format: 'shorts', createdAt: '2026-03-10T11:00:00Z', thumbnail: '' },
  { id: 'KVB4L9gZ3CI', title: 'LEG CRADLE! Kaylee Thompson', description: '#wrestling #legcradle', duration: 32, views: 19400, sport: 'Wrestling', category: 'shorts', format: 'shorts', createdAt: '2026-03-05T08:00:00Z', thumbnail: '' },
];

export const VIDEOS_MAP: Record<string, VideoItem> = {};
for (const v of [...VIDEOS, ...SHORTS]) {
  VIDEOS_MAP[v.id] = v;
}

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
  height?: string;
  reach?: string;
  stance?: string;
  dateOfBirth?: string;
  gym?: string;
  location?: string;
}

// Real UFC female fighters (${featured.length} most active)
export const FEATURED_ATHLETES: AthleteItem[] = ${JSON.stringify(featured, null, 2)};

// All ${athletes.length} female fighters
export const ALL_ATHLETES: AthleteItem[] = ${JSON.stringify(athletes, null, 2)};
`;

fs.writeFileSync(OUTPUT, output, 'utf-8');
console.log('Generated', OUTPUT);
console.log('Featured athletes:', featured.length);
console.log('Total athletes:', athletes.length);
console.log('Photos copied:', photosCopied);
