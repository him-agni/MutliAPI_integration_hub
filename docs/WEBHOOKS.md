# Webhook Configuration

## How Stripe Webhooks Work

When a payment event occurs in Stripe, Stripe makes an HTTP POST to your endpoint with a signed payload. The signature prevents anyone from forging events.

```
Stripe servers  →  POST /webhooks/stripe  →  Your server
                   (with Stripe-Signature header)
```

## Signature Verification

Every incoming webhook is verified in `validateStripeSignature.js`:

1. Stripe includes a `Stripe-Signature` header on every request
2. The header contains a timestamp and an HMAC-SHA256 signature
3. `stripe.webhooks.constructEvent()` recomputes the signature using your `STRIPE_WEBHOOK_SECRET` and rejects mismatches

**Why this matters in interviews:** Without signature verification, any attacker can POST fake payment events to your endpoint and trigger SMS/Slack notifications or pollute your event log.

## Idempotency

Stripe may deliver the same event more than once (retries on 5xx, network issues). The server handles this with a unique index on `stripeEventId` — duplicate events return `{ duplicate: true }` without reprocessing.

## Handled Event Types

| Event | Trigger |
|-------|---------|
| `payment_intent.succeeded` | Payment confirmed |
| `payment_intent.payment_failed` | Payment declined |
| `charge.succeeded` | Charge captured |
| `charge.failed` | Charge failed |
| `checkout.session.completed` | Checkout flow completed |

## Local Development with ngrok

Stripe can't reach `localhost`, so you need a tunnel:

```bash
# Install ngrok, then:
ngrok http 5000

# You'll see something like:
# Forwarding  https://abc123.ngrok.io -> http://localhost:5000
```

Register `https://abc123.ngrok.io/webhooks/stripe` as your Stripe webhook endpoint.

> **Tip:** ngrok URLs change on each restart. For stable local dev, use the [Stripe CLI](https://stripe.com/docs/stripe-cli) instead — it forwards directly without a public URL.

```bash
stripe listen --forward-to localhost:5000/webhooks/stripe
```
