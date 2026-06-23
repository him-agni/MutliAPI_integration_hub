# Vercel Deployment Guide

Deploy this repo as two Vercel projects from the same GitHub repository.

## 1. Deploy the API

Create a Vercel project with these settings:

| Setting | Value |
|---|---|
| Framework preset | Other |
| Root directory | `server` |
| Build command | leave empty |
| Output directory | leave empty |
| Install command | `npm install` |

Add these environment variables in Vercel:

```env
MONGODB_URI=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
SLACK_WEBHOOK_URL=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
TEST_RECIPIENT_EMAIL=
INVENTORY_ALERT_EMAIL=
SHOPIFY_WEBHOOK_SECRET=
INVENTORY_ALERT_THRESHOLD=5
HUBSPOT_MODE=mock
HUBSPOT_ACCESS_TOKEN=
ADMIN_API_KEY=
CLIENT_ORIGIN=https://YOUR_FRONTEND_PROJECT.vercel.app
```

After deployment, test:

```bash
curl https://YOUR_API_PROJECT.vercel.app/health
```

Expected response:

```json
{ "status": "ok" }
```

## 2. Deploy the Frontend

Create a second Vercel project with these settings:

| Setting | Value |
|---|---|
| Framework preset | Vite |
| Root directory | `client` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Install command | `npm install` |

Add these environment variables in Vercel:

```env
VITE_API_BASE_URL=https://YOUR_API_PROJECT.vercel.app
VITE_ADMIN_API_KEY=same-value-as-server-ADMIN_API_KEY
```

After frontend deployment, return to the API project's environment variables and set the exact frontend origin.
Do not include a path. A trailing slash is okay, but this is the cleanest format:

```env
CLIENT_ORIGIN=https://YOUR_FRONTEND_PROJECT.vercel.app
```

Redeploy the API after changing `CLIENT_ORIGIN`.

## 3. Demo Checklist

- Open the frontend deployment URL.
- Visit `/simulate`.
- Fire a payment, inventory, or delivery event.
- Confirm the event appears on `/dashboard`.
- Confirm Slack and/or email receives the alert.

## Production Notes

- Use `HUBSPOT_MODE=mock` for a reliable portfolio demo.
- For Resend free-tier demos, set `TEST_RECIPIENT_EMAIL` and `INVENTORY_ALERT_EMAIL` to an email address allowed by your Resend account.
- Simulated payment events are routed to `TEST_RECIPIENT_EMAIL` so the demo does not try to email `demo@example.com`.
- Keep `ADMIN_API_KEY` long and unguessable because the demo UI uses it for mutation endpoints.
- Use Stripe test mode credentials only.
- For real Stripe webhooks, point the Stripe webhook endpoint to:

```text
https://YOUR_API_PROJECT.vercel.app/webhooks/stripe
```
