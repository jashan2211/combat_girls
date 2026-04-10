const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { imageUpload } = require('../middleware/upload');
const { uploadToR2 } = require('../services/cloudflare');

// Helper: generate JWT
function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

// ---------------------------------------------------------------------------
// POST /api/auth/register
// ---------------------------------------------------------------------------
router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
      }

      const { name, email, password, role } = req.body;

      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email already registered' });
      }

      const user = await User.create({
        name,
        email,
        password,
        role: role === 'athlete' ? 'athlete' : 'fan',
      });

      const token = signToken(user._id);

      res.status(201).json({
        success: true,
        data: {
          token,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.image,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------------------
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
      }

      const { email, password } = req.body;

      const user = await User.findOne({ email }).select('+password');
      if (!user || !user.password) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const token = signToken(user._id);

      res.json({
        success: true,
        data: {
          token,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.image,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// POST /api/auth/google
// ---------------------------------------------------------------------------
router.post(
  '/google',
  [
    body('googleId').notEmpty().withMessage('Google ID is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('name').notEmpty().withMessage('Name is required'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
      }

      const { googleId, email, name, image } = req.body;

      let user = await User.findOne({ $or: [{ googleId }, { email }] });

      if (!user) {
        user = await User.create({
          googleId,
          email,
          name,
          image: image || '',
          role: 'fan',
        });
      } else if (!user.googleId) {
        user.googleId = googleId;
        if (image && !user.image) user.image = image;
        await user.save();
      }

      const token = signToken(user._id);

      res.json({
        success: true,
        data: {
          token,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.image,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// GET /api/auth/me
// ---------------------------------------------------------------------------
router.get('/me', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('savedVideos', 'title thumbnailUrl')
      .populate('purchasedEvents', 'title date')
      .populate('followers', 'name image')
      .populate('following', 'name image');

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// PUT /api/auth/profile
// ---------------------------------------------------------------------------
router.put(
  '/profile',
  auth,
  imageUpload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'banner', maxCount: 1 },
  ]),
  async (req, res, next) => {
    try {
      const allowedFields = [
        'name',
        'bio',
        'weightClass',
        'gym',
        'location',
        'discipline',
        'socialLinks',
        'fightRecord',
      ];

      const updates = {};
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          if (
            typeof req.body[field] === 'string' &&
            (field === 'discipline' || field === 'socialLinks' || field === 'fightRecord')
          ) {
            try {
              updates[field] = JSON.parse(req.body[field]);
            } catch {
              updates[field] = req.body[field];
            }
          } else {
            updates[field] = req.body[field];
          }
        }
      }

      // Handle avatar image upload
      if (req.files?.image?.[0]) {
        const file = req.files.image[0];
        const key = `avatars/${req.user._id}-${Date.now()}.${file.mimetype.split('/')[1]}`;
        const imageUrl = await uploadToR2(file.buffer, key, file.mimetype);
        updates.image = imageUrl;
      }

      // Handle banner image upload
      if (req.files?.banner?.[0]) {
        const file = req.files.banner[0];
        const key = `banners/${req.user._id}-${Date.now()}.${file.mimetype.split('/')[1]}`;
        const bannerUrl = await uploadToR2(file.buffer, key, file.mimetype);
        updates.banner = bannerUrl;
      }

      const user = await User.findByIdAndUpdate(req.user._id, updates, {
        new: true,
        runValidators: true,
      });

      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
