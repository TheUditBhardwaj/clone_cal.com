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
    
    if (!eventType) {
      return res.status(404).json({ error: 'Event type not found' });
    }

    const { duration, userId } = eventType;

    // 2. Determine Day of Week from requested date
    const targetDate = parseISO(date); // e.g. "2023-11-20"
    const dayOfWeek = targetDate.getDay(); // 0-6 (Sunday-Saturday)

    // 3. Fetch Availability for that User and Day of Week
    const [userAvailability] = await db.select().from(availability).where(
      and(
        eq(availability.userId, userId),
        eq(availability.dayOfWeek, dayOfWeek)
      )
    );

    if (!userAvailability) {
      return res.json([]); // No availability on this day
    }

    const { startTime, endTime } = userAvailability;

    // Parse availability times into Date objects for the target date
    const availStart = parse(`${date} ${startTime}`, 'yyyy-MM-dd HH:mm:ss', new Date());
    const availEnd = parse(`${date} ${endTime}`, 'yyyy-MM-dd HH:mm:ss', new Date());

    // 4. Fetch Existing Bookings for that Event Type on that Date
    const existingBookings = await db.select().from(bookings).where(
      and(
        eq(bookings.eventTypeId, eventType.id),
        eq(bookings.bookingDate, targetDate)
      )
    );

    // 5. Generate Potential Slots
    const slots = [];
    let currentSlotStart = availStart;

    while (isBefore(addMinutes(currentSlotStart, duration), availEnd) || isEqual(addMinutes(currentSlotStart, duration), availEnd)) {
      const slotEnd = addMinutes(currentSlotStart, duration);

      // 6. Check for collisions with existing bookings
      let isAvailable = true;
      for (const booking of existingBookings) {
        const bookingStart = parse(`${date} ${booking.startTime}`, 'yyyy-MM-dd HH:mm:ss', new Date());
        const bookingEnd = parse(`${date} ${booking.endTime}`, 'yyyy-MM-dd HH:mm:ss', new Date());

        // A slot is unavailable if it overlaps with an existing booking
        if (
          (isBefore(currentSlotStart, bookingEnd) || isEqual(currentSlotStart, bookingStart)) &&
          (isAfter(slotEnd, bookingStart) || isEqual(slotEnd, bookingEnd))
        ) {
          isAvailable = false;
          break;
        }
      }

      if (isAvailable) {
        // Only return future slots if the requested date is today
        const now = new Date();
        if (isAfter(currentSlotStart, now) || targetDate.toDateString() !== now.toDateString()) {
           slots.push({
            start: format(currentSlotStart, 'HH:mm:ss'),
            end: format(slotEnd, 'HH:mm:ss'),
          });
        }
      }

      // Move to the next potential slot (e.g., every 30 mins)
      // For simplicity, we step by the duration of the event
      currentSlotStart = addMinutes(currentSlotStart, duration);
    }

    res.json(slots);

  } catch (error) {
    console.error('Error calculating time slots:', error);
    res.status(500).json({ error: 'Failed to calculate available time slots' });
  }
};
