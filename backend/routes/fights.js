const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const Fight = require('../models/Fight');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');

// ---------------------------------------------------------------------------
// GET /api/fights/athlete/:id - Get fight record for an athlete
// ---------------------------------------------------------------------------
router.get('/athlete/:id', async (req, res, next) => {
  try {
    const fights = await Fight.find({ athlete: req.params.id })
      .populate('opponent.profile', 'name image slug')
      .populate('video', 'title youtubeId thumbnailUrl')
      .populate('eventRef', 'title date')
      .sort({ date: -1, order: -1 });

    res.json({ success: true, data: fights });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// POST /api/fights - Add a fight to your record (athlete only)
// ---------------------------------------------------------------------------
router.post(
  '/',
  auth,
  requireRole('athlete', 'admin'),
  [
    body('opponent.name').trim().notEmpty().withMessage('Opponent name is required'),
    body('result').isIn(['win', 'loss', 'draw', 'no-contest']).withMessage('Valid result required'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
      }

      const {
        opponent, date, event, eventRef, weightClass, rounds,
        result, method, finishRound, finishTime, video, youtubeId, notes,
      } = req.body;

      // Determine athlete: admin can specify, athletes use their own ID
      const athleteId = req.user.role === 'admin' && req.body.athlete
        ? req.body.athlete
        : req.user._id;

      const fight = await Fight.create({
        athlete: athleteId,
        opponent: {
          name: opponent.name,
          profile: opponent.profile || undefined,
        },
        date: date || undefined,
        event: event || '',
        eventRef: eventRef || undefined,
        weightClass: weightClass || '',
        rounds: rounds || 3,
        result,
        method: method || 'Decision - Unanimous',
        finishRound: finishRound || undefined,
        finishTime: finishTime || '',
        video: video || undefined,
        youtubeId: youtubeId || '',
        notes: notes || '',
      });

      // Update the athlete's fight record stats
      const allFights = await Fight.find({ athlete: athleteId });
      const record = { wins: 0, losses: 0, draws: 0, knockouts: 0, submissions: 0 };
      for (const f of allFights) {
        if (f.result === 'win') {
          record.wins++;
          if (f.method === 'KO/TKO') record.knockouts++;
          if (f.method === 'Submission') record.submissions++;
        } else if (f.result === 'loss') {
          record.losses++;
        } else if (f.result === 'draw') {
          record.draws++;
        }
      }
      await User.findByIdAndUpdate(athleteId, { fightRecord: record });

      const populated = await fight.populate('opponent.profile', 'name image slug');
      res.status(201).json({ success: true, data: populated });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// PUT /api/fights/:id - Update a fight record entry
// ---------------------------------------------------------------------------
router.put('/:id', auth, requireRole('athlete', 'admin'), async (req, res, next) => {
  try {
    const fight = await Fight.findById(req.params.id);
    if (!fight) {
      return res.status(404).json({ success: false, message: 'Fight not found' });
    }

    // Only the athlete or admin can edit
    if (req.user.role !== 'admin' && fight.athlete.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updates = {};
    const allowedFields = [
      'opponent', 'date', 'event', 'eventRef', 'weightClass', 'rounds',
      'result', 'method', 'finishRound', 'finishTime', 'video', 'youtubeId', 'notes', 'order',
    ];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const updated = await Fight.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('opponent.profile', 'name image slug')
      .populate('video', 'title youtubeId thumbnailUrl');

    // Recalculate fight record
    const allFights = await Fight.find({ athlete: fight.athlete });
    const record = { wins: 0, losses: 0, draws: 0, knockouts: 0, submissions: 0 };
    for (const f of allFights) {
      if (f.result === 'win') {
        record.wins++;
        if (f.method === 'KO/TKO') record.knockouts++;
        if (f.method === 'Submission') record.submissions++;
      } else if (f.result === 'loss') {
        record.losses++;
      } else if (f.result === 'draw') {
        record.draws++;
      }
    }
    await User.findByIdAndUpdate(fight.athlete, { fightRecord: record });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// PUT /api/fights/:id/link-video - Link a video to a fight
// ---------------------------------------------------------------------------
router.put('/:id/link-video', auth, requireRole('athlete', 'admin'), async (req, res, next) => {
  try {
    const { videoId, youtubeId } = req.body;
    const fight = await Fight.findById(req.params.id);

    if (!fight) {
      return res.status(404).json({ success: false, message: 'Fight not found' });
    }
    if (req.user.role !== 'admin' && fight.athlete.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (videoId) fight.video = videoId;
    if (youtubeId) fight.youtubeId = youtubeId;
    await fight.save();

    res.json({ success: true, data: fight });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/fights/:id - Delete a fight record entry
// ---------------------------------------------------------------------------
router.delete('/:id', auth, requireRole('athlete', 'admin'), async (req, res, next) => {
  try {
    const fight = await Fight.findById(req.params.id);
    if (!fight) {
      return res.status(404).json({ success: false, message: 'Fight not found' });
    }
    if (req.user.role !== 'admin' && fight.athlete.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Fight.findByIdAndDelete(req.params.id);

    // Recalculate fight record
    const allFights = await Fight.find({ athlete: fight.athlete });
    const record = { wins: 0, losses: 0, draws: 0, knockouts: 0, submissions: 0 };
    for (const f of allFights) {
      if (f.result === 'win') {
        record.wins++;
        if (f.method === 'KO/TKO') record.knockouts++;
        if (f.method === 'Submission') record.submissions++;
      } else if (f.result === 'loss') {
        record.losses++;
      } else if (f.result === 'draw') {
        record.draws++;
      }
    }
    await User.findByIdAndUpdate(fight.athlete, { fightRecord: record });

    res.json({ success: true, message: 'Fight deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
