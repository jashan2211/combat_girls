const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      maxlength: 5000,
      default: '',
    },
    athlete: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    // Tagged fighters in this video (for fight/highlight videos)
    fighter1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    fighter2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // YouTube integration
    youtubeId: {
      type: String,
      default: '',
      index: true,
    },
    youtubeUrl: {
      type: String,
      default: '',
    },
    videoUrl: {
      type: String,
      default: '',
    },
    thumbnailUrl: {
      type: String,
      default: '',
    },
    hlsUrl: {
      type: String,
      default: '',
    },
    duration: {
      type: Number, // seconds
      default: 0,
    },
    format: {
      type: String,
      enum: ['horizontal', 'vertical', 'shorts'],
      default: 'horizontal',
      index: true,
    },
    category: {
      type: String,
      enum: ['fight', 'highlight', 'training', 'behind-scenes', 'interview', 'shorts'],
      required: true,
      index: true,
    },
    tags: [{ type: String, trim: true }],
    sport: {
      type: String,
      default: '',
    },
    visibility: {
      type: String,
      enum: ['public', 'premium', 'ppv'],
      default: 'public',
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    saves: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    commentCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    shareCount: {
      type: Number,
      default: 0,
    },
    isLive: {
      type: Boolean,
      default: false,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
    },
    approved: {
      type: Boolean,
      default: false,
    },
    cloudflareStreamId: {
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
// Indexes
// ---------------------------------------------------------------------------
videoSchema.index({ createdAt: -1 });
videoSchema.index({ athlete: 1, createdAt: -1 });
videoSchema.index({ category: 1, createdAt: -1 });
videoSchema.index({ format: 1, createdAt: -1 });
videoSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Video', videoSchema);
