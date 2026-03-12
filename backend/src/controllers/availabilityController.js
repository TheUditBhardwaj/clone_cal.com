import db from '../db/index.js';
import { schedules, availability, dateOverrides } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';

// ─── Schedules CRUD ───

export const getSchedules = async (req, res) => {
  try {
    const all = await db.select().from(schedules);
    // For each schedule, fetch its availability slots
    const result = await Promise.all(all.map(async (s) => {
      const slots = await db.select().from(availability).where(eq(availability.scheduleId, s.id));
      const overrides = await db.select().from(dateOverrides).where(eq(dateOverrides.scheduleId, s.id));
      return { ...s, days: slots, overrides };
    }));
    res.json(result);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
};

export const getScheduleById = async (req, res) => {
  try {
    const { id } = req.params;
    const [schedule] = await db.select().from(schedules).where(eq(schedules.id, parseInt(id)));
    if (!schedule) return res.status(404).json({ error: 'Schedule not found' });

    const slots = await db.select().from(availability).where(eq(availability.scheduleId, schedule.id));
    const overrides = await db.select().from(dateOverrides).where(eq(dateOverrides.scheduleId, schedule.id));
    res.json({ ...schedule, days: slots, overrides });
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
};

export const createSchedule = async (req, res) => {
  try {
    const { userId = 1, name = 'Working hours', timezone = 'Asia/Kolkata', isDefault = false, days = [] } = req.body;

    // If marking as default, un-default others
    if (isDefault) {
      await db.update(schedules).set({ isDefault: false }).where(eq(schedules.userId, userId));
    }

    const [newSchedule] = await db.insert(schedules).values({
      userId, name, timezone, isDefault,
    }).returning();

    // Insert availability slots
    if (days.length > 0) {
      const slotsToInsert = [];
      for (const day of days) {
        if (day.enabled && day.slots?.length > 0) {
          for (const slot of day.slots) {
            slotsToInsert.push({
              scheduleId: newSchedule.id,
              userId,
              dayOfWeek: day.day,
              startTime: slot.start.length === 5 ? slot.start + ':00' : slot.start,
              endTime: slot.end.length === 5 ? slot.end + ':00' : slot.end,
              timezone,
            });
          }
        }
      }
      if (slotsToInsert.length > 0) {
        await db.insert(availability).values(slotsToInsert);
      }
    }

    // Return full schedule
    const slots = await db.select().from(availability).where(eq(availability.scheduleId, newSchedule.id));
    res.status(201).json({ ...newSchedule, days: slots, overrides: [] });
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({ error: 'Failed to create schedule' });
  }
};

export const updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const scheduleId = parseInt(id);
    const { name, timezone, isDefault, days = [], overrides = [] } = req.body;

    // Update schedule meta
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (timezone !== undefined) updates.timezone = timezone;
    if (isDefault !== undefined) updates.isDefault = isDefault;

    // If marking as default, un-default others
    if (isDefault) {
      const [current] = await db.select().from(schedules).where(eq(schedules.id, scheduleId));
      if (current) {
        await db.update(schedules).set({ isDefault: false }).where(eq(schedules.userId, current.userId));
      }
    }

    const [updated] = await db.update(schedules)
      .set(updates)
      .where(eq(schedules.id, scheduleId))
      .returning();

    if (!updated) return res.status(404).json({ error: 'Schedule not found' });

    // Replace availability slots
    await db.delete(availability).where(eq(availability.scheduleId, scheduleId));
    if (days.length > 0) {
      const slotsToInsert = [];
      for (const day of days) {
        if (day.enabled && day.slots?.length > 0) {
          for (const slot of day.slots) {
            slotsToInsert.push({
              scheduleId,
              userId: updated.userId,
              dayOfWeek: day.day,
              startTime: slot.start.length === 5 ? slot.start + ':00' : slot.start,
              endTime: slot.end.length === 5 ? slot.end + ':00' : slot.end,
              timezone: timezone || updated.timezone,
            });
          }
        }
      }
      if (slotsToInsert.length > 0) {
        await db.insert(availability).values(slotsToInsert);
      }
    }

    // Replace date overrides
    await db.delete(dateOverrides).where(eq(dateOverrides.scheduleId, scheduleId));
    if (overrides.length > 0) {
      const ovToInsert = overrides.map(ov => ({
        scheduleId,
        overrideDate: ov.date,
        startTime: ov.start.length === 5 ? ov.start + ':00' : ov.start,
        endTime: ov.end.length === 5 ? ov.end + ':00' : ov.end,
      }));
      await db.insert(dateOverrides).values(ovToInsert);
    }

    // Return full schedule
    const newSlots = await db.select().from(availability).where(eq(availability.scheduleId, scheduleId));
    const newOverrides = await db.select().from(dateOverrides).where(eq(dateOverrides.scheduleId, scheduleId));
    res.json({ ...updated, days: newSlots, overrides: newOverrides });
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ error: 'Failed to update schedule' });
  }
};

export const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const [deleted] = await db.delete(schedules).where(eq(schedules.id, parseInt(id))).returning();
    if (!deleted) return res.status(404).json({ error: 'Schedule not found' });
    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({ error: 'Failed to delete schedule' });
  }
};

// ─── Legacy flat availability (still used by slot calculator) ───

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
    const { userId, dayOfWeek, startTime, endTime, timezone, scheduleId } = req.body;
    if (!userId || dayOfWeek === undefined || !startTime || !endTime) {
      return res.status(400).json({ error: 'userId, dayOfWeek, startTime, and endTime are required' });
    }

    // If no schedule, try to find the user's default
    let sid = scheduleId;
    if (!sid) {
      const [defSched] = await db.select().from(schedules).where(
        and(eq(schedules.userId, userId), eq(schedules.isDefault, true))
      );
      if (defSched) sid = defSched.id;
    }
    if (!sid) {
      return res.status(400).json({ error: 'No scheduleId provided and no default schedule found' });
    }

    const [newAvailability] = await db.insert(availability).values({
      scheduleId: sid, userId, dayOfWeek, startTime, endTime, timezone: timezone || 'UTC',
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
      .set({ dayOfWeek, startTime, endTime, timezone })
      .where(eq(availability.id, parseInt(id)))
      .returning();
    if (!updatedAvailability) return res.status(404).json({ error: 'Availability not found' });
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
    if (!deletedAvailability) return res.status(404).json({ error: 'Availability not found' });
    res.json({ message: 'Availability deleted successfully' });
  } catch (error) {
    console.error('Error deleting availability:', error);
    res.status(500).json({ error: 'Failed to delete availability' });
  }
};
