const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: 6,
      select: false, // don't return password by default
    },
    image: {
      type: String,
      default: '',
    },
    banner: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['fan', 'athlete', 'admin'],
      default: 'fan',
    },
    bio: {
      type: String,
      maxlength: 1000,
      default: '',
    },
    verified: {
      type: Boolean,
      default: false,
    },

    // Athlete-specific fields
    fightRecord: {
      wins: { type: Number, default: 0 },
      losses: { type: Number, default: 0 },
      draws: { type: Number, default: 0 },
      knockouts: { type: Number, default: 0 },
      submissions: { type: Number, default: 0 },
    },
    weightClass: {
      type: String,
      default: '',
    },
    gym: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
    },
    discipline: [
      {
        type: String,
        enum: [
          'mma',
          'boxing',
          'muay-thai',
          'kickboxing',
          'jiu-jitsu',
          'wrestling',
          'judo',
          'karate',
          'taekwondo',
          'other',
        ],
      },
    ],

    // Social
    socialLinks: {
      instagram: { type: String, default: '' },
      twitter: { type: String, default: '' },
      youtube: { type: String, default: '' },
      tiktok: { type: String, default: '' },
      website: { type: String, default: '' },
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    savedVideos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],

    // Subscription / payments
    subscription: {
      tier: {
        type: String,
        enum: ['free', 'basic', 'premium', 'ultimate'],
        default: 'free',
      },
      stripeCustomerId: { type: String, default: '' },
      stripeSubscriptionId: { type: String, default: '' },
      expiresAt: { type: Date },
    },
    purchasedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],

    // Profile status (for pre-created athlete profiles)
    profileStatus: {
      type: String,
      enum: ['unclaimed', 'pending', 'claimed', 'verified'],
      default: 'claimed', // regular signups are 'claimed', imported profiles are 'unclaimed'
    },
    claimRequest: {
      requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      requestedAt: { type: Date },
      message: { type: String, default: '' },
      proofUrl: { type: String, default: '' },
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    },

    // Athlete premium subscription
    athleteSubscription: {
      active: { type: Boolean, default: false },
      tier: { type: String, enum: ['free', 'premium'], default: 'free' },
      stripeSubscriptionId: { type: String, default: '' },
      expiresAt: { type: Date },
    },

    // Physical attributes (from UFC data)
    nickname: { type: String, default: '' },
    height: { type: String, default: '' },
    reach: { type: String, default: '' },
    stance: { type: String, default: '' },
    dateOfBirth: { type: String, default: '' },
    slug: { type: String, default: '' },
    ufcStatsUrl: { type: String, default: '' },
    mmaSocialUrl: { type: String, default: '' },

    // OAuth
    googleId: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ---------------------------------------------------------------------------
// Virtuals
// ---------------------------------------------------------------------------
userSchema.virtual('stats').get(function () {
  return {
    followerCount: this.followers ? this.followers.length : 0,
    followingCount: this.following ? this.following.length : 0,
  };
});

// ---------------------------------------------------------------------------
// Pre-save: hash password
// ---------------------------------------------------------------------------
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// Instance method: compare password
// ---------------------------------------------------------------------------
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ---------------------------------------------------------------------------
// Indexes
// ---------------------------------------------------------------------------
// email index created automatically by unique: true
userSchema.index({ role: 1 });
userSchema.index({ profileStatus: 1 });
userSchema.index({ slug: 1 });
userSchema.index({ name: 'text', bio: 'text', nickname: 'text' });

module.exports = mongoose.model('User', userSchema);
