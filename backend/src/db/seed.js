import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { users, eventTypes, availability, bookings } from './schema.js';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function seed() {
  console.log('Seeding database...');
  try {
    // Clear existing data (optional, but good for idempotency during development)
    await db.delete(bookings);
    await db.delete(availability);
    await db.delete(eventTypes);
    await db.delete(users);

    // 1 User
    console.log('Seeding user...');
    const [user] = await db.insert(users).values({
      name: 'Udit Bhardwaj',
      email: 'udit@example.com',
      timezone: 'America/New_York',
    }).returning();

    // 2 Event Types
    console.log('Seeding event types...');
    const [event1, event2] = await db.insert(eventTypes).values([
      {
        userId: user.id,
        title: '30 Min Meeting',
        description: 'A quick 30-minute catch up',
        duration: 30, // 30 minutes
        slug: '30min-meeting',
      },
      {
        userId: user.id,
        title: '1 Hour Strategy Session',
        description: 'Deep dive into strategy',
        duration: 60, // 60 minutes
        slug: '60min-strategy',
      }
    ]).returning();

    // Availability for User (Weekdays 9 AM to 5 PM)
    console.log('Seeding availability...');
    const availabilityRecords = [];
    for (let i = 1; i <= 5; i++) { // Monday to Friday
      availabilityRecords.push({
        userId: user.id,
        dayOfWeek: i,
        startTime: '09:00:00',
        endTime: '17:00:00',
        timezone: user.timezone,
      });
    }
    await db.insert(availability).values(availabilityRecords);

    // 3 Bookings
    console.log('Seeding bookings...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);

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
