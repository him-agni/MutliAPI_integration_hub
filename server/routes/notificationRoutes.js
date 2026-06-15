const express = require('express');
const router = express.Router();
const { sendSMSHandler, sendSlackHandler } = require('../controllers/notificationController');
const requireApiKey = require('../middleware/requireApiKey');

router.post('/sms', requireApiKey, sendSMSHandler);
router.post('/slack', requireApiKey, sendSlackHandler);

module.exports = router;
