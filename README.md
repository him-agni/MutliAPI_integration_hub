# SaaS Integration Hub

A production-style integration demo that connects **Stripe → Slack** with a live React dashboard. Built to mirror the kind of POC a Solutions Engineer builds when showing a customer how their payment stack can trigger real-time notifications across their toolset.

> **Live flow:** A Stripe payment event hits a verified webhook → gets persisted to MongoDB → posts a Slack alert to the team → appears instantly on the dashboard.

---

## Demo

| Event Log Dashboard | Simulate Page | Slack Alert |
|---|---|---|
| Live feed, auto-refreshes every 5s | Fire test events without a real payment | Rich block-kit message with event details |

**To see it live:** Clone the repo, add your API keys, and go to `/simulate` to fire a test event. Watch the dashboard update, check your Slack channel — done.

---

## What It Does

```
Stripe Payment Event
       ↓
POST /webhooks/stripe  ← signature verified (HMAC-SHA256)
       ↓
Event saved to MongoDB  ← deduplicated by Stripe event ID
       ↓
   Slack Alert (to team channel)
       ↓
Live Event Log (React dashboard, polls every 5s)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS + TanStack Query |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Payments | Stripe Webhooks |
| Alerts | Slack Incoming Webhooks (Block Kit) |
| Tunnel | VS Code devtunnels / ngrok |

---

## Features

- **Webhook signature verification** — every inbound Stripe event is validated with HMAC-SHA256 before processing. Spoofed events are rejected with a 400.
- **Idempotent event handling** — duplicate Stripe deliveries are silently ignored via a unique index on `stripeEventId`.
- **Slack Block Kit alerts** — rich structured messages posted to a team channel on every processed event.
- **Live dashboard** — React dashboard polls every 5s, shows event type, amount, customer, status, and whether Slack fired.
- **Simulate page** — fire synthetic events from the UI without a real payment. Great for demos.
- **Filter & search** — filter the event log by event type and status.
- **Postman collection** — importable collection covering all endpoints, ready for demos.

---

## Project Structure

```
saas-integration-hub/
├── client/                        # React frontend (Vite + Tailwind)
│   └── src/
│       ├── components/            # EventLog, EventCard, StatusBadge, IntegrationCard, Navbar
│       ├── pages/                 # Dashboard, Integrations, SimulateEvent
│       ├── hooks/useEvents.js     # TanStack Query — polling + mutations
│       └── services/api.js        # Axios client
│
├── server/                        # Express backend
│   ├── config/db.js               # MongoDB connection
│   ├── controllers/               # webhookController, eventController, notificationController
│   ├── middleware/
│   │   └── validateStripeSignature.js  # HMAC webhook verification ← key interview file
│   ├── models/Event.js            # MongoDB schema + unique index on stripeEventId
│   ├── routes/                    # /webhooks, /events, /notify
│   └── services/                  # stripeService, twilioService, slackService
│
├── docs/
│   ├── SETUP.md                   # Step-by-step setup guide
│   ├── WEBHOOKS.md                # How webhook verification works
│   └── API_REFERENCE.md           # Full endpoint docs
│
├── postman/
│   └── SaaS-Integration-Hub.json  # Importable Postman collection
│
└── .env.example                   # All required environment variables
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier)
- Stripe account (test mode)
- Slack workspace with an incoming webhook configured
- VS Code devtunnels or ngrok (to receive Stripe webhooks locally)

### Install

```bash
git clone https://github.com/your-username/saas-integration-hub.git
cd saas-integration-hub
npm run install:all
```

### Configure

```bash
cp .env.example server/.env
```

Fill in `server/.env` — see [docs/SETUP.md](docs/SETUP.md) for where to find each value.

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...

MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/saas-hub

PORT=5000
```

### Run

```bash
# Terminal 1 — backend
npm run dev:server

# Terminal 2 — frontend
npm run dev:client

# Terminal 3 — expose port 5000 (for Stripe webhooks)
# Option A: VS Code → Ports tab → Forward Port 5000 → set visibility to Public
# Option B: ngrok http 5000
```

Open [http://localhost:3000](http://localhost:3000)

---

## Testing the Webhook Flow

**Option A — Simulate page (no Stripe needed)**

Go to `localhost:3000/simulate`, fill in the form, click **Fire Event**. Watch the dashboard update and check Slack.

**Option B — Real Stripe webhook**

Use the Stripe Workbench shell:
```bash
stripe trigger payment_intent.succeeded
```

Your server will receive a signed webhook, verify it, save to MongoDB, and fire Slack — all within ~1 second.

**Option C — Postman**

Import `postman/SaaS-Integration-Hub.json` and hit **Simulate Event**.

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Server health check |
| `GET` | `/events` | Paginated event log (filter by type, status) |
| `GET` | `/events/:id` | Single event by ID |
| `POST` | `/events/simulate` | Create a synthetic event |
| `DELETE` | `/events/:id` | Delete an event |
| `POST` | `/webhooks/stripe` | Stripe webhook receiver (verified) |
| `POST` | `/notify/sms` | Send SMS via Twilio |
| `POST` | `/notify/slack` | Post alert to Slack |

Full docs in [docs/API_REFERENCE.md](docs/API_REFERENCE.md).

---

## Key Technical Decisions

**Why raw body for webhook verification?**
Stripe's signature verification requires the exact raw request body — once Express parses it as JSON the bytes change and the signature check fails. The webhook route is mounted *before* `express.json()` middleware with `express.raw()` to preserve the original bytes.

**Why idempotency on `stripeEventId`?**
Stripe guarantees *at least once* delivery — the same event can arrive multiple times (retries on 5xx, network issues). A unique index on `stripeEventId` means duplicate deliveries return silently without reprocessing, preventing double SMS/Slack notifications.

**Why poll instead of WebSockets?**
For a demo project, 5s polling is simpler, more debuggable, and sufficient for the use case. A production version would use WebSockets or SSE for true real-time updates.

---

## All API keys are free

| Service | Free tier |
|---------|-----------|
| Stripe | Test mode — unlimited |
| Slack | Free workspace |
| MongoDB | Free M0 cluster (512MB) |

You can build and demo this entirely for free.

---

## Docs

- [Setup Guide](docs/SETUP.md) — step-by-step from zero to running
- [Webhook Guide](docs/WEBHOOKS.md) — how signature verification works
- [API Reference](docs/API_REFERENCE.md) — all endpoints documented

---

## Future Additions

- **Twilio SMS** — the SMS service layer is already built (`server/services/twilioService.js`) and wired into the webhook controller. Activating it requires a Twilio account with a verified number. Once credentials are added to `.env`, the server will automatically send a payment confirmation SMS to the customer on every `payment_intent.succeeded` event.
- **Email notifications** via SendGrid or Resend
- **WebSocket live updates** instead of polling for true real-time dashboard
- **Retry queue** for failed Slack/SMS deliveries using Bull + Redis
