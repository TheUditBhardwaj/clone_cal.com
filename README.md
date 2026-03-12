# CalCom Clone

A full-stack scheduling platform inspired by Cal.com.

## Stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite + TailwindCSS |
| Backend | Node.js + Express |
| Database | PostgreSQL (NeonDB) |
| ORM | Drizzle ORM |

## Getting Started

### Backend
```bash
cd backend
npm install
npm run db:push   # Push schema to NeonDB
npm run db:seed   # Seed with initial data
npm run dev       # Start on http://localhost:5001
```

### Frontend
```bash
cd frontend
npm install
npm run dev       # Start on http://localhost:5173
```

## Features

- **Admin Dashboard** — Manage all your scheduling settings
- **Event Types** — Create, edit, delete bookable event types with unique slugs
- **Availability** — Set your available days and hours per weekday
- **Bookings** — View upcoming/past bookings, cancel meetings
- **Public Booking Page** — `/book/:slug` — calendar, time slots, booking form

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/event-types` | List all event types |
| POST | `/event-types` | Create event type |
| PUT | `/event-types/:id` | Update event type |
| DELETE | `/event-types/:id` | Delete event type |
| GET | `/availability` | Get availability |
| POST | `/availability` | Add availability |
| PUT | `/availability/:id` | Update availability |
| DELETE | `/availability/:id` | Delete availability |
| GET | `/availability/slots?event_slug=&date=` | Get available time slots |
| GET | `/bookings` | Get all bookings |
| POST | `/bookings` | Create booking |
| DELETE | `/bookings/:id` | Cancel booking |

## Database

Tables: `users`, `event_types`, `availability`, `bookings`