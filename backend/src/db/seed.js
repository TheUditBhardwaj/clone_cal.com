import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { users, eventTypes, availability, bookings, schedules, dateOverrides } from './schema.js';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function seed() {
  console.log('Seeding database...');
  try {
    // Clear existing data
    await db.delete(bookings);
    await db.delete(dateOverrides);
    await db.delete(availability);
    await db.delete(schedules);
    await db.delete(eventTypes);
    await db.delete(users);

    // 1. User
    console.log('Seeding user...');
    const [user] = await db.insert(users).values({
      name: 'Udit Bhardwaj',
      email: 'udit@example.com',
      timezone: 'Asia/Kolkata',
    }).returning();

    // 2. Event Types
    console.log('Seeding event types...');
    const createdEvents = await db.insert(eventTypes).values([
      {
        userId: user.id,
        title: '30 Min Meeting',
        description: 'A quick 30-minute catch up',
        duration: 30,
        slug: '30min',
      },
      {
        userId: user.id,
        title: 'Strategy Session',
        description: 'Deep dive into strategy and planning',
        duration: 60,
        slug: 'strategy',
      },
      {
        userId: user.id,
        title: 'Quick Catch-up',
        description: '15 minute sync for status updates',
        duration: 15,
        slug: 'quick-sync',
      },
      {
        userId: user.id,
        title: 'Technical Interview',
        description: 'Screening for engineering candidates',
        duration: 45,
        slug: 'tech-interview',
      }
    ]).returning();

    const [event1, event2, event3, event4] = createdEvents;

    // 3. Schedule (Working hours)
    console.log('Seeding schedule...');
    const [schedule] = await db.insert(schedules).values({
      userId: user.id,
      name: 'Working hours',
      isDefault: true,
      timezone: 'Asia/Kolkata',
    }).returning();

    // 4. Availability slots (Mon-Fri 9-5)
    console.log('Seeding availability...');
    const availabilityRecords = [];
    for (let i = 1; i <= 5; i++) {
      availabilityRecords.push({
        scheduleId: schedule.id,
        userId: user.id,
        dayOfWeek: i,
        startTime: '09:00:00',
        endTime: '17:00:00',
        timezone: 'Asia/Kolkata',
      });
    }
    await db.insert(availability).values(availabilityRecords);

    // 5. Bookings
    console.log('Seeding bookings...');
    const today = new Date();
    
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const dayAfter = new Date(today);
    dayAfter.setDate(today.getDate() + 2);

    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    await db.insert(bookings).values([
      {
        eventTypeId: event1.id,
        bookerName: 'Alice Smith',
        bookerEmail: 'alice@test.com',
        bookingDate: tomorrow,
        startTime: '10:00:00',
        endTime: '10:30:00',
        status: 'ACCEPTED',
      },
      {
        eventTypeId: event1.id,
        bookerName: 'Bob Jones',
        bookerEmail: 'bob@test.com',
        bookingDate: tomorrow,
        startTime: '13:00:00',
        endTime: '13:30:00',
        status: 'ACCEPTED',
      },
      {
        eventTypeId: event2.id,
        bookerName: 'Charlie Brown',
        bookerEmail: 'charlie@test.com',
        bookingDate: dayAfter,
        startTime: '14:00:00',
        endTime: '15:00:00',
        status: 'ACCEPTED',
      },
      {
        eventTypeId: event3.id,
        bookerName: 'David Wilson',
        bookerEmail: 'david@test.com',
        bookingDate: nextWeek,
        startTime: '09:30:00',
        endTime: '09:45:00',
        status: 'ACCEPTED',
      },
      {
        eventTypeId: event4.id,
        bookerName: 'Eve Adams',
        bookerEmail: 'eve@test.com',
        bookingDate: dayAfter,
        startTime: '11:00:00',
        endTime: '11:45:00',
        status: 'ACCEPTED',
      }
    ]);

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await pool.end();
  }
}

seed();
