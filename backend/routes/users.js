const router = require('express').Router();
const User = require('../models/User');
const { auth, optionalAuth } = require('../middleware/auth');
const { createNotification } = require('../services/notifications');

// ---------------------------------------------------------------------------
// GET /api/users/athletes
// ---------------------------------------------------------------------------
router.get('/athletes', optionalAuth, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, discipline, search, sort = 'popular' } = req.query;
    const query = { role: 'athlete' };

    if (discipline) query.discipline = discipline;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { gym: { $regex: search, $options: 'i' } },
      ];
    }

    let sortBy = {};
    if (sort === 'popular') sortBy = { followers: -1 };
    else if (sort === 'recent') sortBy = { createdAt: -1 };
    else if (sort === 'name') sortBy = { name: 1 };

    const skip = (Number(page) - 1) * Number(limit);

    const [athletes, total] = await Promise.all([
      User.find(query)
        .select('-password -email')
        .sort(sortBy)
        .limit(Number(limit))
        .skip(skip),
      User.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: athletes,
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
// GET /api/users/:id
// ---------------------------------------------------------------------------
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -email')
      .populate('followers', 'name image')
      .populate('following', 'name image');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const userData = user.toObject();
    userData.isFollowing = req.user
      ? user.followers?.some((f) => f._id.toString() === req.user._id.toString())
      : false;

    res.json({ success: true, data: userData });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// POST /api/users/:id/follow
// ---------------------------------------------------------------------------
router.post('/:id/follow', auth, async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot follow yourself' });
    }

    const userToFollow = await User.findById(req.params.id);
    if (!userToFollow) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (userToFollow.followers.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: 'Already following this user' });
    }

    await User.findByIdAndUpdate(req.params.id, { $addToSet: { followers: req.user._id } });
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { following: req.params.id } });

    // Notification
    await createNotification({
      user: req.params.id,
      type: 'follow',
      message: `${req.user.name} started following you`,
      from: req.user._id,
      link: `/profile/${req.user._id}`,
      io: req.app.get('io'),
    });

    res.json({ success: true, message: 'Followed successfully' });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/users/:id/follow
// ---------------------------------------------------------------------------
router.delete('/:id/follow', auth, async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { $pull: { followers: req.user._id } });
    await User.findByIdAndUpdate(req.user._id, { $pull: { following: req.params.id } });

    res.json({ success: true, message: 'Unfollowed successfully' });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// GET /api/users/:id/followers
// ---------------------------------------------------------------------------
router.get('/:id/followers', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate(
      'followers',
      'name image bio role verified'
    );
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user.followers });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// GET /api/users/:id/following
// ---------------------------------------------------------------------------
router.get('/:id/following', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate(
      'following',
      'name image bio role verified'
    );
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user.following });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// GET /api/users/search - Search athletes for tagging (autocomplete)
// ---------------------------------------------------------------------------
router.get('/search', async (req, res, next) => {
  try {
    const { q, limit = 15 } = req.query;
    if (!q || q.length < 2) {
      return res.json({ success: true, data: [] });
    }

    const athletes = await User.find({
      role: 'athlete',
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { nickname: { $regex: q, $options: 'i' } },
      ],
    })
      .select('name nickname image slug profileStatus verified')
      .limit(Number(limit))
      .sort({ verified: -1, name: 1 });

    res.json({ success: true, data: athletes });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// POST /api/users/:id/claim - Request to claim an unclaimed athlete profile
// ---------------------------------------------------------------------------
router.post('/:id/claim', auth, async (req, res, next) => {
  try {
    const { message, proofUrl } = req.body;

    const profile = await User.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }
    if (profile.profileStatus !== 'unclaimed') {
      return res.status(400).json({ success: false, message: 'Profile is not available for claiming' });
    }

    profile.profileStatus = 'pending';
    profile.claimRequest = {
      requestedBy: req.user._id,
      requestedAt: new Date(),
      message: message || '',
      proofUrl: proofUrl || '',
      status: 'pending',
    };
    await profile.save();

    res.json({ success: true, message: 'Claim request submitted for admin review' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
