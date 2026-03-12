import db from '../db/index.js';
import { availability } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export const getAvailability = async (req, res) => {
  try {
    const allAvailability = await db.select().from(availability);
    res.json(allAvailability);
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
};

export const createAvailability = async (req, res) => {
  try {
    const { userId, dayOfWeek, startTime, endTime, timezone } = req.body;

    if (!userId || dayOfWeek === undefined || !startTime || !endTime) {
      return res.status(400).json({ error: 'userId, dayOfWeek, startTime, and endTime are required' });
    }

    const [newAvailability] = await db.insert(availability).values({
      userId,
      dayOfWeek,
      startTime,
      endTime,
      timezone: timezone || 'UTC',
    }).returning();

    res.status(201).json(newAvailability);
  } catch (error) {
    console.error('Error creating availability:', error);
    res.status(500).json({ error: 'Failed to create availability' });
  }
};

export const updateAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { dayOfWeek, startTime, endTime, timezone } = req.body;

    const [updatedAvailability] = await db.update(availability)
      .set({
        dayOfWeek,
        startTime,
        endTime,
        timezone,
      })
      .where(eq(availability.id, parseInt(id)))
      .returning();

    if (!updatedAvailability) {
      return res.status(404).json({ error: 'Availability not found' });
    }

    res.json(updatedAvailability);
  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({ error: 'Failed to update availability' });
  }
};

export const deleteAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    const [deletedAvailability] = await db.delete(availability)
      .where(eq(availability.id, parseInt(id)))
      .returning();

    if (!deletedAvailability) {
      return res.status(404).json({ error: 'Availability not found' });
    }

    res.json({ message: 'Availability deleted successfully' });
  } catch (error) {
    console.error('Error deleting availability:', error);
    res.status(500).json({ error: 'Failed to delete availability' });
  }
};
