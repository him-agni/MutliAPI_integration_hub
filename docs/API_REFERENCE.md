# API Reference

Base URL: `http://localhost:5000`

---

## Health

### `GET /health`
Returns server status.

**Response**
```json
{ "status": "ok" }
```

---

## Events

### `GET /events`
Returns paginated event log.

**Query params**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | number | 50 | Results per page |
| `page` | number | 1 | Page number |
| `type` | string | — | Filter by event type |
| `status` | string | — | `pending` \| `processed` \| `failed` |

**Response**
```json
{
  "events": [...],
  "total": 42,
  "page": 1,
  "limit": 50
}
```

---

### `GET /events/:id`
Returns a single event by MongoDB ID.

---

### `POST /events/simulate`
Creates a synthetic event, fires Twilio + Slack, and returns the saved document.

**Body**
```json
{
  "type": "payment_intent.succeeded",
  "amount": 4999,
  "currency": "usd",
  "customerEmail": "demo@example.com",
  "customerPhone": "+1234567890"
}
```

`customerPhone` is optional — falls back to `TEST_RECIPIENT_PHONE` env var.

---

### `DELETE /events/:id`
Deletes a single event by ID.

---

## Webhooks

### `POST /webhooks/stripe`
Stripe webhook endpoint. **Requires a valid `Stripe-Signature` header.** Returns 400 if signature verification fails.

**Headers**
```
Content-Type: application/json (raw body)
Stripe-Signature: t=...,v1=...
```

---

## Notifications

### `POST /notify/sms`
Sends an SMS via Twilio.

**Body**
```json
{
  "to": "+1234567890",
  "message": "Your payment of $49.99 was received!"
}
```

---

### `POST /notify/slack`
Posts a block-kit message to the configured Slack channel.

**Body** — any event-shaped object:
```json
{
  "type": "payment_intent.succeeded",
  "amount": 4999,
  "currency": "usd",
  "customerEmail": "demo@example.com",
  "status": "processed"
}
```
