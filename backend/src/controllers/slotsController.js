import db from '../db/index.js';
import { availability, bookings, eventTypes } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { addMinutes, format, isBefore, isAfter, isEqual, parseISO, parse } from 'date-fns';

export const getAvailableSlots = async (req, res) => {
  try {
    const { event_slug, date } = req.query;

    if (!event_slug || !date) {
      return res.status(400).json({ error: 'event_slug and date are required' });
    }

    // 1. Fetch Event Type to get duration and userId
    const [eventType] = await db.select().from(eventTypes).where(eq(eventTypes.slug, event_slug));
    
    if (!eventType) return res.status(404).json({ error: 'Event type not found' });
    const { duration, userId } = eventType;

    // 2. Fetch User's Default Schedule
    const [schedule] = await db.select().from(schedules).where(and(eq(schedules.userId, userId), eq(schedules.isDefault, true)));
    if (!schedule) return res.json([]);

    const targetDateStr = date; // 'yyyy-MM-dd'
    const targetDate = parseISO(date);
    const dayOfWeek = targetDate.getDay();

    // 3. Fetch Availability (Day slots or Overrides)
    let daySlots = [];
    
    // Check for overrides first
    const overrides = await db.select().from(dateOverrides).where(
      and(eq(dateOverrides.scheduleId, schedule.id), eq(dateOverrides.overrideDate, targetDateStr))
    );

    if (overrides.length > 0) {
      daySlots = overrides.map(o => ({ startTime: o.startTime, endTime: o.endTime }));
    } else {
      daySlots = await db.select().from(availability).where(
        and(eq(availability.scheduleId, schedule.id), eq(availability.dayOfWeek, dayOfWeek))
      );
    }

    if (daySlots.length === 0) return res.json([]);

    // 4. Fetch Existing Bookings
    const existingBookings = await db.select().from(bookings).where(
      and(eq(bookings.eventTypeId, eventType.id), eq(bookings.bookingDate, targetDate))
    );

    // 5. Generate Slots
    const slots = [];
    const now = new Date();

    for (const range of daySlots) {
      const availStart = parse(`${date} ${range.startTime}`, 'yyyy-MM-dd HH:mm:ss', new Date());
      const availEnd = parse(`${date} ${range.endTime}`, 'yyyy-MM-dd HH:mm:ss', new Date());

      let currentSlotStart = availStart;
      while (isBefore(addMinutes(currentSlotStart, duration), availEnd) || isEqual(addMinutes(currentSlotStart, duration), availEnd)) {
        const slotEnd = addMinutes(currentSlotStart, duration);

        let isAvailable = true;
        for (const booking of existingBookings) {
          const bStart = parse(`${date} ${booking.startTime}`, 'yyyy-MM-dd HH:mm:ss', new Date());
          const bEnd = parse(`${date} ${booking.endTime}`, 'yyyy-MM-dd HH:mm:ss', new Date());
          if ((isBefore(currentSlotStart, bEnd) || isEqual(currentSlotStart, bStart)) && (isAfter(slotEnd, bStart) || isEqual(slotEnd, bEnd))) {
            isAvailable = false;
            break;
          }
        }

        if (isAvailable && (isAfter(currentSlotStart, now) || targetDate.toDateString() !== now.toDateString())) {
          slots.push({
            start: format(currentSlotStart, 'HH:mm:ss'),
            end: format(slotEnd, 'HH:mm:ss'),
          });
        }
        currentSlotStart = addMinutes(currentSlotStart, duration);
      }
    }

    res.json(slots.sort((a, b) => a.start.localeCompare(b.start)));

  } catch (error) {
    console.error('Error calculating slots:', error);
    res.status(500).json({ error: 'Internal error' });
  }
};
