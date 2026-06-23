const Event = require('../models/Event');
const mongoose = require('mongoose');
const { processEvent } = require('../services/eventProcessor');

const EVENT_TYPES = new Set([
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'charge.succeeded',
  'charge.failed',
  'checkout.session.completed',
  'shopify.inventory.low_stock',
  'delivery.pre_transit',
  'delivery.transit',
  'delivery.out_for_delivery',
  'delivery.delivered',
  'delivery.failure',
]);

const STATUSES = new Set(['pending', 'processed', 'failed']);
const SOURCES = new Set(['stripe', 'shopify', 'delivery', 'simulate']);
const CURRENCIES = new Set(['usd', 'eur', 'gbp', 'cad', 'aud']);

function parsePositiveInteger(value, fallback, max) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
}

function isValidEmail(value) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function getEvents(req, res) {
  const { type, status, source } = req.query;
  const limit = parsePositiveInteger(req.query.limit, 50, 100);
  const page = parsePositiveInteger(req.query.page, 1, 10000);

  if (type && !EVENT_TYPES.has(type)) {
    return res.status(400).json({ error: 'Unsupported event type' });
  }

  if (status && !STATUSES.has(status)) {
    return res.status(400).json({ error: 'Unsupported status' });
  }

  if (source && !SOURCES.has(source)) {
    return res.status(400).json({ error: 'Unsupported source' });
  }

  const filter = {};
  if (type) filter.type = type;
  if (status) filter.status = status;
  if (source) filter.source = source;

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

  const updated = await processEvent({
    type,
    source: 'simulate',
    amount,
    currency,
    customerEmail,
  });
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
