import { pgTable, serial, text, varchar, timestamp, integer, time, index, boolean, date } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  timezone: varchar('timezone', { length: 100 }).notNull().default('UTC'),
});

export const eventTypes = pgTable('event_types', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  duration: integer('duration').notNull(), // in minutes
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    slugIdx: index('slug_idx').on(table.slug),
    userIdIdx: index('event_user_id_idx').on(table.userId),
  };
});

// ── Schedules: named availability sets (e.g. "Working hours") ──
export const schedules = pgTable('schedules', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull().default('Working hours'),
  isDefault: boolean('is_default').notNull().default(false),
  timezone: varchar('timezone', { length: 100 }).notNull().default('Asia/Kolkata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index('schedule_user_id_idx').on(table.userId),
  };
});

// ── Availability: per-day time slots linked to a schedule ──
export const availability = pgTable('availability', {
  id: serial('id').primaryKey(),
  scheduleId: integer('schedule_id').references(() => schedules.id, { onDelete: 'cascade' }).notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  dayOfWeek: integer('day_of_week').notNull(), // 0 = Sunday, 6 = Saturday
  startTime: time('start_time').notNull(),
  endTime: time('end_time').notNull(),
  timezone: varchar('timezone', { length: 100 }).notNull().default('UTC'),
}, (table) => {
  return {
    userIdIdx: index('avail_user_id_idx').on(table.userId),
    scheduleIdIdx: index('avail_schedule_id_idx').on(table.scheduleId),
  };
});

// ── Date overrides: single-day changes to a schedule ──
export const dateOverrides = pgTable('date_overrides', {
  id: serial('id').primaryKey(),
  scheduleId: integer('schedule_id').references(() => schedules.id, { onDelete: 'cascade' }).notNull(),
  overrideDate: date('override_date').notNull(),
  startTime: time('start_time').notNull(),
  endTime: time('end_time').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    scheduleIdIdx: index('override_schedule_id_idx').on(table.scheduleId),
  };
});

export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  eventTypeId: integer('event_type_id').references(() => eventTypes.id, { onDelete: 'cascade' }).notNull(),
  bookerName: varchar('booker_name', { length: 255 }).notNull(),
  bookerEmail: varchar('booker_email', { length: 255 }).notNull(),
  bookingDate: timestamp('booking_date').notNull(),
  startTime: time('start_time').notNull(),
  endTime: time('end_time').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('ACCEPTED'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    eventTypeIdIdx: index('booking_event_type_id_idx').on(table.eventTypeId),
    bookingDateIdx: index('booking_date_idx').on(table.bookingDate),
  };
});
