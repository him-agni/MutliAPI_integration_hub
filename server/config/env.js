const REQUIRED_ENV_VARS = [
  'MONGODB_URI',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'SLACK_WEBHOOK_URL',
  'ADMIN_API_KEY',
];

function validateEnv() {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

  if (process.env.SMS_MODE === 'live') {
    for (const key of ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_PHONE_NUMBER']) {
      if (!process.env[key]) missing.push(key);
    }
  }

  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

module.exports = { validateEnv };
