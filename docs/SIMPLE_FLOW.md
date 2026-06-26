# Simple App Flow

```mermaid
flowchart TD
  A[Customer or business event] --> B{Event source}

  B --> C[Stripe payment]
  B --> D[Shopify inventory]
  B --> E[Delivery update]
  B --> F[Manual simulator]

  C --> G[Express API]
  D --> G
  E --> G
  F --> G

  G --> H[Validate request]
  H --> I[Normalize event]
  I --> J[(MongoDB event log)]

  I --> K[Send Slack alert]
  I --> L[Send email via Resend]
  I --> M[Create HubSpot contact mock/live]

  J --> N[React dashboard]
  N --> O[User views event status]
```

## Plain-English Version

1. A payment, inventory, delivery, or test event happens.
2. The backend receives and validates the event.
3. The app saves a normalized event record in MongoDB.
4. The app sends alerts to Slack, email, and optionally HubSpot.
5. The dashboard shows the latest event status for the user.
