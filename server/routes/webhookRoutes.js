const express = require('express');
const router = express.Router();
const validateStripeSignature = require('../middleware/validateStripeSignature');
const { handleStripeWebhook } = require('../controllers/webhookController');
const { handleShopifyInventoryWebhook } = require('../controllers/shopifyController');

router.post('/stripe', validateStripeSignature, handleStripeWebhook);
router.post('/shopify/inventory', handleShopifyInventoryWebhook);

module.exports = router;
