const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const Video = require('../models/Video');
const Comment = require('../models/Comment');
const User = require('../models/User');
const { auth, optionalAuth, requireRole } = require('../middleware/auth');
const { videoUpload, imageUpload } = require('../middleware/upload');
const { uploadToR2, getStreamUploadUrl } = require('../services/cloudflare');
const { createNotification } = require('../services/notifications');

// ---------------------------------------------------------------------------
// GET /api/videos/feed
// ---------------------------------------------------------------------------
router.get('/feed', optionalAuth, async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      sort = 'trending',
      visibility,
    } = req.query;

    const query = { approved: true, format: { $ne: 'shorts' } };

    if (category && category !== 'all') query.category = category;

    // "following" feed: only show videos from followed athletes
    if (sort === 'following' && req.user) {
      const currentUser = await User.findById(req.user._id);
      query.athlete = { $in: currentUser.following };
    }

    // Non-premium users only see public content
    if (visibility) {
      query.visibility = visibility;
    } else if (!req.user || req.user.subscription?.tier === 'free') {
      query.visibility = 'public';
    }

    let sortBy = {};
    if (sort === 'trending') sortBy = { viewCount: -1, createdAt: -1 };
    else if (sort === 'recent') sortBy = { createdAt: -1 };
    else if (sort === 'popular') sortBy = { viewCount: -1 };
    else if (sort === 'following') sortBy = { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);

    const [videos, total] = await Promise.all([
      Video.find(query)
        .populate('athlete', 'name image verified')
        .sort(sortBy)
        .limit(Number(limit))
        .skip(skip),
      Video.countDocuments(query),
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
// GET /api/videos/shorts
// ---------------------------------------------------------------------------
router.get('/shorts', optionalAuth, async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const query = { approved: true, format: 'shorts' };

    if (!req.user || req.user.subscription?.tier === 'free') {
      query.visibility = 'public';
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [videos, total] = await Promise.all([
      Video.find(query)
        .populate('athlete', 'name image verified')
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip(skip),
      Video.countDocuments(query),
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
// GET /api/videos/search
// ---------------------------------------------------------------------------
router.get('/search', optionalAuth, async (req, res, next) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    const query = {
      approved: true,
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } },
      ],
    };

    if (!req.user || req.user.subscription?.tier === 'free') {
      query.visibility = 'public';
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [videos, total] = await Promise.all([
      Video.find(query)
        .populate('athlete', 'name image verified')
        .sort({ viewCount: -1, createdAt: -1 })
        .limit(Number(limit))
        .skip(skip),
      Video.countDocuments(query),
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
// GET /api/videos/athlete/:id
// ---------------------------------------------------------------------------
router.get('/athlete/:id', optionalAuth, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category } = req.query;
    const query = { athlete: req.params.id, approved: true };
    if (category) query.category = category;

    if (!req.user || req.user.subscription?.tier === 'free') {
      query.visibility = 'public';
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [videos, total] = await Promise.all([
      Video.find(query)
        .populate('athlete', 'name image verified')
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip(skip),
      Video.countDocuments(query),
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
// GET /api/videos/:id
// ---------------------------------------------------------------------------
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('athlete', 'name image verified bio fightRecord discipline weightClass gym followers')
      .populate('event', 'title date');

    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    // Check premium access
    if (video.visibility === 'premium') {
      if (
        !req.user ||
        (req.user.subscription?.tier === 'free' && req.user.role !== 'admin')
      ) {
        return res.status(403).json({ success: false, message: 'Premium subscription required' });
      }
    }

    // Check PPV access
    if (video.visibility === 'ppv' && video.event) {
      if (
        !req.user ||
        (!req.user.purchasedEvents?.includes(video.event._id) && req.user.role !== 'admin')
      ) {
        return res.status(403).json({ success: false, message: 'PPV purchase required' });
      }
    }

    // Increment view count
    await Video.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });

    const videoData = video.toObject();
    videoData.isLiked = req.user ? video.likes.includes(req.user._id) : false;
    videoData.isSaved = req.user ? video.saves.includes(req.user._id) : false;

    res.json({ success: true, data: videoData });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// POST /api/videos/upload
// ---------------------------------------------------------------------------
router.post(
  '/upload',
  auth,
  requireRole('athlete', 'admin'),
  videoUpload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
  ]),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('category')
      .isIn(['fight', 'highlight', 'training', 'behind-scenes', 'interview', 'shorts'])
      .withMessage('Valid category is required'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
      }

      const {
        title,
        description,
        category,
        format,
        tags,
        sport,
        visibility,
        duration,
        event,
      } = req.body;

      let thumbnailUrl = '';
      let videoUrl = '';
      let cloudflareStreamId = '';

      // Upload thumbnail to R2 if provided
      if (req.files?.thumbnail?.[0]) {
        const thumbFile = req.files.thumbnail[0];
        const thumbKey = `thumbnails/${req.user._id}-${Date.now()}.${thumbFile.mimetype.split('/')[1]}`;
        thumbnailUrl = await uploadToR2(thumbFile.buffer, thumbKey, thumbFile.mimetype);
      }

      // Get a Cloudflare Stream direct-upload URL.
      // The actual video bytes are uploaded client-side via TUS protocol.
      try {
        const streamData = await getStreamUploadUrl();
        cloudflareStreamId = streamData.videoId;
        videoUrl = streamData.uploadUrl;
      } catch {
        // If Stream is not configured, upload to R2 as fallback
        if (req.files?.video?.[0]) {
          const vidFile = req.files.video[0];
          const vidKey = `videos/${req.user._id}-${Date.now()}.mp4`;
          videoUrl = await uploadToR2(vidFile.buffer, vidKey, vidFile.mimetype);
        }
      }

      const video = await Video.create({
        title,
        description: description || '',
        athlete: req.user._id,
        videoUrl,
        thumbnailUrl,
        category,
        format: format || (category === 'shorts' ? 'shorts' : 'horizontal'),
        tags: tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [],
        sport: sport || '',
        visibility: visibility || 'public',
        duration: duration ? Number(duration) : 0,
        event: event || undefined,
        approved: req.user.role === 'admin',
        cloudflareStreamId,
      });

      const populated = await video.populate('athlete', 'name image verified');

      // Notify followers about the new upload
      const uploader = await User.findById(req.user._id);
      if (uploader.followers && uploader.followers.length > 0) {
        const io = req.app.get('io');
        for (const followerId of uploader.followers) {
          await createNotification({
            user: followerId,
            type: 'upload',
            message: `${req.user.name} uploaded a new video: ${title}`,
            from: req.user._id,
            link: `/video/${video._id}`,
            io,
          });
        }
      }

      res.status(201).json({ success: true, data: populated });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// POST /api/videos/:id/like
// ---------------------------------------------------------------------------
router.post('/:id/like', auth, async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    if (video.likes.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: 'Already liked' });
    }

    video.likes.push(req.user._id);
    await video.save();

    // Notify video owner
    if (video.athlete.toString() !== req.user._id.toString()) {
      await createNotification({
        user: video.athlete,
        type: 'like',
        message: `${req.user.name} liked your video "${video.title}"`,
        from: req.user._id,
        link: `/video/${video._id}`,
        io: req.app.get('io'),
      });
    }

    res.json({ success: true, data: { likeCount: video.likes.length } });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/videos/:id/like
// ---------------------------------------------------------------------------
router.delete('/:id/like', auth, async (req, res, next) => {
  try {
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      { $pull: { likes: req.user._id } },
      { new: true }
    );
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    res.json({ success: true, data: { likeCount: video.likes.length } });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// POST /api/videos/:id/save
// ---------------------------------------------------------------------------
router.post('/:id/save', auth, async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    const isSaved = video.saves.includes(req.user._id);

    if (isSaved) {
      // Un-save
      await Video.findByIdAndUpdate(req.params.id, { $pull: { saves: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $pull: { savedVideos: req.params.id } });
      return res.json({ success: true, data: { saved: false } });
    }

    // Save
    await Video.findByIdAndUpdate(req.params.id, { $addToSet: { saves: req.user._id } });
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { savedVideos: req.params.id } });

    res.json({ success: true, data: { saved: true } });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// GET /api/videos/:id/comments
// ---------------------------------------------------------------------------
router.get('/:id/comments', async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query = { video: req.params.id, parentComment: null };

    const [comments, total] = await Promise.all([
      Comment.find(query)
        .populate('user', 'name image role verified')
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip(skip),
      Comment.countDocuments(query),
    ]);

    // Attach a few replies to each top-level comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ parentComment: comment._id })
          .populate('user', 'name image role verified')
          .sort({ createdAt: 1 })
          .limit(3);
        const replyCount = await Comment.countDocuments({ parentComment: comment._id });
        return { ...comment.toObject(), replies, replyCount };
      })
    );

    res.json({
      success: true,
      data: commentsWithReplies,
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
// POST /api/videos/:id/comments
// ---------------------------------------------------------------------------
router.post(
  '/:id/comments',
  auth,
  [body('text').trim().isLength({ min: 1, max: 2000 }).withMessage('Comment text is required (max 2000 chars)')],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
      }

      const video = await Video.findById(req.params.id);
      if (!video) {
        return res.status(404).json({ success: false, message: 'Video not found' });
      }

      const { text, parentComment } = req.body;

      const comment = await Comment.create({
        user: req.user._id,
        video: req.params.id,
        text,
        parentComment: parentComment || null,
      });

      // Increment comment count on the video
      await Video.findByIdAndUpdate(req.params.id, { $inc: { commentCount: 1 } });

      const populated = await comment.populate('user', 'name image role verified');

      // Notify video owner
      if (video.athlete.toString() !== req.user._id.toString()) {
        await createNotification({
          user: video.athlete,
          type: 'comment',
          message: `${req.user.name} commented on your video`,
          from: req.user._id,
          link: `/video/${video._id}`,
          io: req.app.get('io'),
        });
      }

      // If reply, notify parent comment author
      if (parentComment) {
        const parent = await Comment.findById(parentComment);
        if (parent && parent.user.toString() !== req.user._id.toString()) {
          await createNotification({
            user: parent.user,
            type: 'reply',
            message: `${req.user.name} replied to your comment`,
            from: req.user._id,
            link: `/video/${video._id}`,
            io: req.app.get('io'),
          });
        }
      }

      res.status(201).json({ success: true, data: populated });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
