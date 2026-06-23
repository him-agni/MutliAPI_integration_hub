const express = require('express');
const router = express.Router();
const { simulateDeliveryUpdate } = require('../controllers/deliveryController');
const requireApiKey = require('../middleware/requireApiKey');

router.post('/simulate', requireApiKey, simulateDeliveryUpdate);

module.exports = router;
