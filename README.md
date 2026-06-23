# SaaS Integration Hub

A production-style commerce integration demo that connects **Stripe, Shopify, Resend, Slack, MongoDB, mock delivery tracking, and optional HubSpot CRM sync** behind a live React dashboard.

This project mirrors the kind of proof of concept a Solutions Engineer builds for a customer: one operational hub that receives commerce events, verifies webhooks, persists a normalized event history, and fans out downstream notifications.

> **Live flow:** Payment, inventory, or delivery event -> normalized Express API -> MongoDB event log -> Slack, email, and optional CRM sync -> React dashboard.

---

## Demo Screenshots

### Live Event Dashboard

The dashboard polls the API every 5 seconds and shows processed payment, inventory, and delivery events with downstream action status.

![Live event dashboard](docs/screenshots/dashboard.png)

### Event Simulator

The simulator can trigger payment, inventory, and delivery scenarios without waiting for real third-party webhooks.

![Event simulator](docs/screenshots/simulate.png)

### Slack and Email Notifications

Processed events fan out to Slack and Resend email notifications.

![Slack and email notifications](docs/screenshots/slack-email.png)

---

## Architecture

```mermaid
flowchart LR
  subgraph Sources["Event Sources"]
    Stripe["Stripe Webhooks"]
    Shopify["Shopify Inventory Webhooks"]
    Simulator["React Simulator"]
    Delivery["Mock Delivery Updates"]
  end

  subgraph API["Express API"]
    Verify["Signature + API Key Validation"]
    Normalize["Normalize Event Payload"]
    Processor["Event Processor"]
  end

  Mongo[("MongoDB Event Store")]

  subgraph Fanout["Downstream Actions"]
    Slack["Slack Alert"]
    Email["Resend Email"]
    HubSpot["HubSpot Contact Sync<br/>optional/mockable"]
  end

  Dashboard["React Dashboard<br/>polls every 5s"]

  Stripe --> Verify
  Shopify --> Verify
  Simulator --> Verify
  Delivery --> Verify
  Verify --> Normalize --> Processor
  Processor --> Mongo
  Processor --> Slack
  Processor --> Email
  Processor --> HubSpot
  Mongo --> Dashboard
```

### What It Demonstrates

- Secure webhook ingestion with raw-body signature verification.
- Idempotent event processing for retry-prone webhook systems.
- A normalized event model that supports multiple sources.
- Operational fanout to Slack, email, and optional CRM sync.
- A live dashboard and simulator for repeatable demos.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS + TanStack Query |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Payments | Stripe Webhooks |
| Alerts | Slack Incoming Webhooks (Block Kit) + Resend Email |
| Tunnel | VS Code devtunnels / ngrok |

---

## Features

- **Webhook signature verification** — every inbound Stripe event is validated with HMAC-SHA256 before processing. Spoofed events are rejected with a 400.
- **Idempotent event handling** — duplicate Stripe deliveries are silently ignored via a unique index on `stripeEventId`.
- **Slack Block Kit alerts** — rich structured messages posted to a team channel on every processed event.
- **Resend email notifications** — customer-facing payment emails using Resend's free-tier-friendly Node SDK.
- **Shopify inventory alerts** — signed inventory webhooks create low-stock operational alerts.
- **HubSpot contact sync** — payment events create or update CRM contacts by email.
- **Mock delivery tracking** — free-tier-safe shipment milestones for post-purchase demos.
- **Live dashboard** — React dashboard polls every 5s, shows event source, event details, delivery status, inventory state, and downstream actions.
- **Simulate page** — fire synthetic payment, inventory, and delivery events from the UI. Great for demos.
- **Filter & search** — filter the event log by source, event type, and status.
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
│   └── services/                  # stripeService, shopifyService, hubspotService, emailService, slackService
│
├── docs/
│   ├── SETUP.md                   # Step-by-step setup guide
│   ├── WEBHOOKS.md                # How webhook verification works
│   ├── API_REFERENCE.md           # Full endpoint docs
│   └── screenshots/               # Working demo screenshots
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
git clone https://github.com/him-agni/MutliAPI_integration_hub.git
cd MutliAPI_integration_hub
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

RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=SaaS Integration Hub <onboarding@resend.dev>
TEST_RECIPIENT_EMAIL=you@example.com
INVENTORY_ALERT_EMAIL=ops@example.com

SHOPIFY_WEBHOOK_SECRET=shpss_...
INVENTORY_ALERT_THRESHOLD=5

HUBSPOT_MODE=mock
HUBSPOT_ACCESS_TOKEN=pat-...

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

## Verified Testing Flow

The following flows have been tested as the core demo path:

| Flow | How to trigger | Expected result |
|---|---|---|
| Backend health | `GET /health` | `{ "status": "ok" }` |
| Direct email | `POST /notify/email` | Resend accepts email and Gmail receives it |
| Direct Slack | `POST /notify/slack` | Slack channel receives an integration alert |
| Payment simulation | Simulate page → Payment | Dashboard event + email + Slack |
| Inventory simulation | Simulate page → Inventory | Low-stock event + email + Slack |
| Delivery simulation | Simulate page → Delivery | Delivery event + email + Slack |
| Real Shopify store-admin webhook | Shopify inventory update | Dashboard `shopify.inventory.low_stock` event + email + Slack |

Use `HUBSPOT_MODE=mock` for reliable local demos. Payment events will show `HubSpot Contact: Yes` and store a deterministic mock contact ID without requiring HubSpot signup.

For Resend free-tier testing, send to the Resend account email and use the test sender:

```env
RESEND_FROM_EMAIL=SaaS Integration Hub <onboarding@resend.dev>
TEST_RECIPIENT_EMAIL=your-resend-account-email@example.com
INVENTORY_ALERT_EMAIL=your-resend-account-email@example.com
```

### Simulate Page

Go to `localhost:3000/simulate`, choose **Payment**, **Inventory**, or **Delivery**, and fire the scenario. Watch the dashboard update and check Slack/email.

### Real Stripe Webhook

Start the Stripe CLI listener:

```bash
stripe listen --forward-to localhost:5000/webhooks/stripe
```

Copy the printed `whsec_...` value into `STRIPE_WEBHOOK_SECRET`, restart the backend, then trigger:

```bash
stripe trigger payment_intent.succeeded
```

Your server will receive a signed webhook, verify it, save to MongoDB, and fire configured downstream actions.

### Real Shopify Webhook

For local testing, expose port `5000` with VS Code dev tunnels or ngrok and create a Shopify store-admin webhook pointing to:

```text
https://YOUR_PUBLIC_TUNNEL_URL/webhooks/shopify/inventory
```

Use an inventory-related topic such as inventory level update, JSON format, and set:

```env
SHOPIFY_WEBHOOK_SECRET=your-shopify-webhook-secret-or-app-client-secret
INVENTORY_ALERT_THRESHOLD=5
```

Then update a dev-store product's inventory to a value at or below the threshold.

**Shopify monitoring note:** If the webhook was created from **Shopify Admin → Settings → Notifications → Webhooks**, the event may not appear in the developer dashboard's **Monitoring → Webhooks** charts. That monitoring view is primarily useful for app-managed webhook subscriptions. The integration is still verified if Shopify inventory changes create dashboard events and trigger Slack/email.

### Postman

Import `postman/SaaS-Integration-Hub.json` and hit **Simulate Event**.

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Server health check |
| `GET` | `/events` | Paginated event log (filter by type, status) |
| `GET` | `/events/:id` | Single event by ID |
| `POST` | `/events/simulate` | Create a synthetic event |
| `POST` | `/inventory/simulate` | Create a synthetic low-stock event |
| `POST` | `/delivery/simulate` | Create a synthetic delivery update |
| `DELETE` | `/events/:id` | Delete an event |
| `POST` | `/webhooks/stripe` | Stripe webhook receiver (verified) |
| `POST` | `/webhooks/shopify/inventory` | Shopify inventory webhook receiver (verified) |
| `POST` | `/notify/email` | Send email via Resend |
| `POST` | `/notify/slack` | Post alert to Slack |

Full docs in [docs/API_REFERENCE.md](docs/API_REFERENCE.md).

---

## Key Technical Decisions

**Why raw body for webhook verification?**
Stripe's signature verification requires the exact raw request body — once Express parses it as JSON the bytes change and the signature check fails. The webhook route is mounted *before* `express.json()` middleware with `express.raw()` to preserve the original bytes.

**Why idempotency on `stripeEventId`?**
Stripe guarantees *at least once* delivery — the same event can arrive multiple times (retries on 5xx, network issues). A unique index on `stripeEventId` means duplicate deliveries return silently without reprocessing, preventing double email/Slack notifications.

**Why poll instead of WebSockets?**
For a demo project, 5s polling is simpler, more debuggable, and sufficient for the use case. A production version would use WebSockets or SSE for true real-time updates.

---

## All API keys are free

| Service | Free tier |
|---------|-----------|
| Stripe | Test mode — unlimited |
| Slack | Free workspace |
| MongoDB | Free M0 cluster (512MB) |
| Resend | Free developer/testing tier |
| Shopify | Development store for app testing |
| HubSpot | Free CRM/private app token when signup is available |

You can build and demo this entirely for free.

---

## Docs

- [Setup Guide](docs/SETUP.md) — step-by-step from zero to running
- [Webhook Guide](docs/WEBHOOKS.md) — how signature verification works
- [API Reference](docs/API_REFERENCE.md) — all endpoints documented

---

## Future Additions

- **Hosted email templates** via Resend
- **WebSocket live updates** instead of polling for true real-time dashboard
- **Retry queue** for failed Slack/email deliveries using Bull + Redis
