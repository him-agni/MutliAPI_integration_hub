const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

async function sendSMS(to, message) {
  console.log(`[SMS MOCK] To: ${to} | Message: ${message}`);
  return "mock-sid";
}

module.exports = { sendSMS };
