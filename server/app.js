const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

const webhookRoutes = require('./routes/webhookRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const eventRoutes = require('./routes/eventRoutes');

const app = express();

// Stripe webhooks require the raw body. Mount before JSON middleware.
app.use('/webhooks', express.raw({ type: 'application/json' }), webhookRoutes);

app.use(cors());
app.use(express.json());

app.use('/notify', notificationRoutes);
app.use('/events', eventRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

module.exports = app;
