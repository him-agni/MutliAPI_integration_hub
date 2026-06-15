const { sendSMS } = require('../services/twilioService');
const { postSlackAlert } = require('../services/slackService');

async function sendSMSHandler(req, res) {
  const { to, message } = req.body;
  if (!to || !message) {
    return res.status(400).json({ error: 'to and message are required' });
  }
  const sid = await sendSMS(to, message);
  res.json({ success: true, sid });
}

async function sendSlackHandler(req, res) {
  const event = req.body;
  await postSlackAlert(event);
  res.json({ success: true });
}

module.exports = { sendSMSHandler, sendSlackHandler };
