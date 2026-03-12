import app from './app.js';
import db from './db/index.js';

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    // Attempt a simple query to verify the database connection
    // This assumes at least a successful connection is established
    await db.execute('SELECT 1');
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
