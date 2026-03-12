import express from 'express';
import {
  getEventTypes,
  createEventType,
  updateEventType,
  deleteEventType,
} from '../controllers/eventTypeController.js';

const router = express.Router();

router.get('/', getEventTypes);
router.post('/', createEventType);
router.put('/:id', updateEventType);
router.delete('/:id', deleteEventType);

export default router;
