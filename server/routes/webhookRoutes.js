const express = require('express');
const router = express.Router();
const validateStripeSignature = require('../middleware/validateStripeSignature');
const { handleStripeWebhook } = require('../controllers/webhookController');

router.post('/stripe', validateStripeSignature, handleStripeWebhook);

module.exports = router;
