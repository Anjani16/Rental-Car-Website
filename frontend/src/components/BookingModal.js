// frontend/components/BookingModal.js
import React, { useState } from 'react';
import { FaCalendarAlt, FaClock } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const BookingModal = ({ car, onClose, onSubmit }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const navigate = useNavigate();

  const calculateHours = () => {
    if (!startDate || !endDate || !startTime || !endTime) return 0;
    
    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);
    const diffInMs = end - start;
    return Math.ceil(diffInMs / (1000 * 60 * 60)); // Convert ms to hours
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const hours = calculateHours();
    
    if (hours <= 0) {
      toast.error('Please select valid dates and times');
      return;
    }

    onSubmit({
      carId: car._id,
      startDate,
      endDate,
      startTime,
      endTime,
      hours,
      totalPrice: car.price * hours
    });

    toast.success('Booking request submitted successfully!');
    onClose();
    navigate('/renter/history');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content booking-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal-button" onClick={onClose}>
          ×
        </button>
        
        <h2>Book {car.brand} {car.model}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              <FaCalendarAlt /> Start Date
            </label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
          
          <div className="form-group">
            <label>
              <FaClock /> Start Time
            </label>
            <input 
              type="time" 
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label>
              <FaCalendarAlt /> End Date
            </label>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || new Date().toISOString().split('T')[0]}
              required
            />
          </div>
          
          <div className="form-group">
            <label>
              <FaClock /> End Time
            </label>
            <input 
              type="time" 
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>
          
          <div className="booking-summary">
            <p><strong>Duration:</strong> {calculateHours()} hours</p>
            <p><strong>Total Price:</strong> ${(car.price * calculateHours()).toFixed(2)}</p>
          </div>
          
          <button type="submit" className="proceed-button">
            Proceed with Booking
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;