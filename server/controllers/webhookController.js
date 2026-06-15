const Event = require('../models/Event');
const { extractEventData } = require('../services/stripeService');
const { sendSMS } = require('../services/twilioService');
const { postSlackAlert } = require('../services/slackService');

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

  let event;
  try {
    event = await Event.create({ ...data, status: 'pending' });
  } catch (err) {
    // Duplicate event — idempotency guard
    if (err.code === 11000) return res.json({ received: true, duplicate: true });
    throw err;
  }

  const updates = { status: 'pending' };
  const errors = [];

  // Send SMS if we have a phone number
  const phone = data.customerPhone || process.env.TEST_RECIPIENT_PHONE;
  if (phone) {
    try {
      const amountFormatted = data.amount ? `$${(data.amount / 100).toFixed(2)}` : '';
      await sendSMS(
        phone,
        `Payment ${stripeEvent.type === 'payment_intent.succeeded' ? 'received' : 'update'}: ${amountFormatted}. Thank you!`
      );
      updates.smsSent = true;
    } catch (err) {
      console.error('Twilio error:', err.message);
      errors.push(`Twilio: ${err.message}`);
    }
  }

  // Post Slack alert
  try {
    await postSlackAlert({ ...data, status: 'processed' });
    updates.slackAlerted = true;
  } catch (err) {
    console.error('Slack error:', err.message);
    errors.push(`Slack: ${err.message}`);
  }

  updates.status = updates.slackAlerted ? 'processed' : 'failed';
  if (errors.length) updates.errorMessage = errors.join('; ');

  await Event.findByIdAndUpdate(event._id, updates);

  res.json({ received: true });
}

module.exports = { handleStripeWebhook };
