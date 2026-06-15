const axios = require('axios');

async function postSlackAlert(event) {
  const amount = event.amount ? `$${(event.amount / 100).toFixed(2)} ${(event.currency || '').toUpperCase()}` : 'N/A';

  const payload = {
    text: `:credit_card: *New Payment Event*`,
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: ':credit_card: New Payment Event', emoji: true },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Type:*\n${event.type}` },
          { type: 'mrkdwn', text: `*Amount:*\n${amount}` },
          { type: 'mrkdwn', text: `*Customer:*\n${event.customerEmail || 'Unknown'}` },
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
