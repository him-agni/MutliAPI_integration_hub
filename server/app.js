const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

const webhookRoutes = require('./routes/webhookRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const eventRoutes = require('./routes/eventRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');

const app = express();

function normalizeOrigin(origin) {
  return origin.trim().replace(/^['"]|['"]$/g, '').replace(/\/+$/, '');
}

const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((origin) => normalizeOrigin(origin))
  .filter(Boolean);

const vercelFrontendPattern = /^https:\/\/multi-api-integration-hub(?:-[a-z0-9-]+)?\.vercel\.app$/;

function isAllowedOrigin(origin) {
  const normalizedOrigin = normalizeOrigin(origin);
  return allowedOrigins.includes(normalizedOrigin) || vercelFrontendPattern.test(normalizedOrigin);
}

const corsOptions = allowedOrigins.includes('*')
  ? { origin: true }
  : {
      origin(origin, callback) {
        if (!origin) return callback(null, true);

        return callback(null, isAllowedOrigin(origin));
      },
    };

// Stripe and Shopify webhooks require the raw body. Mount before JSON middleware.
app.use('/webhooks', express.raw({ type: 'application/json' }), webhookRoutes);

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

app.use('/notify', notificationRoutes);
app.use('/events', eventRoutes);
app.use('/delivery', deliveryRoutes);
app.use('/inventory', inventoryRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

module.exports = app;
