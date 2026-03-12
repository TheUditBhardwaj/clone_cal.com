import { pgTable, serial, text, varchar, timestamp, integer, time, index } from 'drizzle-orm/pg-core';

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

export const availability = pgTable('availability', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  dayOfWeek: integer('day_of_week').notNull(), // 0 = Sunday, 1 = Monday, etc.
  startTime: time('start_time').notNull(), // 'HH:MM:SS'
  endTime: time('end_time').notNull(), // 'HH:MM:SS'
  timezone: varchar('timezone', { length: 100 }).notNull().default('UTC'),
}, (table) => {
  return {
    userIdIdx: index('avail_user_id_idx').on(table.userId),
  };
});

export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  eventTypeId: integer('event_type_id').references(() => eventTypes.id, { onDelete: 'cascade' }).notNull(),
  bookerName: varchar('booker_name', { length: 255 }).notNull(),
  bookerEmail: varchar('booker_email', { length: 255 }).notNull(),
  bookingDate: timestamp('booking_date').notNull(),
  startTime: time('start_time').notNull(), // 'HH:MM:SS'
  endTime: time('end_time').notNull(), // 'HH:MM:SS'
  status: varchar('status', { length: 50 }).notNull().default('ACCEPTED'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    eventTypeIdIdx: index('booking_event_type_id_idx').on(table.eventTypeId),
    bookingDateIdx: index('booking_date_idx').on(table.bookingDate),
  };
});
