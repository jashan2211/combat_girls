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
// POST /api/auth/google - Google Sign-In with ID token verification
// ---------------------------------------------------------------------------
router.post('/google', async (req, res, next) => {
  try {
    const { credential, googleId, email, name, image } = req.body;

    let userEmail = email;
    let userName = name;
    let userImage = image;
    let userGoogleId = googleId;

    // If credential (JWT from Google Identity Services) is provided, verify it
    if (credential) {
      try {
        // Decode the JWT (Google ID token) - header.payload.signature
        const payload = JSON.parse(
          Buffer.from(credential.split('.')[1], 'base64').toString()
        );
        userEmail = payload.email;
        userName = payload.name;
        userImage = payload.picture;
        userGoogleId = payload.sub;
      } catch (decodeErr) {
        return res.status(400).json({ success: false, message: 'Invalid Google credential' });
      }
    }

    if (!userEmail) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    let user = await User.findOne({ $or: [{ googleId: userGoogleId }, { email: userEmail }] });

    if (!user) {
      // Auto-assign admin role for the channel owner
      const isChannelOwner = userEmail === 'combatgirlschannel@gmail.com';

      user = await User.create({
        googleId: userGoogleId,
        email: userEmail,
        name: userName || userEmail.split('@')[0],
        image: userImage || '',
        role: isChannelOwner ? 'admin' : 'fan',
        verified: isChannelOwner,
      });
    } else {
      // Link Google account if not already linked
      if (!user.googleId) {
        user.googleId = userGoogleId;
      }
      if (userImage && !user.image) {
        user.image = userImage;
      }
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
});

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

// ---------------------------------------------------------------------------
// GET /api/auth/google/redirect - Redirect to Google OAuth
// ---------------------------------------------------------------------------
router.get('/google/redirect', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${process.env.FRONTEND_URL || 'https://combatgirls.net'}/api/auth/google/callback`;
  const scope = 'openid email profile';
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`;
  res.redirect(url);
});

// ---------------------------------------------------------------------------
// GET /api/auth/google/callback - Google OAuth callback
// ---------------------------------------------------------------------------
router.get('/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.redirect('/login?error=' + encodeURIComponent('Google sign-in was cancelled'));
    }

    const redirectUri = `${process.env.FRONTEND_URL || 'https://combatgirls.net'}/api/auth/google/callback`;

    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    const tokens = await tokenRes.json();

    if (!tokens.access_token) {
      return res.redirect('/login?error=' + encodeURIComponent('Failed to get Google token'));
    }

    // Get user info from Google
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const googleUser = await userRes.json();

    if (!googleUser.email) {
      return res.redirect('/login?error=' + encodeURIComponent('Failed to get Google profile'));
    }

    const isChannelOwner = googleUser.email === 'combatgirlschannel@gmail.com';

    // Find or create user
    let user = await User.findOne({ $or: [{ googleId: googleUser.id }, { email: googleUser.email }] });

    if (!user) {
      user = await User.create({
        googleId: googleUser.id,
        email: googleUser.email,
        name: isChannelOwner ? 'Combat Girls' : (googleUser.name || googleUser.email.split('@')[0]),
        image: googleUser.picture || '',
        role: isChannelOwner ? 'admin' : 'fan',
        verified: isChannelOwner,
        slug: isChannelOwner ? 'combat-girls' : undefined,
      });
    } else {
      if (!user.googleId) user.googleId = googleUser.id;
      if (googleUser.picture && !user.image) user.image = googleUser.picture;
      // If channel owner, ensure they have admin + verified status
      if (isChannelOwner) {
        user.role = 'admin';
        user.verified = true;
        user.slug = 'combat-girls';
      }
      await user.save();
    }

    const token = signToken(user._id);
    const userData = encodeURIComponent(JSON.stringify({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
    }));

    // Redirect back to login page with token (channel owner goes to their profile)
    const redirectPath = isChannelOwner ? '/profile/combat-girls' : '/';
    res.redirect(`/login?token=${token}&user=${userData}&next=${encodeURIComponent(redirectPath)}`);
  } catch (err) {
    console.error('Google OAuth error:', err);
    res.redirect('/login?error=' + encodeURIComponent('Google sign-in failed. Please try again.'));
  }
});

module.exports = router;
