const express = require('express');
const router = express.Router();
const { sendEmailHandler, sendSlackHandler } = require('../controllers/notificationController');
const requireApiKey = require('../middleware/requireApiKey');

router.post('/email', requireApiKey, sendEmailHandler);
router.post('/slack', requireApiKey, sendSlackHandler);

module.exports = router;
