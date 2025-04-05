// backend/routes/NotificationRoutes.js
import express from 'express';
import Notification from '../models/Notification.js';

const router = express.Router();

router.get('/:userId', async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;