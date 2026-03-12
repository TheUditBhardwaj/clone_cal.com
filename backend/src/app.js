import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import eventTypesRoutes from './routes/eventTypes.js';
import availabilityRoutes from './routes/availability.js';
import bookingsRoutes from './routes/bookings.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

// Routes
app.use('/event-types', eventTypesRoutes);
app.use('/availability', availabilityRoutes);
app.use('/bookings', bookingsRoutes);

export default app;
