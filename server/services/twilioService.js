const twilio = require('twilio');

const isLiveMode = process.env.SMS_MODE === 'live';
const client = isLiveMode
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

async function sendSMS(to, message) {
  if (!isLiveMode) {
    console.log(`[SMS MOCK] To: ${to} | Message: ${message}`);
    return 'mock-sid';
  }

  const response = await client.messages.create({
    to,
    from: process.env.TWILIO_PHONE_NUMBER,
    body: message,
  });

  return response.sid;
}

module.exports = { sendSMS };
