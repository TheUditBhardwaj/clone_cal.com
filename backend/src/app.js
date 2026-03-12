import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import eventTypesRoutes from './routes/eventTypes.js';

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

export default app;
