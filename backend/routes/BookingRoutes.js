import express from 'express';
import Booking from '../models/Booking.js';
import Car from '../models/Car.js';
import User from '../models/User.js';
import { BookingStatus, NotificationTypes } from '../Constant.js';
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
      status: BookingStatus.PENDING
    });

    await booking.save();

    await Car.findByIdAndUpdate(carId, {
      $pull: { cartedBy: { userId: renterId } }
    });

    // Create notification for owner
    const renter = await User.findById(renterId);
    console.log(car);
    const notification = new  Notification({
      userId: car.userId,
      message: `${renter.username} requested to book your ${car.brand} ${car.model}`,
      type: NotificationTypes.REQUEST,
      relatedBooking: booking._id
    });
    await notification.save();
    res.status(201).json({
      message: 'Booking successfully created!',
      booking,
    });

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
      .populate('renter', 'firstName phoneNumber email')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get renter's booking history (renter only)
router.get('/renterhistory', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const renterId = decoded.userId;

    // Fetch only bookings where the logged-in user is the renter
    const bookings = await Booking.find({ renter: renterId })
      .populate('car', 'brand model image price') // Populate car details
      .populate('owner', 'username email') // Populate owner details
      .sort({ createdAt: -1 }); // Sort by the most recent booking first

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
    await booking.populate('car', 'brand model');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Only owner can update status
    if (booking.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (!booking.car._id || !booking.startDate || !booking.endDate || !booking.startTime || !booking.endTime || !booking.hours || !booking.totalPrice) {
      return res.status(400).json({ message: 'Missing required booking fields' });
    }

    booking.status = status;

    const validStatuses = ['approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status update' });
    }
    await booking.save();

    // Create notification for renter
    await Notification.create({
      userId: booking.renter,
      message: `Your booking for ${booking.car.brand} ${booking.car.model} has been ${status}`,
      type: status === BookingStatus.APPROVED
        ? NotificationTypes.APPROVED
        : NotificationTypes.REJECTED,
      // type: `booking_${status}`,
      relatedBooking: booking._id
    });

    res.json(booking);
  } catch (error) {
    console.error('Booking creation failed:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;