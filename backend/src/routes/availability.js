import express from 'express';
import {
  getAvailability,
  createAvailability,
  updateAvailability,
  deleteAvailability,
} from '../controllers/availabilityController.js';
import { getAvailableSlots } from '../controllers/slotsController.js';

const router = express.Router();

router.get('/slots', getAvailableSlots);
router.get('/', getAvailability);
router.post('/', createAvailability);
router.put('/:id', updateAvailability);
router.delete('/:id', deleteAvailability);

export default router;
