const { constructEvent } = require('../services/stripeService');

function validateStripeSignature(req, res, next) {
  const signature = req.headers['stripe-signature'];

  if (!signature) {
    return res.status(400).json({ error: 'Missing stripe-signature header' });
  }

  try {
    // req.body is the raw Buffer because we mounted this route before express.json()
    const event = constructEvent(req.body, signature);
    req.stripeEvent = event;
    next();
  } catch (err) {
    // Signature mismatch — reject immediately, log attempt
    console.error('Stripe signature verification failed:', err.message);
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }
}

module.exports = validateStripeSignature;
