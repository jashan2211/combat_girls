const Notification = require('../models/Notification');

/**
 * Create a notification and emit it via Socket.io in real time.
 *
 * @param {object} opts
 * @param {string} opts.user    - Recipient user ID
 * @param {string} opts.type    - Notification type
 * @param {string} opts.message - Human-readable message
 * @param {string} [opts.from]  - Sender user ID
 * @param {string} [opts.link]  - Frontend route to navigate to
 * @param {object} [opts.io]    - Socket.io server instance (pass req.app.get('io'))
 */
async function createNotification({ user, type, message, from, link, io }) {
  try {
    const notification = await Notification.create({
      user,
      type,
      message,
      from: from || undefined,
      link: link || '',
    });

    // Populate sender info for the real-time event
    const populated = await notification.populate('from', 'name image');

    // Emit to the recipient's personal room
    if (io) {
      io.to(user.toString()).emit('notification', populated);
    }

    return notification;
  } catch (err) {
    console.error('Create notification error:', err);
    // Don't throw -- notification failures shouldn't break the main flow
    return null;
  }
}

module.exports = { createNotification };
