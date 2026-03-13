import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import eventTypesRoutes from './routes/eventTypes.js';
import availabilityRoutes from './routes/availability.js';
import bookingsRoutes from './routes/bookings.js';
import usersRoutes from './routes/users.js';

import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();

// Middleware
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// Basic health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

// Routes
app.use('/event-types', eventTypesRoutes);
app.use('/availability', availabilityRoutes);
app.use('/bookings', bookingsRoutes);
app.use('/users', usersRoutes);

export default app;
