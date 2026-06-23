const express = require('express');
const router = express.Router();
const { simulateInventoryAlert } = require('../controllers/shopifyController');
const requireApiKey = require('../middleware/requireApiKey');

router.post('/simulate', requireApiKey, simulateInventoryAlert);

module.exports = router;
