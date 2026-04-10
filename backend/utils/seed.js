/**
 * Seed script -- populates the database with sample data.
 * Run:  node utils/seed.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Video = require('../models/Video');
const Event = require('../models/Event');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/combat_girls';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Video.deleteMany({}),
    Event.deleteMany({}),
    Comment.deleteMany({}),
    Notification.deleteMany({}),
  ]);
  console.log('Cleared existing data');

  const hashedPassword = await bcrypt.hash('password123', 12);

  // =========================================================================
  // Users
  // =========================================================================
  const admin = await User.create({
    name: 'Admin',
    email: 'admin@combatgirls.tv',
    password: hashedPassword,
    role: 'admin',
    verified: true,
    bio: 'Platform administrator for COMBAT GIRLS.',
    image: 'https://ui-avatars.com/api/?name=Admin&background=dc2626&color=fff',
  });

  const athletes = await User.insertMany([
    {
      name: 'Sarah "Thunder" Williams',
      email: 'sarah@combatgirls.tv',
      password: hashedPassword,
      role: 'athlete',
      bio: 'UFC Bantamweight Champion. 3x defending champion. Training out of American Top Team. Making history one fight at a time.',
      verified: true,
      image: 'https://ui-avatars.com/api/?name=Sarah+Williams&background=dc2626&color=fff',
      fightRecord: { wins: 18, losses: 2, draws: 0, knockouts: 10, submissions: 5 },
      weightClass: 'Bantamweight (135 lbs)',
      gym: 'American Top Team',
      location: 'Miami, FL',
      discipline: ['mma', 'boxing', 'jiu-jitsu'],
      socialLinks: { instagram: '@thunderwilliams', twitter: '@thundersarah', youtube: 'SarahThunderTV', tiktok: '@thunderwilliams', website: '' },
    },
    {
      name: 'Maria Santos',
      email: 'maria@combatgirls.tv',
      password: hashedPassword,
      role: 'athlete',
      bio: 'Muay Thai specialist turned MMA fighter. Born in Sao Paulo, fighting worldwide. Oss!',
      verified: true,
      image: 'https://ui-avatars.com/api/?name=Maria+Santos&background=dc2626&color=fff',
      fightRecord: { wins: 14, losses: 3, draws: 1, knockouts: 8, submissions: 2 },
      weightClass: 'Flyweight (125 lbs)',
      gym: 'Kings MMA',
      location: 'Huntington Beach, CA',
      discipline: ['mma', 'muay-thai', 'jiu-jitsu'],
      socialLinks: { instagram: '@mariasantosmma', twitter: '@mariasantos_mma', youtube: '', tiktok: '', website: '' },
    },
    {
      name: 'Kim "Dragon" Lee',
      email: 'kim@combatgirls.tv',
      password: hashedPassword,
      role: 'athlete',
      bio: 'South Korean striking phenom. Taekwondo black belt. Former K-1 champion. Now dominating in MMA.',
      verified: true,
      image: 'https://ui-avatars.com/api/?name=Kim+Lee&background=dc2626&color=fff',
      fightRecord: { wins: 12, losses: 1, draws: 0, knockouts: 9, submissions: 0 },
      weightClass: 'Strawweight (115 lbs)',
      gym: 'Team Alpha Male',
      location: 'Sacramento, CA',
      discipline: ['mma', 'kickboxing', 'taekwondo'],
      socialLinks: { instagram: '@dragonlee_mma', twitter: '', youtube: '', tiktok: '@dragonleeofficial', website: '' },
    },
    {
      name: 'Aisha Johnson',
      email: 'aisha@combatgirls.tv',
      password: hashedPassword,
      role: 'athlete',
      bio: 'Wrestling prodigy. NCAA Division I All-American. Bringing ground game to the cage.',
      verified: true,
      image: 'https://ui-avatars.com/api/?name=Aisha+Johnson&background=dc2626&color=fff',
      fightRecord: { wins: 10, losses: 2, draws: 0, knockouts: 2, submissions: 6 },
      weightClass: 'Featherweight (145 lbs)',
      gym: 'Jackson-Wink MMA',
      location: 'Albuquerque, NM',
      discipline: ['mma', 'wrestling', 'jiu-jitsu'],
      socialLinks: { instagram: '@aishajohnsonmma', twitter: '', youtube: '', tiktok: '', website: '' },
    },
    {
      name: 'Elena Volkov',
      email: 'elena@combatgirls.tv',
      password: hashedPassword,
      role: 'athlete',
      bio: 'Former sambo champion. Now training in the US. Unorthodox striking, lethal submissions.',
      verified: false,
      image: 'https://ui-avatars.com/api/?name=Elena+Volkov&background=dc2626&color=fff',
      fightRecord: { wins: 8, losses: 3, draws: 0, knockouts: 3, submissions: 4 },
      weightClass: 'Bantamweight (135 lbs)',
      gym: 'ATT Evolution',
      location: 'Coconut Creek, FL',
      discipline: ['mma', 'wrestling', 'judo'],
      socialLinks: { instagram: '@elenavolkovmma', twitter: '', youtube: 'VolkovFights', tiktok: '', website: '' },
    },
  ]);

  const fans = await User.insertMany([
    {
      name: 'Alex Rivera',
      email: 'alex@example.com',
      password: hashedPassword,
      role: 'fan',
      bio: 'Combat sports enthusiast. Never miss a fight night!',
      image: 'https://ui-avatars.com/api/?name=Alex+Rivera&background=3b82f6&color=fff',
      subscription: { tier: 'premium' },
    },
    {
      name: 'Jordan Kim',
      email: 'jordan@example.com',
      password: hashedPassword,
      role: 'fan',
      bio: 'MMA analyst and podcast host.',
      image: 'https://ui-avatars.com/api/?name=Jordan+Kim&background=3b82f6&color=fff',
      subscription: { tier: 'free' },
    },
  ]);

  // Follow relationships
  await User.findByIdAndUpdate(athletes[0]._id, {
    followers: [fans[0]._id, fans[1]._id, athletes[1]._id],
  });
  await User.findByIdAndUpdate(athletes[1]._id, {
    followers: [fans[0]._id, athletes[0]._id],
  });
  for (const ath of athletes.slice(2)) {
    await User.findByIdAndUpdate(ath._id, { $addToSet: { followers: fans[0]._id } });
  }
  await User.findByIdAndUpdate(fans[0]._id, {
    following: athletes.map((a) => a._id),
  });
  await User.findByIdAndUpdate(fans[1]._id, {
    following: [athletes[0]._id, athletes[2]._id],
  });

  console.log(`Created ${athletes.length} athletes, ${fans.length} fans, 1 admin`);

  // =========================================================================
  // Videos
  // =========================================================================
  const videos = await Video.insertMany([
    // --- Sarah Williams ---
    { title: 'Championship KO - Round 3 Finish', description: 'Sarah Williams delivers a devastating knockout in the third round to retain her bantamweight title.', athlete: athletes[0]._id, category: 'fight', format: 'horizontal', sport: 'MMA', visibility: 'public', tags: ['knockout', 'championship', 'bantamweight'], approved: true, viewCount: 245000, commentCount: 890, duration: 272, likes: [fans[0]._id, fans[1]._id] },
    { title: 'Training Camp Day 1 - Road to the Title', description: 'Follow along as I prepare for the biggest fight of my career.', athlete: athletes[0]._id, category: 'training', format: 'horizontal', sport: 'MMA', visibility: 'public', tags: ['training', 'camp', 'preparation'], approved: true, viewCount: 89000, commentCount: 340, duration: 920 },
    { title: 'Weigh-In Face Off - Williams vs Volkov', description: 'Intense staredown at the ceremonial weigh-ins.', athlete: athletes[0]._id, category: 'behind-scenes', format: 'shorts', sport: 'MMA', visibility: 'public', tags: ['weighin', 'faceoff'], approved: true, viewCount: 890000, duration: 28 },
    { title: 'Behind the Scenes: Fight Week', description: 'Exclusive access to fight week preparations, media day, and everything leading up to the big night.', athlete: athletes[0]._id, category: 'behind-scenes', format: 'horizontal', sport: 'MMA', visibility: 'premium', tags: ['fightweek', 'bts', 'exclusive'], approved: true, viewCount: 67000, duration: 1800 },
    { title: 'Walk Out Moment - Championship Night', description: 'The crowd goes wild as Sarah Williams walks out for the main event.', athlete: athletes[0]._id, category: 'behind-scenes', format: 'shorts', sport: 'MMA', visibility: 'public', tags: ['walkout', 'championship', 'entrance'], approved: true, viewCount: 980000, duration: 35 },

    // --- Maria Santos ---
    { title: 'Post-Fight Interview: Santos vs Rodriguez', description: 'Maria Santos speaks after her impressive unanimous decision victory.', athlete: athletes[1]._id, category: 'interview', format: 'horizontal', sport: 'MMA', visibility: 'public', tags: ['interview', 'postfight'], approved: true, viewCount: 56000, duration: 480 },
    { title: 'Muay Thai Combo Drill', description: 'Quick drill showing my favorite 4-piece combo for the clinch.', athlete: athletes[1]._id, category: 'training', format: 'shorts', sport: 'Muay Thai', visibility: 'public', tags: ['muaythai', 'drill', 'combo'], approved: true, viewCount: 340000, duration: 38 },
    { title: 'Quick Pad Work', description: 'Speed and precision on the mitts today.', athlete: athletes[1]._id, category: 'training', format: 'shorts', sport: 'Boxing', visibility: 'public', tags: ['padwork', 'boxing', 'speed'], approved: true, viewCount: 445000, duration: 22 },

    // --- Kim Lee ---
    { title: 'Spinning Back Kick KO!', description: 'Kim Lee lands a spectacular spinning back kick for the finish.', athlete: athletes[2]._id, category: 'highlight', format: 'shorts', sport: 'MMA', visibility: 'public', tags: ['knockout', 'highlight', 'kick'], approved: true, viewCount: 1200000, duration: 45 },
    { title: 'Full Fight: Lee vs Anderson', description: 'Rewatch the incredible fight that earned Kim Lee Fight of the Night honors.', athlete: athletes[2]._id, category: 'fight', format: 'horizontal', sport: 'MMA', visibility: 'premium', tags: ['fullfight', 'fotn', 'strawweight'], approved: true, viewCount: 89000, duration: 1500 },
    { title: 'Sparring Highlights Compilation', description: 'Best moments from this weeks sparring sessions at the gym.', athlete: athletes[2]._id, category: 'highlight', format: 'horizontal', sport: 'MMA', visibility: 'public', tags: ['sparring', 'highlights', 'training'], approved: true, viewCount: 128000, duration: 180 },

    // --- Aisha Johnson ---
    { title: 'Takedown Defense Masterclass', description: 'Aisha Johnson breaks down her wrestling-based takedown defense techniques.', athlete: athletes[3]._id, category: 'training', format: 'horizontal', sport: 'Wrestling', visibility: 'premium', tags: ['wrestling', 'technique', 'defense'], approved: true, viewCount: 34000, duration: 1200 },
    { title: 'Armbar From Guard - Competition Highlight', description: 'Competition footage of a beautiful armbar finish from closed guard.', athlete: athletes[3]._id, category: 'highlight', format: 'shorts', sport: 'BJJ', visibility: 'public', tags: ['bjj', 'armbar', 'submission'], approved: true, viewCount: 560000, duration: 52 },
    { title: 'Recovery Day Routine', description: 'What my rest days look like. Ice baths, stretching, and meal prep.', athlete: athletes[3]._id, category: 'behind-scenes', format: 'shorts', sport: 'MMA', visibility: 'public', tags: ['recovery', 'lifestyle', 'mealprep'], approved: true, viewCount: 210000, duration: 42 },

    // --- Elena Volkov ---
    { title: 'Judo Throws in MMA', description: 'How I use my judo background to dominate in MMA. Technique breakdown.', athlete: athletes[4]._id, category: 'training', format: 'horizontal', sport: 'Judo', visibility: 'public', tags: ['judo', 'throws', 'technique'], approved: true, viewCount: 42000, duration: 680 },
  ]);

  console.log(`Created ${videos.length} videos`);

  // =========================================================================
  // Comments
  // =========================================================================
  const comments = await Comment.insertMany([
    { user: fans[0]._id, video: videos[0]._id, text: 'That knockout was absolutely devastating! Sarah is on another level.' },
    { user: fans[1]._id, video: videos[0]._id, text: 'The way she set up that combination was pure artistry.' },
    { user: fans[0]._id, video: videos[8]._id, text: 'Spinning back kick KO?! Kim Lee is the most exciting fighter on the roster!' },
    { user: fans[1]._id, video: videos[6]._id, text: 'That clinch combo is lethal. Going to drill this tomorrow.' },
    { user: fans[0]._id, video: videos[14]._id, text: 'Love seeing the judo transitions. More of this please!' },
  ]);

  // Update comment counts on videos
  const commentCounts = {};
  for (const c of comments) {
    const vid = c.video.toString();
    commentCounts[vid] = (commentCounts[vid] || 0) + 1;
  }
  for (const [videoId, count] of Object.entries(commentCounts)) {
    await Video.findByIdAndUpdate(videoId, { $inc: { commentCount: count } });
  }

  console.log(`Created ${comments.length} comments`);

  // =========================================================================
  // Events
  // =========================================================================
  const now = new Date();
  const events = await Event.insertMany([
    {
      title: 'COMBAT GIRLS: Championship Night',
      description: 'The biggest night in womens combat sports features championship bouts across multiple weight classes.',
      date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 2 weeks out
      venue: 'T-Mobile Arena',
      location: 'Las Vegas, NV',
      status: 'upcoming',
      isPPV: true,
      price: 49.99,
      fightCard: [
        { fighter1: athletes[0]._id, fighter2: athletes[4]._id, weightClass: 'Bantamweight (135 lbs)', rounds: 5, isMainEvent: true, order: 1 },
        { fighter1: athletes[1]._id, fighter2: athletes[3]._id, weightClass: 'Flyweight (125 lbs)', rounds: 3, isMainEvent: false, order: 2 },
      ],
      interestedUsers: [fans[0]._id, fans[1]._id],
      createdBy: admin._id,
    },
    {
      title: 'COMBAT GIRLS: Friday Night Fights Vol. 12',
      description: 'Weekly showcase of up-and-coming talent in womens combat sports.',
      date: now,
      venue: 'UFC Apex',
      location: 'Las Vegas, NV',
      status: 'live',
      isPPV: false,
      price: 0,
      fightCard: [
        { fighter1: athletes[2]._id, fighter2: athletes[3]._id, weightClass: 'Strawweight (115 lbs)', rounds: 3, isMainEvent: true, order: 1 },
      ],
      watchingCount: 8400,
      interestedUsers: [fans[0]._id],
      createdBy: admin._id,
    },
    {
      title: 'COMBAT GIRLS: Battle of Champions III',
      description: 'Three title defenses in one legendary night.',
      date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      venue: 'Madison Square Garden',
      location: 'New York, NY',
      status: 'completed',
      isPPV: true,
      price: 49.99,
      fightCard: [
        {
          fighter1: athletes[0]._id,
          fighter2: athletes[4]._id,
          weightClass: 'Bantamweight (135 lbs)',
          rounds: 5,
          isMainEvent: true,
          order: 1,
          result: { winner: athletes[0]._id, method: 'TKO', round: 3, time: '2:34' },
        },
        {
          fighter1: athletes[1]._id,
          fighter2: athletes[2]._id,
          weightClass: 'Flyweight (125 lbs)',
          rounds: 3,
          isMainEvent: false,
          order: 2,
          result: { winner: athletes[2]._id, method: 'Unanimous Decision', round: 3, time: '5:00' },
        },
      ],
      interestedUsers: [fans[0]._id, fans[1]._id],
      createdBy: admin._id,
    },
  ]);

  console.log(`Created ${events.length} events`);

  // =========================================================================
  // Done
  // =========================================================================
  console.log('\n--- Seed complete! ---');
  console.log('All passwords: password123');
  console.log('');
  console.log('Admin:    admin@combatgirls.tv');
  console.log('Athletes: sarah@combatgirls.tv');
  console.log('          maria@combatgirls.tv');
  console.log('          kim@combatgirls.tv');
  console.log('          aisha@combatgirls.tv');
  console.log('          elena@combatgirls.tv');
  console.log('Fans:     alex@example.com  (premium tier)');
  console.log('          jordan@example.com (free tier)');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
