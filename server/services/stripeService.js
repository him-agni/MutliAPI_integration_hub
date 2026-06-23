const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

function constructEvent(rawBody, signature) {
  return stripe.webhooks.constructEvent(
    rawBody,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
}

function extractEventData(event) {
  const obj = event.data.object;
  return {
    stripeEventId: event.id,
    type: event.type,
    amount: obj.amount ?? obj.amount_total ?? null,
    currency: obj.currency ?? null,
    customerEmail: obj.receipt_email ?? obj.customer_email ?? null,
    rawPayload: event,
  };
}

module.exports = { constructEvent, extractEventData };
