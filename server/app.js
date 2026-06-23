const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

const webhookRoutes = require('./routes/webhookRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const eventRoutes = require('./routes/eventRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');

const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Stripe and Shopify webhooks require the raw body. Mount before JSON middleware.
app.use('/webhooks', express.raw({ type: 'application/json' }), webhookRoutes);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.use('/notify', notificationRoutes);
app.use('/events', eventRoutes);
app.use('/delivery', deliveryRoutes);
app.use('/inventory', inventoryRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

module.exports = app;
