import express from 'express';
import db from '../db/index.js';
import { users } from '../db/schema.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const allUsers = await db.select().from(users);
    res.json(allUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;
