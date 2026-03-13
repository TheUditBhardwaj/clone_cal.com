import db from '../db/index.js';
import { bookings, eventTypes } from '../db/schema.js';
import { eq, and, or, lt, gt, lte, gte, inArray } from 'drizzle-orm';

export const getBookings = async (req, res) => {
  try {
    const allBookings = await db.select().from(bookings);
    res.json(allBookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

export const createBooking = async (req, res) => {
  try {
    const { eventTypeId, bookerName, bookerEmail, bookingDate, startTime, endTime } = req.body;

    if (!eventTypeId || !bookerName || !bookerEmail || !bookingDate || !startTime || !endTime) {
      return res.status(400).json({ error: 'Missing required booking fields' });
    }

    // 1. Identify the user who owns this event type
    const [eventType] = await db.select().from(eventTypes).where(eq(eventTypes.id, eventTypeId));
    if (!eventType) return res.status(404).json({ error: 'Event type not found' });
    const { userId } = eventType;

    // 2. Fetch all event type IDs for this user
    const userEvents = await db.select({ id: eventTypes.id }).from(eventTypes).where(eq(eventTypes.userId, userId));
    const userEventTypeIds = userEvents.map(e => e.id);

    // 3. Robust overlap check across ALL user events
    const overlappingBookings = await db.select().from(bookings).where(
      and(
        inArray(bookings.eventTypeId, userEventTypeIds),
        eq(bookings.bookingDate, new Date(bookingDate)),
        or(
          and(
            lt(bookings.startTime, endTime),
            gt(bookings.endTime, startTime)
          )
        )
      )
    );

    if (overlappingBookings.length > 0) {
      return res.status(400).json({ error: 'This time slot is already booked' });
    }

    const [newBooking] = await db.insert(bookings).values({
      eventTypeId,
      bookerName,
      bookerEmail,
      bookingDate: new Date(bookingDate),
      startTime,
      endTime,
      status: 'ACCEPTED',
    }).returning();

    res.status(201).json(newBooking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
};

export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const [deletedBooking] = await db.delete(bookings)
      .where(eq(bookings.id, parseInt(id)))
      .returning();

    if (!deletedBooking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
};
