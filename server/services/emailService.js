const { Resend } = require('resend');

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

function buildPaymentEmail(event) {
  const amount = event.amount
    ? `$${(event.amount / 100).toFixed(2)} ${(event.currency || '').toUpperCase()}`
    : 'N/A';

  return {
    subject: `Payment event: ${event.type}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
        <h2>Payment event received</h2>
        <p>A payment event was processed by SaaS Integration Hub.</p>
        <ul>
          <li><strong>Type:</strong> ${event.type}</li>
          <li><strong>Amount:</strong> ${amount}</li>
          <li><strong>Status:</strong> ${event.status || 'pending'}</li>
        </ul>
      </div>
    `,
  };
}

function buildDeliveryEmail(event) {
  return {
    subject: `Delivery update: ${event.deliveryStatus}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
        <h2>Your delivery status changed</h2>
        <p>Your package is now <strong>${event.deliveryStatus}</strong>.</p>
        <ul>
          <li><strong>Carrier:</strong> ${event.carrier || 'N/A'}</li>
          <li><strong>Tracking number:</strong> ${event.trackingNumber || 'N/A'}</li>
        </ul>
      </div>
    `,
  };
}

function buildInventoryEmail(event) {
  return {
    subject: `Low stock alert: ${event.productTitle || event.sku || 'Inventory item'}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
        <h2>Low stock alert</h2>
        <p>An inventory item has dropped to or below the configured threshold.</p>
        <ul>
          <li><strong>Product:</strong> ${event.productTitle || 'Unknown product'}</li>
          <li><strong>SKU:</strong> ${event.sku || 'N/A'}</li>
          <li><strong>Available:</strong> ${event.inventoryQuantity ?? 'N/A'}</li>
          <li><strong>Threshold:</strong> ${event.inventoryThreshold ?? 'N/A'}</li>
        </ul>
      </div>
    `,
  };
}

async function sendEmail({ to, subject, html, text }) {
  if (!resend) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  const from = process.env.RESEND_FROM_EMAIL || 'SaaS Integration Hub <onboarding@resend.dev>';
  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    subject,
    html,
    text,
  });

  if (error) {
    throw new Error(error.message || 'Resend email failed');
  }

  return data?.id;
}

async function sendPaymentEmail(event) {
  const to = event.customerEmail || process.env.TEST_RECIPIENT_EMAIL;
  if (!to) return null;

  const email = buildPaymentEmail(event);
  return sendEmail({ to, ...email });
}

async function sendDeliveryEmail(event) {
  const to = event.customerEmail || process.env.TEST_RECIPIENT_EMAIL;
  if (!to) return null;

  const email = buildDeliveryEmail(event);
  return sendEmail({ to, ...email });
}

async function sendInventoryEmail(event) {
  const to = process.env.INVENTORY_ALERT_EMAIL || process.env.TEST_RECIPIENT_EMAIL;
  if (!to) return null;

  const email = buildInventoryEmail(event);
  return sendEmail({ to, ...email });
}

module.exports = { sendEmail, sendPaymentEmail, sendDeliveryEmail, sendInventoryEmail };
