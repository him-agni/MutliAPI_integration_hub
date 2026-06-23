const { sendEmail } = require('../services/emailService');
const { postSlackAlert } = require('../services/slackService');

async function sendEmailHandler(req, res) {
  const { to, subject, html, text } = req.body;
  if (!to || !subject || (!html && !text)) {
    return res.status(400).json({ error: 'to, subject, and html or text are required' });
  }
  try {
    const id = await sendEmail({ to, subject, html, text });
    res.json({ success: true, id });
  } catch (err) {
    res.status(502).json({ error: err.message || 'Email provider request failed' });
  }
}

async function sendSlackHandler(req, res) {
  const event = req.body;
  try {
    await postSlackAlert(event);
    res.json({ success: true });
  } catch (err) {
    res.status(502).json({ error: err.message || 'Slack provider request failed' });
  }
}

module.exports = { sendEmailHandler, sendSlackHandler };
