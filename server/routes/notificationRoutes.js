const express = require('express');
const router = express.Router();
const { sendSMSHandler, sendSlackHandler } = require('../controllers/notificationController');

router.post('/sms', sendSMSHandler);
router.post('/slack', sendSlackHandler);

module.exports = router;
