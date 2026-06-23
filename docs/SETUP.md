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
| Shopify dev store | free for app development | https://shopify.dev |
| HubSpot account | free CRM tier | https://www.hubspot.com |
| Resend account | free tier | https://resend.com |
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
Create `client/.env`, then set `ADMIN_API_KEY` in `server/.env` to a long random string and put the same value in `client/.env` as `VITE_ADMIN_API_KEY` so the local Simulate page can call protected demo endpoints.

For local development, keep:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_ADMIN_API_KEY=<same-value-as-ADMIN_API_KEY>
```

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

### Configure the webhook (requires ngrok running first — see Start the App)
1. Start ngrok: `ngrok http 5000`
2. Copy your public URL (e.g. `https://abc123.ngrok.io`)
3. Go to [dashboard.stripe.com/test/webhooks](https://dashboard.stripe.com/test/webhooks)
4. Click **Add endpoint**
5. Endpoint URL: `https://abc123.ngrok.io/webhooks/stripe`
6. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.succeeded`, `checkout.session.completed`
7. Click **Add endpoint**, then reveal the **Signing secret**
8. Set `STRIPE_WEBHOOK_SECRET=whsec_...`

---

## 5. Resend

1. Log in to [resend.com](https://resend.com)
2. Create an API key
3. For free-tier local testing, use Resend's test sender `onboarding@resend.dev`
4. Set:
   ```
   RESEND_API_KEY=re_...
   RESEND_FROM_EMAIL=SaaS Integration Hub <onboarding@resend.dev>
   TEST_RECIPIENT_EMAIL=your-email@example.com
   ```

For production-style sending, verify your own domain in Resend and change `RESEND_FROM_EMAIL` to an address on that domain.

---

## 6. Slack Incoming Webhook

1. Go to [api.slack.com/apps](https://api.slack.com/apps) → **Create New App → From scratch**
2. Name it "Integration Hub", pick your workspace
3. Under **Incoming Webhooks**, toggle **Activate Incoming Webhooks** on
4. Click **Add New Webhook to Workspace**, choose a channel (e.g. `#payments`)
5. Copy the webhook URL
6. Set `SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...`

---

## 7. Shopify Inventory Webhook

For local demos, use `/inventory/simulate` from the Simulate page. For real Shopify webhook testing:

1. Create a Shopify app connected to a dev store
2. Subscribe an inventory-related webhook to `/webhooks/shopify/inventory`
3. Copy the webhook signing secret
4. Set:
   ```
   SHOPIFY_WEBHOOK_SECRET=shpss_...
   INVENTORY_ALERT_THRESHOLD=5
   INVENTORY_ALERT_EMAIL=ops@example.com
   ```

---

## 8. HubSpot Contact Sync

For reliable local demos, use mock mode:

```env
HUBSPOT_MODE=mock
```

Payment events will show `HubSpot Contact: Yes` and store a deterministic mock contact ID without calling HubSpot.

For live CRM creation, create a HubSpot private app token with contact write permissions and set:

```env
HUBSPOT_MODE=live
HUBSPOT_ACCESS_TOKEN=pat-...
```

If `HUBSPOT_MODE` is not `mock` and `HUBSPOT_ACCESS_TOKEN` is omitted, payment events still process normally and simply skip HubSpot.

---

## 9. Start the App

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

## 10. Test the Full Flow

### Option A: Use the Simulate page
1. Open [http://localhost:3000/simulate](http://localhost:3000/simulate)
2. Choose Payment, Inventory, or Delivery and click the scenario button
3. Watch it appear in the [dashboard](http://localhost:3000/dashboard)
4. Check your inbox for an email and your Slack channel for an alert

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
| Email not sending | Missing Resend API key or sender issue | Check `RESEND_API_KEY` and `RESEND_FROM_EMAIL` |
| HubSpot skipped | Mock mode disabled and missing private app token | Set `HUBSPOT_MODE=mock` or provide `HUBSPOT_ACCESS_TOKEN` |
| Shopify webhook rejected | Wrong signing secret | Re-copy `SHOPIFY_WEBHOOK_SECRET` |
| Slack message not posting | Wrong webhook URL | Re-copy from Slack app settings |
| `Cannot GET /events` | Server not running | Run `npm run dev:server` |
| `Invalid or missing API key` | `ADMIN_API_KEY` and `VITE_ADMIN_API_KEY` do not match | Copy the same demo key into `server/.env` and `client/.env` |
