require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const webhookRoutes = require('./routes/webhookRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const eventRoutes = require('./routes/eventRoutes');

const app = express();

connectDB();

// Stripe webhooks require the raw body — mount before json middleware
app.use('/webhooks', express.raw({ type: 'application/json' }), webhookRoutes);

app.use(cors());
app.use(express.json());

app.use('/notify', notificationRoutes);
app.use('/events', eventRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
