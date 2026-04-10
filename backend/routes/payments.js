const router = require('express').Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const Event = require('../models/Event');
const { auth } = require('../middleware/auth');
const { createNotification } = require('../services/notifications');

// ---------------------------------------------------------------------------
// POST /api/payments/checkout - Create Stripe checkout session for subscription
// ---------------------------------------------------------------------------
router.post('/checkout', auth, async (req, res, next) => {
  try {
    const { priceId } = req.body;
    if (!priceId) {
      return res.status(400).json({ success: false, message: 'Price ID is required' });
    }

    const user = await User.findById(req.user._id);

    // Create or retrieve Stripe customer
    let customerId = user.subscription?.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user._id.toString() },
      });
      customerId = customer.id;
      user.subscription = user.subscription || {};
      user.subscription.stripeCustomerId = customerId;
      await user.save();
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/profile/me?subscription=success`,
      cancel_url: `${process.env.FRONTEND_URL}/profile/me?subscription=cancelled`,
      metadata: { userId: user._id.toString() },
    });

    res.json({ success: true, data: { url: session.url, sessionId: session.id } });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// GET /api/payments/subscription
// ---------------------------------------------------------------------------
router.get('/subscription', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    const data = {
      tier: user.subscription?.tier || 'free',
      expiresAt: user.subscription?.expiresAt || null,
      stripeCustomerId: user.subscription?.stripeCustomerId || null,
    };

    // If there's an active Stripe subscription, get its details
    if (user.subscription?.stripeSubscriptionId) {
      try {
        const sub = await stripe.subscriptions.retrieve(user.subscription.stripeSubscriptionId);
        data.status = sub.status;
        data.currentPeriodEnd = new Date(sub.current_period_end * 1000);
        data.cancelAtPeriodEnd = sub.cancel_at_period_end;
      } catch {
        // Subscription may no longer exist in Stripe
        data.status = 'unknown';
      }
    }

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/payments/subscription
// ---------------------------------------------------------------------------
router.delete('/subscription', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.subscription?.stripeSubscriptionId) {
      return res.status(400).json({ success: false, message: 'No active subscription' });
    }

    // Cancel at end of billing period (graceful)
    await stripe.subscriptions.update(user.subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    res.json({ success: true, message: 'Subscription will be cancelled at end of billing period' });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// POST /api/payments/ppv - Purchase PPV event access
// ---------------------------------------------------------------------------
router.post('/ppv', auth, async (req, res, next) => {
  try {
    const { eventId } = req.body;
    if (!eventId) {
      return res.status(400).json({ success: false, message: 'Event ID is required' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    if (!event.isPPV) {
      return res.status(400).json({ success: false, message: 'Event is not a PPV event' });
    }

    const user = await User.findById(req.user._id);
    if (user.purchasedEvents?.includes(eventId)) {
      return res.status(400).json({ success: false, message: 'Event already purchased' });
    }

    // Create one-time Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: event.title,
              description: `PPV Access: ${event.title}`,
            },
            unit_amount: Math.round(event.price * 100), // cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/events/${eventId}?ppv=success`,
      cancel_url: `${process.env.FRONTEND_URL}/events/${eventId}?ppv=cancelled`,
      metadata: {
        userId: user._id.toString(),
        eventId: eventId.toString(),
      },
    });

    res.json({ success: true, data: { url: session.url, sessionId: session.id } });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// POST /api/payments/webhook - Stripe webhook handler
// Note: raw body parsing for this route is handled in server.js BEFORE json parser
// ---------------------------------------------------------------------------
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ success: false, message: `Webhook Error: ${err.message}` });
  }

  try {
    switch (event.type) {
      // ----- Checkout completed -----
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        if (!userId) break;

        if (session.mode === 'subscription' && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          const priceId = subscription.items.data[0]?.price?.id || '';

          // Map price IDs to tier names (configure these in your Stripe dashboard)
          let tier = 'basic';
          if (priceId.includes('premium')) tier = 'premium';
          else if (priceId.includes('ultimate')) tier = 'ultimate';

          await User.findByIdAndUpdate(userId, {
            'subscription.tier': tier,
            'subscription.stripeSubscriptionId': session.subscription,
            'subscription.expiresAt': new Date(subscription.current_period_end * 1000),
          });

          // TODO: emit notification via io when available in webhook context
        }

        if (session.mode === 'payment' && session.metadata?.eventId) {
          await User.findByIdAndUpdate(userId, {
            $addToSet: { purchasedEvents: session.metadata.eventId },
          });
        }
        break;
      }

      // ----- Subscription updated -----
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const user = await User.findOne({
          'subscription.stripeSubscriptionId': subscription.id,
        });
        if (user) {
          user.subscription.expiresAt = new Date(subscription.current_period_end * 1000);
          await user.save();
        }
        break;
      }

      // ----- Subscription deleted -----
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await User.findOneAndUpdate(
          { 'subscription.stripeSubscriptionId': subscription.id },
          {
            'subscription.tier': 'free',
            'subscription.stripeSubscriptionId': '',
            'subscription.expiresAt': null,
          }
        );
        break;
      }

      default:
        // Unhandled event type
        break;
    }
  } catch (err) {
    console.error('Webhook processing error:', err);
    // Still return 200 so Stripe doesn't retry
  }

  res.json({ received: true });
});

module.exports = router;
