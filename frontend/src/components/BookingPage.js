// frontend/pages/BookingPage.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BookingModal from '../components/BookingModal';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5555";

const BookingPage = () => {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/cars/${id}`);
        setCar(res.data);
      } catch (err) {
        console.error('Failed to fetch car details', err);
        navigate('/cart');
      } finally {
        setLoading(false);
      }
    };

    fetchCarDetails();
  }, [id, navigate]);

  const handleBookingSubmit = async (bookingData) => {
    try {
      await axios.post(`${API_BASE_URL}/api/bookings`, bookingData);
    } catch (err) {
      console.error("Booking failed:", err);
    }
  };

  if (loading) return <div>Loading car details...</div>;

  return (
    <BookingModal 
      car={car} 
      onClose={() => navigate('/cart')} 
      onSubmit={handleBookingSubmit} 
    />
  );
};

export default BookingPage;
