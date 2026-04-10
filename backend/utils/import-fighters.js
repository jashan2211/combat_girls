/**
 * Import female UFC fighters from CSV data into Combat Girls.
 *
 * Data sources:
 *   - ufc_fighter_details.csv   (names, nicknames)
 *   - ufc_fighter_tott.csv      (height, weight, reach, stance, DOB)
 *   - ufc_fight_results.csv     (fight records by weight class)
 *   - uploads/fighters/*.png    (fighter photos)
 *
 * Run: node utils/import-fighters.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');

const MMA_DIR = 'C:/Users/jasha/OneDrive/Documents/mma';
const SCRAPE_DIR = path.join(MMA_DIR, 'scrape');
const PHOTOS_SRC = path.join(MMA_DIR, 'uploads', 'fighters');
const PHOTOS_DEST = path.join(__dirname, '..', '..', 'frontend', 'public', 'fighters');
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/combat_girls';

// Simple CSV parser
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(l => l.trim());
  const headers = lines[0].split(',').map(h => h.trim());

  return lines.slice(1).map(line => {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
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

async function importFighters() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // 1. Parse fight results to find all female fighter names
  console.log('\n--- Parsing fight results for female fighters ---');
  const fightResults = parseCSV(path.join(SCRAPE_DIR, 'ufc_fight_results.csv'));

  const femaleFighterNames = new Set();
  const fightRecords = {}; // name -> { wins, losses, draws, knockouts, submissions }

  for (const fight of fightResults) {
    if (!fight.WEIGHTCLASS || !fight.WEIGHTCLASS.includes("Women's")) continue;

    // Parse bout: "Fighter1 vs. Fighter2"
    const bout = fight.BOUT || '';
    const parts = bout.split(' vs. ');
    if (parts.length !== 2) continue;

    const [name1, name2] = parts.map(n => n.trim());
    femaleFighterNames.add(name1);
    femaleFighterNames.add(name2);

    // Track records
    const outcome = fight.OUTCOME || '';
    const method = fight.METHOD || '';
    const [o1, o2] = outcome.split('/');

    for (const [name, result] of [[name1, o1], [name2, o2]]) {
      if (!fightRecords[name]) {
        fightRecords[name] = { wins: 0, losses: 0, draws: 0, knockouts: 0, submissions: 0 };
      }
      const r = fightRecords[name];
      if (result === 'W') {
        r.wins++;
        if (method.includes('KO/TKO')) r.knockouts++;
        if (method.includes('Submission')) r.submissions++;
      } else if (result === 'L') {
        r.losses++;
      } else if (result === 'D') {
        r.draws++;
      }
    }
  }

  console.log(`Found ${femaleFighterNames.size} unique female fighters`);

  // 2. Parse fighter details for names/nicknames
  const fighterDetails = parseCSV(path.join(SCRAPE_DIR, 'ufc_fighter_details.csv'));
  const detailsMap = {};
  for (const f of fighterDetails) {
    const fullName = `${f.FIRST} ${f.LAST}`.trim();
    detailsMap[fullName] = f;
  }

  // 3. Parse fighter physical stats
  const fighterTott = parseCSV(path.join(SCRAPE_DIR, 'ufc_fighter_tott.csv'));
  const tottMap = {};
  for (const f of fighterTott) {
    tottMap[f.FIGHTER] = f;
  }

  // 4. Ensure photos dest exists
  if (!fs.existsSync(PHOTOS_DEST)) {
    fs.mkdirSync(PHOTOS_DEST, { recursive: true });
  }

  // 5. Import each female fighter
  let imported = 0;
  let skipped = 0;
  let photoCopied = 0;

  for (const name of femaleFighterNames) {
    const slug = slugify(name);

    // Check if already exists
    const existing = await User.findOne({
      $or: [
        { slug },
        { name },
        { email: `${slug}@unclaimed.combatgirls.tv` }
      ]
    });

    if (existing) {
      skipped++;
      continue;
    }

    const details = detailsMap[name] || {};
    const tott = tottMap[name] || {};
    const record = fightRecords[name] || { wins: 0, losses: 0, draws: 0, knockouts: 0, submissions: 0 };

    // Determine weight class from tott
    let weightClass = tott.WEIGHT || '';

    // Check for photo
    const photoFile = `${slug}.png`;
    const photoSrc = path.join(PHOTOS_SRC, photoFile);
    let imageUrl = '';

    if (fs.existsSync(photoSrc)) {
      // Copy photo
      const photoDest = path.join(PHOTOS_DEST, photoFile);
      fs.copyFileSync(photoSrc, photoDest);
      imageUrl = `/fighters/${photoFile}`;
      photoCopied++;
    }

    // Determine disciplines from weight class
    const disciplines = ['mma'];

    const fighter = await User.create({
      name,
      email: `${slug}@unclaimed.combatgirls.tv`,
      role: 'athlete',
      profileStatus: 'unclaimed',
      verified: false,
      bio: details.NICKNAME ? `"${details.NICKNAME}" - UFC Fighter` : 'UFC Fighter',
      nickname: details.NICKNAME || '',
      image: imageUrl,
      slug,
      fightRecord: record,
      weightClass,
      height: tott.HEIGHT || '',
      reach: tott.REACH || '',
      stance: tott.STANCE || '',
      dateOfBirth: tott.DOB || '',
      ufcStatsUrl: details.URL || tott.URL || '',
      discipline: disciplines,
      socialLinks: {
        instagram: '',
        twitter: '',
        youtube: '',
        tiktok: '',
        website: '',
      },
    });

    imported++;
  }

  console.log(`\nImport complete!`);
  console.log(`  Imported: ${imported} female fighters`);
  console.log(`  Skipped (already exist): ${skipped}`);
  console.log(`  Photos copied: ${photoCopied}`);

  // Print some stats
  const totalFemale = await User.countDocuments({ role: 'athlete', profileStatus: 'unclaimed' });
  console.log(`  Total unclaimed athlete profiles: ${totalFemale}`);

  await mongoose.disconnect();
}

importFighters().catch(err => {
  console.error('Import error:', err);
  process.exit(1);
});
