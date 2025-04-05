import express from 'express';
import Booking from '../models/Booking.js';
import Car from '../models/Car.js';
import Notification from '../models/Notification.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Create a new booking
router.post('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const renterId = decoded.userId;

    const { carId, startDate, endDate, startTime, endTime, hours, totalPrice } = req.body;

    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ message: 'Car not found' });

    // Check if car is available
    if (car.availability !== 'Available') {
      return res.status(400).json({ message: 'Car is not available for booking' });
    }

    const booking = new Booking({
      car: carId,
      renter: renterId,
      owner: car.userId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      startTime,
      endTime,
      hours,
      totalPrice,
      status: 'pending'
    });

    await booking.save();

    // Create notification for owner
    const renter = await User.findById(renterId);
    await Notification.create({
      userId: car.userId,
      message: `${renter.username} requested to book your ${car.brand} ${car.model}`,
      type: 'booking_request',
      relatedBooking: booking._id
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get bookings for a user (owner or renter)
router.get('/user', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const bookings = await Booking.find({
      $or: [{ renter: userId }, { owner: userId }]
    })
      .populate('car', 'brand model image price')
      .populate('renter', 'username email')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update booking status (approve/reject)
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Only owner can update status
    if (booking.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    booking.status = status;
    await booking.save();

    // Create notification for renter
    await Notification.create({
      userId: booking.renter,
      message: `Your booking for ${booking.car.brand} ${booking.car.model} has been ${status}`,
      type: `booking_${status}`,
      relatedBooking: booking._id
    });

    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;