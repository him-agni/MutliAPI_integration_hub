# Setup Guide

This guide walks you through getting SaaS Integration Hub running locally end-to-end in under 30 minutes.

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18+ | https://nodejs.org |
| npm | 9+ | bundled with Node |
| MongoDB Atlas account | free tier | https://cloud.mongodb.com |
| Stripe account | test mode | https://dashboard.stripe.com |
| Twilio trial account | free | https://www.twilio.com |
| Slack workspace | free | https://slack.com |
| ngrok | any | https://ngrok.com |

---

## 1. Clone and Install

```bash
git clone <your-repo-url>
cd saas-integration-hub

# Install all dependencies at once
npm run install:all
```

---

## 2. Configure Environment Variables

Copy the example file and fill in your credentials:

```bash
cp .env.example server/.env
```

Open `server/.env` and fill in each value (see sections below for how to find each one).

---

## 3. MongoDB Atlas

1. Log in to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a new project and a free **M0** cluster
3. Under **Database Access**, create a user with read/write permissions
4. Under **Network Access**, add `0.0.0.0/0` (allow all) for local dev
5. Click **Connect → Drivers**, copy the connection string
6. Paste it into `MONGODB_URI` — replace `<password>` with your DB user's password

```
MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/saas-hub
```

---

## 4. Stripe

### Get your secret key
1. Go to [dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys)
2. Copy the **Secret key** (starts with `sk_test_`)
3. Set `STRIPE_SECRET_KEY=sk_test_...`

### Configure the webhook (requires ngrok running first — see Step 6)
1. Start ngrok: `ngrok http 5000`
2. Copy your public URL (e.g. `https://abc123.ngrok.io`)
3. Go to [dashboard.stripe.com/test/webhooks](https://dashboard.stripe.com/test/webhooks)
4. Click **Add endpoint**
5. Endpoint URL: `https://abc123.ngrok.io/webhooks/stripe`
6. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.succeeded`, `checkout.session.completed`
7. Click **Add endpoint**, then reveal the **Signing secret**
8. Set `STRIPE_WEBHOOK_SECRET=whsec_...`

---

## 5. Twilio

1. Log in to [console.twilio.com](https://console.twilio.com)
2. From the dashboard copy your **Account SID** and **Auth Token**
3. Under **Phone Numbers → Manage → Active numbers**, copy your trial number
4. Set:
   ```
   TWILIO_ACCOUNT_SID=AC...
   TWILIO_AUTH_TOKEN=...
   TWILIO_PHONE_NUMBER=+1...
   TEST_RECIPIENT_PHONE=+1<your-verified-number>
   ```

> **Note:** Twilio trial accounts can only send SMS to verified numbers. Verify yours at [console.twilio.com/verify](https://console.twilio.com/verify).

---

## 6. Slack Incoming Webhook

1. Go to [api.slack.com/apps](https://api.slack.com/apps) → **Create New App → From scratch**
2. Name it "Integration Hub", pick your workspace
3. Under **Incoming Webhooks**, toggle **Activate Incoming Webhooks** on
4. Click **Add New Webhook to Workspace**, choose a channel (e.g. `#payments`)
5. Copy the webhook URL
6. Set `SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...`

---

## 7. Start the App

**Terminal 1 — Backend:**
```bash
npm run dev:server
# Server running on port 5000
```

**Terminal 2 — Frontend:**
```bash
npm run dev:client
# React app at http://localhost:3000
```

**Terminal 3 — ngrok tunnel (for Stripe webhooks):**
```bash
ngrok http 5000
```

---

## 8. Test the Full Flow

### Option A: Use the Simulate page
1. Open [http://localhost:3000/simulate](http://localhost:3000/simulate)
2. Fill in the form and click **Fire Event**
3. Watch it appear in the [dashboard](http://localhost:3000/dashboard)
4. Check your phone for an SMS and your Slack channel for an alert

### Option B: Use Stripe CLI (real webhook)
```bash
stripe listen --forward-to localhost:5000/webhooks/stripe
stripe trigger payment_intent.succeeded
```

### Option C: Use Postman
Import `postman/SaaS-Integration-Hub.json` and fire the **Simulate Event** request.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| `MongoDB connection error` | Wrong URI or IP not whitelisted | Check Atlas network access |
| `Webhook signature verification failed` | Wrong `STRIPE_WEBHOOK_SECRET` | Re-copy from Stripe dashboard |
| SMS not sending | Unverified recipient number | Verify number in Twilio console |
| Slack message not posting | Wrong webhook URL | Re-copy from Slack app settings |
| `Cannot GET /events` | Server not running | Run `npm run dev:server` |
