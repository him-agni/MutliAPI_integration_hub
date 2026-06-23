const Event = require('../models/Event');
const { sendPaymentEmail, sendDeliveryEmail, sendInventoryEmail } = require('./emailService');
const { createOrUpdateContact } = require('./hubspotService');
const { postSlackAlert } = require('./slackService');

function shouldCreateContact(event) {
  return Boolean(event.customerEmail && ['stripe', 'simulate'].includes(event.source));
}

async function processEvent(eventInput) {
  const event = await Event.create({ ...eventInput, status: 'pending' });
  const updates = { status: 'pending' };
  const errors = [];

  try {
    let emailId = null;
    if (event.source === 'delivery') {
      emailId = await sendDeliveryEmail({ ...event.toObject(), status: 'processed' });
    } else if (event.source === 'shopify') {
      emailId = await sendInventoryEmail({ ...event.toObject(), status: 'processed' });
    } else {
      emailId = await sendPaymentEmail({ ...event.toObject(), status: 'processed' });
    }
    if (emailId) updates.emailSent = true;
  } catch (err) {
    console.error('Resend error:', err.message);
    errors.push(`Resend: ${err.message}`);
  }

  if (shouldCreateContact(event)) {
    try {
      const hubspotContactId = await createOrUpdateContact(event.toObject());
      if (hubspotContactId) {
        updates.hubspotContactCreated = true;
        updates.hubspotContactId = hubspotContactId;
      }
    } catch (err) {
      console.error('HubSpot error:', err.message);
      errors.push(`HubSpot: ${err.message}`);
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

  return Event.findByIdAndUpdate(event._id, updates, { new: true });
}

module.exports = { processEvent };
