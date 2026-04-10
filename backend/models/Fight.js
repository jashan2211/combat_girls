const mongoose = require('mongoose');

const fightSchema = new mongoose.Schema(
  {
    // The athlete who owns this fight record entry
    athlete: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Opponent info
    opponent: {
      name: { type: String, required: true },
      profile: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // optional link to opponent's profile
    },
    // Fight details
    date: { type: Date },
    event: { type: String, default: '' }, // event name
    eventRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' }, // optional link to event
    weightClass: { type: String, default: '' },
    rounds: { type: Number, default: 3 },
    // Result
    result: {
      type: String,
      enum: ['win', 'loss', 'draw', 'no-contest'],
      required: true,
    },
    method: {
      type: String,
      enum: ['KO/TKO', 'Submission', 'Decision - Unanimous', 'Decision - Split', 'Decision - Majority', 'DQ', 'Other'],
      default: 'Decision - Unanimous',
    },
    finishRound: { type: Number },
    finishTime: { type: String, default: '' }, // e.g., "2:34"
    // Linked video
    video: { type: mongoose.Schema.Types.ObjectId, ref: 'Video' },
    youtubeId: { type: String, default: '' }, // direct YouTube link if no Video doc
    // Notes
    notes: { type: String, maxlength: 500, default: '' },
    // Order for display (most recent first)
    order: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

fightSchema.index({ athlete: 1, date: -1 });
fightSchema.index({ athlete: 1, order: 1 });

module.exports = mongoose.model('Fight', fightSchema);
