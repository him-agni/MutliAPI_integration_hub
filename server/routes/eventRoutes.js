const express = require('express');
const router = express.Router();
const { getEvents, getEventById, simulateEvent, deleteEvent } = require('../controllers/eventController');

router.get('/', getEvents);
router.get('/:id', getEventById);
router.post('/simulate', simulateEvent);
router.delete('/:id', deleteEvent);

module.exports = router;
