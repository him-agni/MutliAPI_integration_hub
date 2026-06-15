const Event = require('../models/Event');
const { sendSMS } = require('../services/twilioService');
const { postSlackAlert } = require('../services/slackService');

async function getEvents(req, res) {
  const { limit = 50, page = 1, type, status } = req.query;
  const filter = {};
  if (type) filter.type = type;
  if (status) filter.status = status;

  const events = await Event.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Event.countDocuments(filter);
  res.json({ events, total, page: Number(page), limit: Number(limit) });
}

async function getEventById(req, res) {
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

  const event = await Event.create({
    type,
    source: 'simulate',
    amount,
    currency,
    customerEmail,
    customerPhone,
    status: 'pending',
  });

  const updates = { status: 'processed' };

  const phone = customerPhone || process.env.TEST_RECIPIENT_PHONE;
  if (phone) {
    try {
      const amountFormatted = `$${(amount / 100).toFixed(2)}`;
      await sendSMS(phone, `[Simulated] Payment received: ${amountFormatted}. Thank you, ${customerEmail}!`);
      updates.smsSent = true;
    } catch (err) {
      console.error('Twilio error:', err.message);
    }
  }

  try {
    await postSlackAlert({ ...event.toObject(), ...updates });
    updates.slackAlerted = true;
  } catch (err) {
    console.error('Slack error:', err.message);
  }

  const updated = await Event.findByIdAndUpdate(event._id, updates, { new: true });
  res.status(201).json(updated);
}

async function deleteEvent(req, res) {
  await Event.findByIdAndDelete(req.params.id);
  res.json({ success: true });
}

module.exports = { getEvents, getEventById, simulateEvent, deleteEvent };
