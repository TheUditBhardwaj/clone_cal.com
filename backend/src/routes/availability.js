import express from 'express';
import {
  getAvailability,
  createAvailability,
  updateAvailability,
  deleteAvailability,
  getSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from '../controllers/availabilityController.js';
import { getAvailableSlots } from '../controllers/slotsController.js';

const router = express.Router();

// ── Slots (public) ──
router.get('/slots', getAvailableSlots);

// ── Schedules ──
router.get('/schedules', getSchedules);
router.get('/schedules/:id', getScheduleById);
router.post('/schedules', createSchedule);
router.put('/schedules/:id', updateSchedule);
router.delete('/schedules/:id', deleteSchedule);

// ── Legacy flat availability (backward-compatible) ──
router.get('/', getAvailability);
router.post('/', createAvailability);
router.put('/:id', updateAvailability);
router.delete('/:id', deleteAvailability);

export default router;
