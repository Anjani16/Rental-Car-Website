import React, { useEffect, useState } from 'react';
import { fetchWishlistedCars } from '../api'; // Function to fetch wishlisted cars
import '../styles/Wishlist.css';

const Cart = () => {
  const [wishlistedCars, setWishlistedCars] = useState([]);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const cars = await fetchWishlistedCars();
        setWishlistedCars(cars);
      } catch (error) {
        console.error('Error fetching wishlisted cars:', error);
      }
    };
    fetchCars();
  }, []);

  return (
    <div className="wishlist">
      <h2>Your Cart</h2>
      {wishlistedCars.length === 0 ? (
        <p>No cars added to your cart yet.</p>
      ) : (
        <div className="car-grid">
          {wishlistedCars.map((car) => (
            <div key={car._id} className="car-tile">
              <img 
  src={`${process.env.REACT_APP_BACKEND_URL.replace(/\/$/, '')}/${car.image.replace(/^\//, '')}`} 
  alt={`${car.brand} ${car.model}`} 
  className="car-image" 
/>
              <h3>{car.brand} {car.model}, {car.year}</h3>
              <p className="car-price">${car.price}/hr</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Cart;
