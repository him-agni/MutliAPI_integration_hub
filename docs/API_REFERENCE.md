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
| `source` | string | — | `stripe` \| `shopify` \| `delivery` \| `simulate` |

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
Creates a synthetic event, fires Resend email + Slack, and returns the saved document.

**Body**
```json
{
  "type": "payment_intent.succeeded",
  "amount": 4999,
  "currency": "usd",
  "customerEmail": "demo@example.com"
}
```

`customerEmail` is used as the email recipient. If a real Stripe event has no customer email, the server falls back to `TEST_RECIPIENT_EMAIL`.

---

### `DELETE /events/:id`
Deletes a single event by ID.

---

## Inventory

### `POST /inventory/simulate`
Creates a synthetic Shopify-style low-stock event.

**Body**
```json
{
  "productTitle": "Demo Hoodie",
  "sku": "DEMO-HOODIE",
  "inventoryQuantity": 3
}
```

---

## Delivery

### `POST /delivery/simulate`
Creates a mock delivery tracking update.

**Body**
```json
{
  "trackingNumber": "MOCK123456789",
  "carrier": "Mock Carrier",
  "deliveryStatus": "transit",
  "customerEmail": "demo@example.com"
}
```

Supported delivery statuses: `pre_transit`, `transit`, `out_for_delivery`, `delivered`, `failure`.

---

## Webhooks

### `POST /webhooks/stripe`
Stripe webhook endpoint. **Requires a valid `Stripe-Signature` header.** Returns 400 if signature verification fails.

**Headers**
```

### `POST /webhooks/shopify/inventory`
Shopify inventory webhook endpoint. **Requires a valid `X-Shopify-Hmac-Sha256` header.** Returns 400 if signature verification fails.

Low-stock alerts are created when the available quantity is less than or equal to `INVENTORY_ALERT_THRESHOLD`.
Content-Type: application/json (raw body)
Stripe-Signature: t=...,v1=...
```

---

## Notifications

### `POST /notify/email`
Sends an email via Resend.

**Body**
```json
{
  "to": "demo@example.com",
  "subject": "Payment received",
  "html": "<strong>Your payment was received.</strong>"
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
