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

module.exports = router;
