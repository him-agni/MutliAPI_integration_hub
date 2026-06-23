const axios = require('axios');

async function postSlackAlert(event) {
  const amount = event.amount ? `$${(event.amount / 100).toFixed(2)} ${(event.currency || '').toUpperCase()}` : 'N/A';
  const customer = event.customerEmail || event.productTitle || event.trackingNumber || 'Unknown';

  const payload = {
    text: `Integration event: ${event.type}`,
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: 'Integration Event', emoji: true },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Type:*\n${event.type}` },
          { type: 'mrkdwn', text: `*Source:*\n${event.source || 'Unknown'}` },
          { type: 'mrkdwn', text: `*Amount:*\n${amount}` },
          { type: 'mrkdwn', text: `*Subject:*\n${customer}` },
          { type: 'mrkdwn', text: `*Status:*\n${event.status}` },
        ],
      },
      {
        type: 'context',
        elements: [
          { type: 'mrkdwn', text: `Event ID: ${event.stripeEventId || event._id} | ${new Date().toISOString()}` },
        ],
      },
    ],
  };

  await axios.post(process.env.SLACK_WEBHOOK_URL, payload);
}

module.exports = { postSlackAlert };
