const Event = require('../models/Event');
const mongoose = require('mongoose');
const { sendSMS } = require('../services/twilioService');
const { postSlackAlert } = require('../services/slackService');

const EVENT_TYPES = new Set([
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'charge.succeeded',
  'charge.failed',
  'checkout.session.completed',
]);

const STATUSES = new Set(['pending', 'processed', 'failed']);
const CURRENCIES = new Set(['usd', 'eur', 'gbp', 'cad', 'aud']);

function parsePositiveInteger(value, fallback, max) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
}

function isValidEmail(value) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value) {
  return typeof value === 'string' && /^\+[1-9]\d{7,14}$/.test(value);
}

async function getEvents(req, res) {
  const { type, status } = req.query;
  const limit = parsePositiveInteger(req.query.limit, 50, 100);
  const page = parsePositiveInteger(req.query.page, 1, 10000);

  if (type && !EVENT_TYPES.has(type)) {
    return res.status(400).json({ error: 'Unsupported event type' });
  }

  if (status && !STATUSES.has(status)) {
    return res.status(400).json({ error: 'Unsupported status' });
  }

  const filter = {};
  if (type) filter.type = type;
  if (status) filter.status = status;

  const events = await Event.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Event.countDocuments(filter);
  res.json({ events, total, page, limit });
}

async function getEventById(req, res) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid event ID' });
  }

  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  res.json(event);
}

async function simulateEvent(req, res) {
  const {
    type = 'payment_intent.succeeded',
    amount = 4999,
    currency = 'usd',
    customerEmail = 'demo@example.com',
    customerPhone,
  } = req.body;

  if (!EVENT_TYPES.has(type)) {
    return res.status(400).json({ error: 'Unsupported event type' });
  }

  if (!Number.isInteger(amount) || amount < 1 || amount > 99999999) {
    return res.status(400).json({ error: 'amount must be an integer number of cents between 1 and 99999999' });
  }

  if (!CURRENCIES.has(currency)) {
    return res.status(400).json({ error: 'Unsupported currency' });
  }

  if (!isValidEmail(customerEmail)) {
    return res.status(400).json({ error: 'customerEmail must be a valid email address' });
  }

  if (customerPhone && !isValidPhone(customerPhone)) {
    return res.status(400).json({ error: 'customerPhone must be in E.164 format, for example +12345678900' });
  }

  const event = await Event.create({
    type,
    source: 'simulate',
    amount,
    currency,
    customerEmail,
    customerPhone,
    status: 'pending',
  });

  const updates = { status: 'pending' };
  const errors = [];

  const phone = customerPhone || process.env.TEST_RECIPIENT_PHONE;
  if (phone) {
    try {
      const amountFormatted = `$${(amount / 100).toFixed(2)}`;
      await sendSMS(phone, `[Simulated] Payment received: ${amountFormatted}. Thank you, ${customerEmail}!`);
      updates.smsSent = true;
    } catch (err) {
      console.error('Twilio error:', err.message);
      errors.push(`Twilio: ${err.message}`);
    }
  }

  try {
    await postSlackAlert({ ...event.toObject(), status: 'processed' });
    updates.slackAlerted = true;
  } catch (err) {
    console.error('Slack error:', err.message);
    errors.push(`Slack: ${err.message}`);
  }

  updates.status = updates.slackAlerted ? 'processed' : 'failed';
  if (errors.length) updates.errorMessage = errors.join('; ');

  const updated = await Event.findByIdAndUpdate(event._id, updates, { new: true });
  res.status(201).json(updated);
}

async function deleteEvent(req, res) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid event ID' });
  }

  const event = await Event.findByIdAndDelete(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  res.json({ success: true });
}

module.exports = { getEvents, getEventById, simulateEvent, deleteEvent };
