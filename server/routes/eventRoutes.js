const express = require('express');
const router = express.Router();
const { getEvents, getEventById, simulateEvent, deleteEvent } = require('../controllers/eventController');
const requireApiKey = require('../middleware/requireApiKey');

router.get('/', getEvents);
router.get('/:id', getEventById);
router.post('/simulate', requireApiKey, simulateEvent);
router.delete('/:id', requireApiKey, deleteEvent);

module.exports = router;
