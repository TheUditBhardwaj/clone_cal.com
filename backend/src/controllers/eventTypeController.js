import db from '../db/index.js';
import { eventTypes } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import slugify from 'slugify';

export const getEventTypes = async (req, res) => {
  try {
    const allEventTypes = await db.select().from(eventTypes);
    res.json(allEventTypes);
  } catch (error) {
    console.error('Error fetching event types:', error);
    res.status(500).json({ error: 'Failed to fetch event types' });
  }
};

export const createEventType = async (req, res) => {
  try {
    const { title, description, duration, slug, userId } = req.body;

    if (!title || !duration || !userId) {
      return res.status(400).json({ error: 'Title, duration, and userId are required' });
    }

    // Generate slug if not provided
    const generatedSlug = slug || slugify(title, { lower: true, strict: true });

    // Check if slug already exists
    const existing = await db.select().from(eventTypes).where(eq(eventTypes.slug, generatedSlug));
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Event type with this slug already exists. Please choose another.' });
    }

    const [newEvent] = await db.insert(eventTypes).values({
      title,
      description,
      duration,
      slug: generatedSlug,
      userId,
    }).returning();

    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Error creating event type:', error);
    res.status(500).json({ error: 'Failed to create event type' });
  }
};

export const updateEventType = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, duration, slug } = req.body;

    // Check if updating slug and if it exists
    if (slug) {
      const existing = await db.select().from(eventTypes).where(eq(eventTypes.slug, slug));
      if (existing.length > 0 && existing[0].id !== parseInt(id)) {
        return res.status(400).json({ error: 'Slug already taken by another event type' });
      }
    }

    const [updatedEvent] = await db.update(eventTypes)
      .set({
        title,
        description,
        duration,
        slug,
      })
      .where(eq(eventTypes.id, parseInt(id)))
      .returning();

    if (!updatedEvent) {
      return res.status(404).json({ error: 'Event type not found' });
    }

    res.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event type:', error);
    res.status(500).json({ error: 'Failed to update event type' });
  }
};

export const deleteEventType = async (req, res) => {
  try {
    const { id } = req.params;

    const [deletedEvent] = await db.delete(eventTypes)
      .where(eq(eventTypes.id, parseInt(id)))
      .returning();

    if (!deletedEvent) {
      return res.status(404).json({ error: 'Event type not found' });
    }

    res.json({ message: 'Event type deleted successfully' });
  } catch (error) {
    console.error('Error deleting event type:', error);
    res.status(500).json({ error: 'Failed to delete event type' });
  }
};
