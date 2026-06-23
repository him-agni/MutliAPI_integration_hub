const Event = require('../models/Event');
const { extractEventData } = require('../services/stripeService');
const { processEvent } = require('../services/eventProcessor');

const HANDLED_EVENTS = new Set([
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'charge.succeeded',
  'charge.failed',
  'checkout.session.completed',
]);

async function handleStripeWebhook(req, res) {
  const stripeEvent = req.stripeEvent;

  if (!HANDLED_EVENTS.has(stripeEvent.type)) {
    return res.json({ received: true, handled: false });
  }

  const data = extractEventData(stripeEvent);

  try {
    await processEvent(data);
  } catch (err) {
    // Duplicate event — idempotency guard
    if (err.code === 11000) return res.json({ received: true, duplicate: true });
    throw err;
  }

  res.json({ received: true });
}

module.exports = { handleStripeWebhook };
