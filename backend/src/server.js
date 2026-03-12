import app from './app.js';
import { pool } from './db/index.js';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Quick DB connectivity check using the raw pool
    await pool.query('SELECT 1');
    console.log('Database connected successfully.');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to the database or start server:', error);
    process.exit(1);
  }
};

startServer();
