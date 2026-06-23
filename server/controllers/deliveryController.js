const { processEvent } = require('../services/eventProcessor');

const DELIVERY_STATUSES = new Set(['pre_transit', 'transit', 'out_for_delivery', 'delivered', 'failure']);

function isValidEmail(value) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function simulateDeliveryUpdate(req, res) {
  const {
    trackingNumber = 'MOCK123456789',
    carrier = 'Mock Carrier',
    deliveryStatus = 'transit',
    customerEmail = 'demo@example.com',
  } = req.body;

  if (!trackingNumber || typeof trackingNumber !== 'string') {
    return res.status(400).json({ error: 'trackingNumber is required' });
  }

  if (!DELIVERY_STATUSES.has(deliveryStatus)) {
    return res.status(400).json({ error: 'Unsupported delivery status' });
  }

  if (!isValidEmail(customerEmail)) {
    return res.status(400).json({ error: 'customerEmail must be a valid email address' });
  }

  const event = await processEvent({
    type: `delivery.${deliveryStatus}`,
    source: 'delivery',
    trackingNumber,
    carrier,
    deliveryStatus,
    customerEmail,
    rawPayload: req.body,
  });

  res.status(201).json(event);
}

module.exports = { simulateDeliveryUpdate };
