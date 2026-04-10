const router = require('express').Router();
const Event = require('../models/Event');
const { auth, optionalAuth } = require('../middleware/auth');
const { createNotification } = require('../services/notifications');

// ---------------------------------------------------------------------------
// GET /api/events
// ---------------------------------------------------------------------------
router.get('/', async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [events, total] = await Promise.all([
      Event.find(query)
        .populate('fightCard.fighter1', 'name image weightClass verified')
        .populate('fightCard.fighter2', 'name image weightClass verified')
        .sort({ date: status === 'completed' ? -1 : 1 })
        .limit(Number(limit))
        .skip(skip),
      Event.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: events,
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
// GET /api/events/:id
// ---------------------------------------------------------------------------
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('fightCard.fighter1', 'name image weightClass fightRecord verified discipline')
      .populate('fightCard.fighter2', 'name image weightClass fightRecord verified discipline')
      .populate('fightCard.result.winner', 'name image')
      .populate('createdBy', 'name');

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const eventData = event.toObject();
    eventData.isInterested = req.user
      ? event.interestedUsers.includes(req.user._id)
      : false;
    eventData.hasPurchased = req.user
      ? req.user.purchasedEvents?.includes(event._id)
      : false;
    eventData.stats = {
      interested: event.interestedUsers.length,
      watching: event.watchingCount,
    };

    res.json({ success: true, data: eventData });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// POST /api/events/:id/interested
// ---------------------------------------------------------------------------
router.post('/:id/interested', auth, async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const isInterested = event.interestedUsers.includes(req.user._id);

    if (isInterested) {
      event.interestedUsers = event.interestedUsers.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
    } else {
      event.interestedUsers.push(req.user._id);
    }
    await event.save();

    res.json({
      success: true,
      data: {
        interested: !isInterested,
        count: event.interestedUsers.length,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
