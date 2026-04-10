const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Video = require('../models/Video');
const Event = require('../models/Event');
const { auth, requireRole } = require('../middleware/auth');
const { imageUpload } = require('../middleware/upload');
const { uploadToR2, deleteFromR2 } = require('../services/cloudflare');
const { createNotification } = require('../services/notifications');

// All admin routes require authentication + admin role
router.use(auth, requireRole('admin'));

// ---------------------------------------------------------------------------
// GET /api/admin/dashboard
// ---------------------------------------------------------------------------
router.get('/dashboard', async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalAthletes,
      totalFans,
      totalVideos,
      totalEvents,
      pendingVideos,
      activeSubscribers,
      liveEvents,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'athlete' }),
      User.countDocuments({ role: 'fan' }),
      Video.countDocuments(),
      Event.countDocuments(),
      Video.countDocuments({ approved: false }),
      User.countDocuments({ 'subscription.tier': { $ne: 'free' } }),
      Event.countDocuments({ status: 'live' }),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalAthletes,
        totalFans,
        totalVideos,
        totalEvents,
        pendingVideos,
        activeSubscribers,
        liveEvents,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// GET /api/admin/users
// ---------------------------------------------------------------------------
router.get('/users', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip(skip),
      User.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// PUT /api/admin/users/:id
// ---------------------------------------------------------------------------
router.put('/users/:id', async (req, res, next) => {
  try {
    const { role, verified, banned } = req.body;
    const updates = {};
    if (role !== undefined) updates.role = role;
    if (verified !== undefined) updates.verified = verified;
    if (banned !== undefined) updates.banned = banned;

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// GET /api/admin/videos/pending
// ---------------------------------------------------------------------------
router.get('/videos/pending', async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [videos, total] = await Promise.all([
      Video.find({ approved: false })
        .populate('athlete', 'name image email')
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip(skip),
      Video.countDocuments({ approved: false }),
    ]);

    res.json({
      success: true,
      data: videos,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// PUT /api/admin/videos/:id/approve
// ---------------------------------------------------------------------------
router.put('/videos/:id/approve', async (req, res, next) => {
  try {
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      { approved: true },
      { new: true }
    ).populate('athlete', 'name');

    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    // Notify the athlete their video was approved
    await createNotification({
      user: video.athlete._id,
      type: 'upload',
      message: `Your video "${video.title}" has been approved and is now live!`,
      from: req.user._id,
      link: `/video/${video._id}`,
      io: req.app.get('io'),
    });

    res.json({ success: true, data: video });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// PUT /api/admin/videos/:id/reject
// ---------------------------------------------------------------------------
router.put('/videos/:id/reject', async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    // Attempt to clean up stored files
    try {
      if (video.thumbnailUrl) {
        const thumbKey = video.thumbnailUrl.split('/').slice(-2).join('/');
        await deleteFromR2(thumbKey);
      }
    } catch {
      // Ignore cleanup errors
    }

    await Video.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Video rejected and deleted' });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// GET /api/admin/events
// ---------------------------------------------------------------------------
router.get('/events', async (req, res, next) => {
  try {
    const events = await Event.find()
      .populate('createdBy', 'name')
      .sort({ date: -1 });

    res.json({ success: true, data: events });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// POST /api/admin/events
// ---------------------------------------------------------------------------
router.post(
  '/events',
  imageUpload.single('bannerImage'),
  [
    body('title').trim().notEmpty().withMessage('Event title is required'),
    body('date').notEmpty().withMessage('Event date is required'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
      }

      const { title, description, date, venue, location, isPPV, price, fightCard, streamUrl } = req.body;

      let bannerImage = '';
      if (req.file) {
        const key = `events/banner-${Date.now()}.${req.file.mimetype.split('/')[1]}`;
        bannerImage = await uploadToR2(req.file.buffer, key, req.file.mimetype);
      }

      const event = await Event.create({
        title,
        description: description || '',
        bannerImage,
        date,
        venue: venue || '',
        location: location || '',
        isPPV: isPPV === 'true' || isPPV === true,
        price: price ? Number(price) : 0,
        fightCard: fightCard ? (typeof fightCard === 'string' ? JSON.parse(fightCard) : fightCard) : [],
        streamUrl: streamUrl || '',
        createdBy: req.user._id,
      });

      res.status(201).json({ success: true, data: event });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// PUT /api/admin/events/:id
// ---------------------------------------------------------------------------
router.put('/events/:id', imageUpload.single('bannerImage'), async (req, res, next) => {
  try {
    const updates = { ...req.body };

    // Parse fightCard if it comes as a JSON string
    if (typeof updates.fightCard === 'string') {
      try {
        updates.fightCard = JSON.parse(updates.fightCard);
      } catch {
        // leave as-is
      }
    }

    // Handle banner image upload
    if (req.file) {
      const key = `events/banner-${Date.now()}.${req.file.mimetype.split('/')[1]}`;
      updates.bannerImage = await uploadToR2(req.file.buffer, key, req.file.mimetype);
    }

    // Convert string booleans
    if (updates.isPPV === 'true') updates.isPPV = true;
    if (updates.isPPV === 'false') updates.isPPV = false;
    if (updates.price) updates.price = Number(updates.price);

    const event = await Event.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // If event went live, notify interested users
    if (updates.status === 'live') {
      const io = req.app.get('io');
      for (const userId of event.interestedUsers) {
        await createNotification({
          user: userId,
          type: 'live',
          message: `${event.title} is now LIVE!`,
          from: req.user._id,
          link: `/events/${event._id}`,
          io,
        });
      }
    }

    res.json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// POST /api/admin/athletes - Create an unclaimed athlete profile
// ---------------------------------------------------------------------------
router.post('/athletes', async (req, res, next) => {
  try {
    const { name, nickname, bio, weightClass, height, reach, stance, dateOfBirth, discipline, image, fightRecord } = req.body;

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const email = `${slug}@unclaimed.combatgirls.tv`;

    const existing = await User.findOne({ $or: [{ slug }, { email }] });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Athlete profile already exists' });
    }

    const athlete = await User.create({
      name,
      email,
      role: 'athlete',
      profileStatus: 'unclaimed',
      verified: false,
      bio: bio || (nickname ? `"${nickname}" - Combat Sports Athlete` : 'Combat Sports Athlete'),
      nickname: nickname || '',
      image: image || '',
      slug,
      fightRecord: fightRecord || { wins: 0, losses: 0, draws: 0, knockouts: 0, submissions: 0 },
      weightClass: weightClass || '',
      height: height || '',
      reach: reach || '',
      stance: stance || '',
      dateOfBirth: dateOfBirth || '',
      discipline: discipline || ['mma'],
    });

    res.status(201).json({ success: true, data: athlete });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// GET /api/admin/claims - Get pending claim requests
// ---------------------------------------------------------------------------
router.get('/claims', async (req, res, next) => {
  try {
    const claims = await User.find({
      profileStatus: 'pending',
      'claimRequest.status': 'pending',
    })
      .populate('claimRequest.requestedBy', 'name email image')
      .sort({ 'claimRequest.requestedAt': -1 });

    res.json({ success: true, data: claims });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// PUT /api/admin/claims/:id/approve - Approve a claim request
// ---------------------------------------------------------------------------
router.put('/claims/:id/approve', async (req, res, next) => {
  try {
    const profile = await User.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const claimerId = profile.claimRequest.requestedBy;

    // Transfer profile to the claiming user
    profile.profileStatus = 'claimed';
    profile.claimRequest.status = 'approved';

    // Link the claiming user's auth to this profile
    const claimer = await User.findById(claimerId);
    if (claimer) {
      profile.email = claimer.email;
      profile.password = claimer.password;
      profile.googleId = claimer.googleId || profile.googleId;
      // Delete the claimer's original account (they now own this profile)
      await User.findByIdAndDelete(claimerId);
    }

    await profile.save();

    res.json({ success: true, data: profile, message: 'Claim approved and profile linked' });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// PUT /api/admin/claims/:id/reject - Reject a claim request
// ---------------------------------------------------------------------------
router.put('/claims/:id/reject', async (req, res, next) => {
  try {
    const profile = await User.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    profile.profileStatus = 'unclaimed';
    profile.claimRequest.status = 'rejected';
    await profile.save();

    res.json({ success: true, message: 'Claim rejected' });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// POST /api/admin/videos/quick-post - Quick post a YouTube video
// ---------------------------------------------------------------------------
router.post('/videos/quick-post', async (req, res, next) => {
  try {
    const { youtubeUrl, title, description, category, format, sport, fighter1, fighter2, tags, visibility } = req.body;

    // Parse YouTube ID from URL
    let youtubeId = '';
    if (youtubeUrl) {
      const match = youtubeUrl.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      if (match) youtubeId = match[1];
    }

    if (!youtubeId) {
      return res.status(400).json({ success: false, message: 'Invalid YouTube URL' });
    }

    const video = await Video.create({
      title: title || '',
      description: description || '',
      youtubeId,
      youtubeUrl,
      thumbnailUrl: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
      category: category || 'fight',
      format: format || 'horizontal',
      sport: sport || 'MMA',
      visibility: visibility || 'public',
      tags: tags ? (typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags) : [],
      fighter1: fighter1 || undefined,
      fighter2: fighter2 || undefined,
      postedBy: req.user._id,
      approved: true,
    });

    res.status(201).json({ success: true, data: video });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// POST /api/admin/import/csv - Import fighters from local CSV files
// Skips duplicates based on slug
// ---------------------------------------------------------------------------
router.post('/import/csv', async (req, res, next) => {
  try {
    const fs = require('fs');
    const path = require('path');

    const MMA_DIR = req.body.mmaDir || 'C:/Users/jasha/OneDrive/Documents/mma';
    const SCRAPE_DIR = path.join(MMA_DIR, 'scrape');
    const PHOTOS_SRC = path.join(MMA_DIR, 'uploads', 'fighters');
    const PHOTOS_DEST = path.join(__dirname, '..', '..', 'frontend', 'public', 'fighters');

    // Simple CSV parser
    function parseCSV(filePath) {
      if (!fs.existsSync(filePath)) return [];
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n').filter(l => l.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      return lines.slice(1).map(line => {
        const values = [];
        let current = '';
        let inQuotes = false;
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

    // Parse fight results for female fighters
    const fightResults = parseCSV(path.join(SCRAPE_DIR, 'ufc_fight_results.csv'));
    const femaleFighterNames = new Set();
    const fightRecords = {};

    for (const fight of fightResults) {
      if (!fight.WEIGHTCLASS || !fight.WEIGHTCLASS.includes("Women's")) continue;
      const parts = (fight.BOUT || '').split(' vs. ');
      if (parts.length !== 2) continue;
      const [name1, name2] = parts.map(n => n.trim());
      femaleFighterNames.add(name1);
      femaleFighterNames.add(name2);
      const [o1, o2] = (fight.OUTCOME || '').split('/');
      const method = fight.METHOD || '';
      for (const [name, result] of [[name1, o1], [name2, o2]]) {
        if (!fightRecords[name]) fightRecords[name] = { wins: 0, losses: 0, draws: 0, knockouts: 0, submissions: 0 };
        const r = fightRecords[name];
        if (result === 'W') { r.wins++; if (method.includes('KO/TKO')) r.knockouts++; if (method.includes('Submission')) r.submissions++; }
        else if (result === 'L') r.losses++;
        else if (result === 'D') r.draws++;
      }
    }

    // Parse fighter details and stats
    const fighterDetails = parseCSV(path.join(SCRAPE_DIR, 'ufc_fighter_details.csv'));
    const detailsMap = {};
    for (const f of fighterDetails) detailsMap[`${f.FIRST} ${f.LAST}`.trim()] = f;

    const fighterTott = parseCSV(path.join(SCRAPE_DIR, 'ufc_fighter_tott.csv'));
    const tottMap = {};
    for (const f of fighterTott) tottMap[f.FIGHTER] = f;

    if (!fs.existsSync(PHOTOS_DEST)) fs.mkdirSync(PHOTOS_DEST, { recursive: true });

    let imported = 0, skipped = 0, photoCopied = 0;

    for (const name of femaleFighterNames) {
      const slug = slugify(name);
      const existing = await User.findOne({ $or: [{ slug }, { name }] });
      if (existing) { skipped++; continue; }

      const details = detailsMap[name] || {};
      const tott = tottMap[name] || {};
      const record = fightRecords[name] || { wins: 0, losses: 0, draws: 0, knockouts: 0, submissions: 0 };

      // Copy photo if exists
      let imageUrl = '';
      const photoSrc = path.join(PHOTOS_SRC, `${slug}.png`);
      if (fs.existsSync(photoSrc)) {
        const photoDest = path.join(PHOTOS_DEST, `${slug}.png`);
        if (!fs.existsSync(photoDest)) {
          fs.copyFileSync(photoSrc, photoDest);
          photoCopied++;
        }
        imageUrl = `/fighters/${slug}.png`;
      }

      await User.create({
        name, email: `${slug}@unclaimed.combatgirls.tv`, role: 'athlete',
        profileStatus: 'unclaimed', verified: false, slug,
        bio: details.NICKNAME ? `"${details.NICKNAME}" - UFC Fighter` : 'UFC Fighter',
        nickname: details.NICKNAME || '', image: imageUrl,
        fightRecord: record, weightClass: tott.WEIGHT || '',
        height: tott.HEIGHT || '', reach: tott.REACH || '',
        stance: tott.STANCE || '', dateOfBirth: tott.DOB || '',
        ufcStatsUrl: details.URL || tott.URL || '',
        discipline: ['mma'],
      });
      imported++;
    }

    res.json({
      success: true,
      data: {
        totalFemale: femaleFighterNames.size,
        imported, skipped, photoCopied,
        message: `Imported ${imported} new fighters, skipped ${skipped} duplicates, copied ${photoCopied} photos`,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// POST /api/admin/import/mma-social - Import fighter data from mma.social
// ---------------------------------------------------------------------------
router.post('/import/mma-social', async (req, res, next) => {
  try {
    const { fighterSlug } = req.body;

    if (!fighterSlug) {
      return res.status(400).json({ success: false, message: 'Fighter slug is required' });
    }

    const url = `https://mma.social/fighters/${fighterSlug}/`;

    // Fetch the profile page
    let html;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      html = await response.text();
    } catch (fetchErr) {
      return res.status(400).json({ success: false, message: `Could not fetch mma.social profile: ${fetchErr.message}` });
    }

    // Parse basic data from HTML (simple regex extraction)
    const nameMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
    const recordMatch = html.match(/(\d+)-(\d+)-(\d+)/);
    const weightMatch = html.match(/Women's\s+([\w]+)/i);
    const imageMatch = html.match(/src="(\/uploads\/fighters\/[^"]+)"/);

    const name = nameMatch ? nameMatch[1].trim() : fighterSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const slug = fighterSlug;

    // Check for duplicate
    const existing = await User.findOne({ $or: [{ slug }, { mmaSocialUrl: url }] });
    if (existing) {
      // Update existing profile with mma.social data
      existing.mmaSocialUrl = url;
      if (recordMatch && !existing.fightRecord.wins) {
        existing.fightRecord = {
          wins: parseInt(recordMatch[1]) || 0,
          losses: parseInt(recordMatch[2]) || 0,
          draws: parseInt(recordMatch[3]) || 0,
          knockouts: 0, submissions: 0,
        };
      }
      await existing.save();
      return res.json({ success: true, data: existing, message: 'Updated existing profile with mma.social data' });
    }

    // Create new profile
    const fighter = await User.create({
      name, email: `${slug}@unclaimed.combatgirls.tv`, role: 'athlete',
      profileStatus: 'unclaimed', verified: false, slug,
      bio: 'MMA Fighter', mmaSocialUrl: url,
      fightRecord: recordMatch ? {
        wins: parseInt(recordMatch[1]) || 0,
        losses: parseInt(recordMatch[2]) || 0,
        draws: parseInt(recordMatch[3]) || 0,
        knockouts: 0, submissions: 0,
      } : { wins: 0, losses: 0, draws: 0, knockouts: 0, submissions: 0 },
      weightClass: weightMatch ? `Women's ${weightMatch[1]}` : '',
      discipline: ['mma'],
    });

    res.status(201).json({ success: true, data: fighter, message: `Imported ${name} from mma.social` });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// POST /api/admin/import/bulk-mma-social - Bulk import from mma.social rankings
// ---------------------------------------------------------------------------
router.post('/import/bulk-mma-social', async (req, res, next) => {
  try {
    const { slugs } = req.body; // array of fighter slugs
    if (!slugs || !Array.isArray(slugs)) {
      return res.status(400).json({ success: false, message: 'Array of slugs is required' });
    }

    let imported = 0, skipped = 0;
    const results = [];

    for (const slug of slugs.slice(0, 50)) { // max 50 at a time
      const existing = await User.findOne({ slug });
      if (existing) { skipped++; continue; }

      const name = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      await User.create({
        name, email: `${slug}@unclaimed.combatgirls.tv`, role: 'athlete',
        profileStatus: 'unclaimed', verified: false, slug,
        bio: 'MMA Fighter', mmaSocialUrl: `https://mma.social/fighters/${slug}/`,
        discipline: ['mma'],
      });
      imported++;
      results.push(name);
    }

    res.json({
      success: true,
      data: { imported, skipped, fighters: results },
      message: `Imported ${imported} fighters, skipped ${skipped} duplicates`,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
