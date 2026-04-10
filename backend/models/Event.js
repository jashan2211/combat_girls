const mongoose = require('mongoose');

const fightSchema = new mongoose.Schema(
  {
    fighter1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fighter2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    weightClass: {
      type: String,
      default: '',
    },
    rounds: {
      type: Number,
      default: 3,
    },
    isMainEvent: {
      type: Boolean,
      default: false,
    },
    result: {
      winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      method: { type: String, default: '' }, // KO, TKO, Submission, Decision, etc.
      round: { type: Number },
      time: { type: String, default: '' },
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { _id: true }
);

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: 300,
    },
    description: {
      type: String,
      maxlength: 5000,
      default: '',
    },
    bannerImage: {
      type: String,
      default: '',
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    venue: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['upcoming', 'live', 'completed'],
      default: 'upcoming',
    },
    isPPV: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      default: 0,
    },
    fightCard: [fightSchema],
    streamUrl: {
      type: String,
      default: '',
    },
    interestedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    watchingCount: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

eventSchema.index({ date: 1 });
eventSchema.index({ status: 1 });

module.exports = mongoose.model('Event', eventSchema);
